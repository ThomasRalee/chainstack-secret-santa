<template lang="pug">
  v-container
    v-row(cols='12')
      v-btn.ma-2(outlined)
        v-icon(left) mdi-plus
        |  Secret Santa Event
    v-row(cols='12')
      v-form.full-width(v-if="state === 'registration'", ref='form', v-model='valid')
        v-text-field(v-model='name', :rules="[v => !!v || 'Name is required']", label='Name', required)
        v-btn.mr-4(:disabled='!valid', color='success', @click='create')
          | Create
      div(v-else-if="state === 'waitingForConfirmation'")
        h3 Please confirm the transaction on MetaMask.
      div(v-else-if="state === 'waitingForMined'")
        h3 Please be patient while your transaction is getting Mined.
    ContractLink(
      v-for='(event, key) in events',
      :key="'event'+key",
      :event="event",
      @removed="getEvents",
    )
</template>

<script>
import { zip } from 'ramda';
import { mapGetters } from 'vuex';
import ContractLink from '@/components/ContractLink.vue';
import { getSantaContract } from '@/utils/web3';

export default {
  name: 'home',

  components: {
    ContractLink,
  },

  computed: {
    ...mapGetters({
      account: 'account',
      contract: 'contractInstance',
    }),
  },

  data: () => ({
    name: null,
    events: [],
    valid: false,
    state: 'registration',
  }),

  created() {
    this.getEvents();
  },

  methods: {
    async create() {
      this.state = 'waitingForConfirmation';
      const onSubmit = error => this.state = error ? 'default' : 'waitingForMined';

      await this.contract()
        .methods.newSecretSantaEvent(this.name)
        .send({
          gas: 3000000,
          from: this.account,
        }, onSubmit.bind(this))
        .on('receipt', () => this.state = 'default')
        .on('error', (error) => {
          window.$eventHub.$emit('showAlert', {
            message: 'Error processing transaction.',
            type: 'error',
          });
        });

      this.getEvents();
    },

    getSecretSantaEvent(address) {
      return this.contract().methods
        .getSecretSantaEvent(address)
        .call({ from: this.account })
        .then(event => event);
    },

    async getSecretSantaDetails(address) {
      const contract = await getSantaContract(address);

      return contract.methods
        .getEventStatus()
        .call({ from: this.account })
        .then(details => details);
    },

    async getEvents() {
      const tasks = await this.contract().methods.getSecretSantaEvents().call()
        .then(events => events.map(address => {
          return this.getSecretSantaEvent(address);
        }));

      Promise.all(tasks).then((events) => {
        const contractDetails = events.map(event => {
          return this.getSecretSantaDetails(event[0]);
        });

        Promise.all(contractDetails).then(details => {
          this.events = zip(events, details).map(secretSantaEvent => ({
            contractAdress: secretSantaEvent[0][0],
            owner: secretSantaEvent[0][1],
            name: secretSantaEvent[0][2],
            created_at: secretSantaEvent[0][3],
            participants: secretSantaEvent[1][0],
            isOpen: secretSantaEvent[1][1],
          }));
        });
      });
    },
  },
}
</script>
