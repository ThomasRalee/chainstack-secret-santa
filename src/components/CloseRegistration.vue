<template lang="pug">
  div
    v-btn(
      v-if="state === 'default'",
      color="primary",
      @click="closeRegistration",
    ) Close Registration
    div(v-else-if="state === 'waitingForConfirmation'")
      h3 Please confirm the transaction on MetaMask.
    div(v-else-if="state === 'waitingForMined'")
      h3 Please be patient while your transaction is getting Mined.

</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data: () => ({
    state: 'default',
  }),

  computed: {
    ...mapGetters({
      account: 'account',
      contract: 'santaContractInstance',
    }),
  },

  methods: {
    async closeRegistration() {
      this.state = 'waitingForConfirmation';
      const onSubmit = error => this.state = error ? 'default' : 'waitingForMined';

      await this.contract()
        .methods.closeRegistration()
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

        this.$emit('close');
    },
  },
}
</script>