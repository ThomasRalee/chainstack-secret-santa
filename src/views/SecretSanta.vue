<template lang="pug">
  v-layout(text-center, wrap)
    v-flex(xs12)
      div(v-if="isLoading")
        v-progress-circular.ma-auto(v-if='isLoading', :size='50', color='primary', indeterminate)

      div.text-msg(v-else-if="!isOpen")
        | Your secret Santa is
        |
        code {{ secretSanta.name }}
        | , he/she wants {{ secretSanta.wishlist }} for Christmas!

      div(v-else)
        v-form.full-width(v-if="state === 'default'", ref='form', v-model='valid')
          v-text-field(label='Your name', v-model='form.name', :rules="[v => !!v || 'Hey! Enter your name, please.']")
          v-text-field(label='Wishlist', v-model='form.wishlist', :rules="[v => !!v || 'Dont forget your wishlist.']")
          v-btn.mt-5(:disabled='!valid', color='primary', @click='register')
            | {{ registered ? 'Update' : 'Submit' }}

        div.text-msg(v-else-if="state === 'waitingForConfirmation'")
          v-progress-circular.ma-auto.mb-4(:size='40', color='primary', indeterminate)
          br
          | Please confirm the transaction on MetaMask.

        div.text-msg(v-else-if="state === 'waitingForMined'")
          v-progress-circular.ma-auto.mb-4(:size='40', color='primary', indeterminate)
          br
          | Processing your request...

        div.text-msg(v-else-if="state === 'final'")
          | Thank you for participating,
          |
          code {{ name }}
          | !
          br
          | Please be patient while waiting for other participants.
          div.mt-4
            v-btn(@click="state = 'default'", color='primary') Edit details

      v-progress-circular(v-else, :size='50', color='primary', indeterminate)

      div.mt-12(v-if="isOwner && isOpen")
        div
          Participant(
            v-for="(participant, key) in participants",
            :key="'participant'+key",
            :participant="participant",
            @removed="checkOwner",
          )
        CloseRegistration.mt-8(
          @close="getSecretSanta",
        )
</template>

<script>
import { isEmpty, mergeRight } from 'ramda';
import { mapGetters } from 'vuex';
import CloseRegistration from '@/components/CloseRegistration.vue';
import Participant from '@/components/Participant.vue';

export default {
  name: 'MainContract',

  components: {
    CloseRegistration,
    Participant,
  },

  beforeCreate() {
    this.$store.dispatch('initWeb3').then(() => {
      this.$store.dispatch('initSantaContract', this.$route.params.id);
    });
  },

  data: () => ({
    valid: false,
    isOwner: false,
    isOpen: true,
    registered: false,
    participants: [],
    name: '',
    form: {
      name: null,
      wishlist: null,
    },
    secretSanta: {
      name: null,
      wishlist: null,
    },
    state: null,
    isLoading: true,
  }),

  created() {
    setTimeout(() => {
      Promise.all([this.checkOwner(), this.getSecretSanta()]).then(() => {
        this.isLoading = false;
      });
    }, 2000);
  },

  computed: {
    ...mapGetters({
      account: 'account',
      contract: 'santaContractInstance',
    }),
  },

  methods: {
    async register() {
      this.state = 'waitingForConfirmation';
      const onSubmit = error =>
        (this.state = error ? 'default' : 'waitingForMined');

      await this.contract()
        .methods.register(this.form.name, this.form.wishlist)
        .send(
          {
            gas: 3000000,
            from: this.account,
          },
          onSubmit.bind(this),
        )
        .on('receipt', () => (this.state = 'final'))
        .on('error', error => {
          window.$eventHub.$emit('showAlert', {
            message: 'Error processing transaction.',
            type: 'error',
          });
        });

      if (this.isOwner) {
        this.getParticpants();
      }
    },

    async checkOwner() {
      await this.contract()
        .methods.getRegistration()
        .call({
          from: this.account,
        })
        .then(response => {
          this.registered = !isEmpty(response[0]);
          if (this.registered) {
            this.name = response[0];
            this.wishlist = response[1];
          }
        });

      await this.contract()
        .methods.isOwner()
        .call({
          from: this.account,
        })
        .then(isOwner => {
          this.isOwner = isOwner;
          if (this.isOwner) {
            this.getParticpants();
          }
        });
      this.state = this.registered ? 'final' : 'default';
    },

    getParticpant(address) {
      return this.contract()
        .methods.getParticpant(address)
        .call({ from: this.account })
        .then(participant => mergeRight(participant, { address: address }));
    },

    async getSecretSanta() {
      await this.contract()
        .methods.getSecretSanta()
        .call({
          from: this.account,
        })
        .then(secretSanta => {
          if (!isEmpty(secretSanta[0])) {
            this.secretSanta = {
              name: secretSanta[0],
              wishlist: secretSanta[1],
            };
            this.isOpen = false;
          }
        });
    },

    async getParticpants() {
      const tasks = await this.contract()
        .methods.getParticpants()
        .call()
        .then(participants =>
          participants.map(address => {
            return this.getParticpant(address);
          }),
        );

      Promise.all(tasks).then(participants => {
        this.participants = participants.map(participant => {
          return {
            name: participant[0],
            wishlist: participant[1],
            address: participant.address,
          };
        });
      });
    },
  },
};
</script>
