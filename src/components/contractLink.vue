<template lang="pug">
  v-banner(single-line)
    div(v-if="state === 'default'")
      router-link(
        :to="{ name:'secretSanta', params: { id: event.contractAdress } }"
      )
        | {{ event.name }}

      v-icon mdi-account-multiple
      b {{ event.participants }}
    
    p.mb-0(
      v-else-if="state === 'waitingForConfirmation'",
    ) Please confirm the transaction on MetaMask.
    p.mb-0(
      v-else-if="state === 'waitingForMined'",
    ) Please wait for the transaction to be mined.
    template(v-slot:actions)
      v-btn(
        v-if="showDelete",
        :loading="state === 'waitingForMined'",
        text,
        color='error',
        @click="removeContract(event.contractAdress)",
      )
        | Delete
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'contract-link',

  props: {
    event: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    state: 'default',
  }),

  computed: {
    ...mapGetters({
      account: 'account',
      contract: 'contractInstance',
    }),

    showDelete() {
      return this.event.owner === this.account && this.event.isOpen && this.state !== 'waitingForConfirmation';
    },
  },

  methods: {
    async removeContract(address) {
      this.state = 'waitingForConfirmation';
      const onSubmit = error => this.state = error ? 'default' : 'waitingForMined';

      await this.contract()
        .methods.deleteParticpant(address)
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

      this.$emit('removed');
    },
  },
};
</script>

<style lang="scss">
  .v-banner {
    .v-banner__content {
      min-height: 36px;
    }
  }
</style>
