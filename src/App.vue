<template lang="pug">
  v-app
    v-app-bar(app, color='primary', dark)  
    v-content
      v-container(:class="{ 'fill-height': isLoading }")
        v-progress-circular.ma-auto(v-if='isLoading', :size='50', color='primary', indeterminate)
        router-view(v-else)
        v-snackbar(
          v-model="showAlert",
          :color="alertMessage.type",
          :timeout=3000,
        ) {{ alertMessage.message }}
          v-btn(dark, text, @click="showAlert = false") Close
</template>
<script>
export default {
  name: 'App',

  beforeCreate() {
    this.$store.dispatch('initWeb3').then(() => {
      this.$store.dispatch('initContract').then(() => {
        this.isLoading = false;
      });
    });
  },

  data: () => ({
    isLoading: true,
    showAlert: false,
    alertMessage: {},
  }),

  created() {
    window.$eventHub.$on('showAlert', this.showAlertSnackBar);
  },

  beforeDestroy() {
    window.$eventHub.$off('showAlert');
  },

  methods: {
    showAlertSnackBar(alert) {
      this.alertMessage = alert;
      this.showAlert = true;
    },
  },
};
</script>
