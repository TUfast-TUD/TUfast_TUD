<template>
  <div class="onboarding-inner-info">
    <lottie-player
      :key="lottieSrc"
      :src="lottieSrc"
      background="transparent"
      speed="1"
      style="height: 340px"
      loop
      autoplay
    >
    </lottie-player>
    <h3>Weniger Klickstress</h3>
    <p class="txt-help">mit TUfast sparst du pro Semester<br />bis zu 90 Minuten und bis zu 2000 Klicks</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  setup() {
    const isDarkMode = ref(!document.documentElement.classList.contains('light'))

    let observer: MutationObserver | null = null

    onMounted(() => {
      observer = new MutationObserver(() => {
        const hasLight = document.documentElement.classList.contains('light')
        isDarkMode.value = !hasLight
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    })

    onUnmounted(() => {
      observer?.disconnect()
    })

    const lottieSrc = computed(() => {
      const src = isDarkMode.value
        ? '/assets/settings/onboarding-rocket-fordark.json'
        : '/assets/settings/onboarding-rocket-forlight.json'
      return src
    })

    return {
      lottieSrc
    }
  }
})
</script>

<style lang="sass" scoped>
.onboarding-inner-info
    align-items: center
    display: flex
    flex-direction: column
    text-align: center
</style>
