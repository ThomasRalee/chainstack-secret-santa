<template lang="pug">
  div
    v-btn(
      v-if="state === 'default'",
      text,
      color='primary',
      @click="closeRegistration",
    ) Close Registration

    div.text-msg(v-else-if="state === 'waitingForConfirmation'")
      v-progress-circular.ma-auto.mb-4(:size='40', color='primary', indeterminate)
      br
      | Please confirm the transaction on MetaMask.

    div.text-msg(v-else-if="state === 'waitingForMined'")
      v-progress-circular.ma-auto.mb-4(:size='40', color='primary', indeterminate)
      br
      | Processing your request...

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


<style lang="scss" scoped>
.text-msg {
  text-align: center;
  margin-top: 1rem;
}
</style>
