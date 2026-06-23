<template>
  <div class="onboarding-inner-info">
    <div ref="animationContainer" class="onboarding-animation"></div>
    <h3>{{ strings.onboarding.pages.welcomeTitle }}</h3>
    <p class="txt-help" v-html="strings.onboarding.pages.welcomeHelp"></p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light_canvas'

import onboardingRocketDark from '../../../assets/settings/onboarding-rocket-fordark.json'
import onboardingRocketLight from '../../../assets/settings/onboarding-rocket-forlight.json'
import { strings } from '../../../i18n'

export default defineComponent({
  setup() {
    const animationContainer = ref<HTMLDivElement | null>(null)
    const isDarkMode = ref(!document.documentElement.classList.contains('light'))
    const animation = ref<any>(null)

    let observer: MutationObserver | null = null

    const renderAnimation = async () => {
      await nextTick()

      if (!animationContainer.value) return

      animation.value?.destroy()
      animation.value = lottie.loadAnimation({
        container: animationContainer.value,
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: isDarkMode.value ? onboardingRocketDark : onboardingRocketLight,
        rendererSettings: {
          clearCanvas: true,
          progressiveLoad: true
        }
      })
    }

    onMounted(() => {
      observer = new MutationObserver(() => {
        const hasLight = document.documentElement.classList.contains('light')
        isDarkMode.value = !hasLight
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })

      renderAnimation()
    })

    watch(isDarkMode, () => {
      renderAnimation()
    })

    onUnmounted(() => {
      observer?.disconnect()
      animation.value?.destroy()
    })

    return {
      animationContainer,
      strings
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

.onboarding-animation
    height: 340px
    width: 100%

    :deep(canvas)
        display: block
        height: 100%
        width: 100%
</style>
