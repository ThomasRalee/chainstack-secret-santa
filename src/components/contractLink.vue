<template lang="pug">
  v-banner.event-list(single-line)
    div(v-if="state === 'default'")
      router-link(
        :to="{ name:'secretSanta', params: { id: event.contractAdress } }"
      )
        | {{ event.name }}

      v-icon.ml-4 mdi-account-multiple
      b {{ event.participants }}

    div.text-msg(v-else-if="state === 'waitingForConfirmation'")
      v-progress-circular.ma-auto.mb-4(:size='40', color='primary', indeterminate)
      br
      | Please confirm the transaction on MetaMask.

    div.text-msg(v-else-if="state === 'waitingForMined'")
      v-progress-circular.ma-auto.mb-4(:size='40', color='primary', indeterminate)
      br
      | Processing your request...

    template(v-slot:actions)
      v-btn(
        v-if="showDelete",
        :loading="state === 'waitingForMined'",
        text,
        color='error',
        @click="removeContract(event.contractAdress)",
      ) Delete
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
