<template>
  <div class="hide-bg">
    <div class="onboarding onboarding--opening">
      <PhX v-if="currentStep !== stepsCount" class="onboarding__close" @click="close()" />
      <div class="onboarding__main">
        <slot />
      </div>

      <Stepper class="onboarding__stepper" :steps="stepsCount" :current-step="currentStep" />

      <div v-if="currentStep !== stepsCount" class="onboarding__text">
        <h2 class="footer-text__title">
          {{ h1 }}
        </h2>
        <h3 class="footer-text__subtitle max-line">
          {{ h2 }}
        </h3>
      </div>

      <OnboardingButton
        :class="`onboarding__main-btn ${currentStep === stepsCount ? 'onboarding__main-btn--turned' : ''}`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

// components
import { PhX } from '@dnlsndr/vue-phosphor-icons'
import Stepper from './Stepper.vue'
import OnboardingButton from './OnboardingButton.vue'

// composables
import { useStepper } from '../composables/stepper'

export default defineComponent({
  components: {
    Stepper,
    OnboardingButton,
    PhX
  },
  props: {
    h1: {
      type: String as PropType<string>,
      required: true
    },
    h2: {
      type: String as PropType<string>,
      required: true
    },
    currentStep: {
      type: Number as PropType<number>,
      required: true
    }
  },
  emits: ['close-me', 'next'],
  setup() {
    const { stepsCount, close } = useStepper()

    setTimeout(() => {
      document.querySelector('.onboarding')?.classList.remove('onboarding--opening')
    }, 800)

    return {
      stepsCount,
      close
    }
  }
})
</script>

<style lang="sass">
.hide-bg
    position: absolute
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    background-color: hsl(var(--clr-black), .8)

    display: flex
    justify-content: center
    align-items: center

.onboarding
    position: relative
    display: grid
    /* width: close, main, button */
    grid-template-columns: 5rem 1fr 8rem
    /* heights: close, main, stepper, text1, text2 & button */
    grid-template-rows: 5rem calc(100% - 5rem - 20px - 180px) 20px calc(180px - 8rem) 8rem
    align-items: center
    justify-items: center
    width: 50vw
    height: 80vh
    max-height: 90vh
    background-color: hsl(var(--clr-grey), )
    border-radius: var(--brd-rad)
    padding-bottom: 2rem
    padding-right: 2rem

    &__close
        grid-row: 1
        grid-column: 1
        width: 4rem
        height: 4rem
        cursor: pointer
        color: hsl(var(--clr-white) )
        &:hover
            color: hsl(var(--clr-alert) )

    &__main
        grid-row: 1 / 3
        grid-column: 2
        width: 100%
        height: 100%
        max-height: 100%
        color: hsl(var(--clr-white), )
        padding-top: 2rem
        display: flex
        flex-direction: column
        align-items: center
        gap: 2rem
        overflow-y: auto

    &__stepper
        grid-row: 3
        grid-column: 2
        flex: 0 0 auto
        width: 20%

    &__text
      grid-row: 4 / 6
      grid-column: 2
      color: hsl(var(--clr-white), )
      font-weight: 800
      max-height: 100%
      text-align: justify
      margin-right: 2rem
      overflow-y: auto
      padding-right: .5rem

    &__main-btn
        grid-row: 5
        grid-column: 3
        color: hsl(var(--clr-white), )
        transition: transform 300ms ease

        &--turned
            transform: rotate(90deg)
            grid-column: 2

    &--closing
        animation: enter 500ms ease
        animation-direction: reverse
        animation-fill-mode: forwards
        animation-delay: 150ms

    &--opening
        animation: enter 500ms ease
        animation-delay: 300ms
        animation-fill-mode: backwards

.light
    & .onboarding
        &__main, &__footer, &__close:not(:hover)
            color: hsl(var(--clr-black), )

@keyframes enter
    0%
        opacity: .2
        transform: scale(0)
    70%
        opacity: 1
        transform: scale(1.1)
    100%
        transform: scale(1)
</style>
