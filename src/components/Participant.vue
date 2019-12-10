<template lang="pug">
  v-banner.event-list(single-line)
    span(v-if="state === 'default'") {{ participant.name }}

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
        v-if="state !== 'waitingForConfirmation'",
        :loading="state === 'waitingForMined'",
        text,
        color='error',
        @click="removeParticipant()",
      ) Delete
</template>

<script>

import { mapGetters } from 'vuex';

export default {
  props: {
    participant: {
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
      contract: 'santaContractInstance',
    }),
  },

  methods: {
    async removeParticipant() {
      this.state = 'waitingForConfirmation';
      const onSubmit = error => this.state = error ? 'default' : 'waitingForMined';

      await this.contract()
        .methods.deleteParticpant(this.participant.address)
        .send({
          gas: 3000000,
          from: this.account,
        }, onSubmit.bind(this))
        .on('receipt', () => {
          this.state = 'default';
          this.$emit('removed');
        })
        .on('error', (error) => {
          this.state = 'default';

          window.$eventHub.$emit('showAlert', {
            message: 'Error processing transaction.',
            type: 'error',
          });
        });
    },
  },
}
</script>

