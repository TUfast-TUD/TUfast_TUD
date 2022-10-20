<template>
  <lottie-player
    src="../../assets/settings/rocket_lottie.json"
    loop
    autoplay
    class="max-height"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import Onboarding from '../components/Onboarding.vue'

export default defineComponent({
  components: {
    // Onboarding
  },
  setup () {}
})
</script>

<style lang="sass" scoped>
.max-height
  max-height: 100%
</style>
