<template lang="pug">
  v-app
    canvas.snow#snow
    v-container.app-container(:class="{ 'fill-height': isLoading }")
      div.app-logo
        | Powered by
        br
        a(href="/")
          img(src="https://chainstack.com/wp-content/uploads/2019/03/Logo-Blue@3x-Padded.png")

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



// Snowing
(function() {
  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  function makeSnow(el) {
    var ctx = el.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    
    var Particle = function() {
      this.x = this.y = this.dx = this.dy = 0;
      this.reset();
    }
    
    Particle.prototype.reset = function() {
      this.y = Math.random() * height;
      this.x = Math.random() * width;
      this.dx = (Math.random() * 1) - 0.5;
      this.dy = (Math.random() * 0.5) + 0.5;
    }
    
    function createParticles(count) {
      if (count != particles.length) {
        particles = [];
        for (var i = 0; i < count; i++) {
          particles.push(new Particle());
        }
      }
    }
        
    function onResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = width;
      el.height = height;
      
      createParticles((width * height) / 10000);
    }
    
    function updateParticles() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#fffa';
      
      particles.forEach(function(particle) {
        particle.y += particle.dy;
        particle.x += particle.dx;
        
        if (particle.y > height) {
          particle.y = 0;
        }
        
        if (particle.x > width) {
          particle.reset();
          particle.y = 0;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4.5 , 0, Math.PI * 2, false);
        ctx.fill();
      });
      
      window.requestAnimationFrame(updateParticles);
    }
    
    onResize();
    updateParticles();
    
    window.addEventListener('resize', onResize);
  }
  
  ready(function() {
    var canvas = document.getElementById('snow');
    makeSnow(canvas);
  });
})();
</script>
