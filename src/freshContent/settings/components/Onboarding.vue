<template>
  <div class="hide-bg">
    <div class="onboarding">
      <Stepper class="onboarding__stepper" />
      <div class="onboarding__title">
        <component :is="icon" v-if="icon" color="hsl(var(--clr-accent) )" size="32" />
        <h2 class="onboarding__title-text">{{ h1 }}</h2>
      </div>
      <div class="onboarding__content">
        <slot />
      </div>
      <div class="onboarding-btn-wrapper">
        <div class="onboarding-btn" tabindex="0" @click="next()" @keyup.enter="next()" @keyup.space="next()">
          <div class="onboarding-btn__inner txt-bold">
            {{ btnText }}
            <IconArrowRight class="onboarding-btn__arrow" />
          </div>
        </div>
        <div class="onboarding__skip">
          <a
            class="onboarding__skip-text txt-help"
            href="#"
            tabindex="0"
            @click="close()"
            @keyup.enter="close()"
            @keyup.space="close()"
            >{{ skipText }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, onUnmounted } from 'vue'

// components
import Stepper from './Stepper.vue'

// composables
import { useStepper } from '../composables/stepper'

export default defineComponent({
  components: {
    Stepper
  },
  props: {
    h1: {
      type: String as PropType<string>,
      required: true
    },
    icon: {
      type: String as PropType<string>,
      required: true
    },
    currentStep: {
      type: Number as PropType<number>,
      required: true
    },
    btnText: {
      type: String as PropType<string>,
      required: true
    },
    skipText: {
      type: String as PropType<string>,
      required: true
    }
  },
  emits: ['close-me', 'next'],
  setup() {
    const { next, close, percentDone, stepsCount } = useStepper()

    // Focus trap logic
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const onboarding = document.querySelector('.onboarding')
      if (!onboarding) return

      const focusableElements = onboarding.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown)

      setTimeout(() => {
        const onboarding = document.querySelector('.onboarding')
        const firstFocusable = onboarding?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      }, 100)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown)
    })

    return {
      next,
      close,
      percentDone,
      stepsCount
    }
  }
})
</script>

<style lang="sass">
.hide-bg
    position: fixed
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    background-color: hsl(var(--clr-backgr), .8)
    z-index: 3
    display: flex
    justify-content: center
    align-items: center

.onboarding
    display: flex
    flex-direction: column
    align-items: center
    position: relative
    width: 800px
    height: 90vh
    max-height: 90vh
    background-color: hsl(var(--clr-btn))
    border-radius: var(--brd-rad)
    padding: 1rem
    z-index: 9999
    gap: 1rem

    &__title
        flex: 0 0 auto
        display: flex
        align-items: center
        gap: 8px
        margin-bottom: -0.5rem

    &__skip
        margin-top: 16px

    &__skip-text
        cursor: pointer
        text-decoration: underline !important

    &__stepper
        flex: 0 0 auto
        width: 100%
        max-width: 600px
        margin: 0 auto

    &__text
        color: hsl(var(--clr-white))
        font-weight: 800
        max-height: 100%
        text-align: justify
        margin-right: 2rem
        overflow-y: auto
        padding-right: .5rem

    &__main-btn
        color: hsl(var(--clr-white))
        transition: transform 200ms ease-in-out

    &__content
        flex: 1 1 auto
        width: 90%
        overflow-y: auto
        overflow-x: hidden
        min-height: 0
        display: flex
        flex-direction: column

        &::-webkit-scrollbar
            width: 8px

        &::-webkit-scrollbar-track
            background: hsl(var(--clr-btn))
            border-radius: var(--brd-rad)

        &::-webkit-scrollbar-thumb
            background: hsl(var(--clr-text))
            border-radius: var(--brd-rad)

            &:hover
                background: hsl(var(--clr-btnhov2))

        scrollbar-color: hsl(var(--clr-text)) hsl(var(--clr-btn))
        scrollbar-width: thin

        @media screen and (max-width: 800px)
            width: 95%

    @media screen and (max-width: 800px)
        width: 100vw
        height: 100vh
        max-height: 100vh
        border-radius: 0px

.light
    & .onboarding
        &__main, &__footer, &__close:not(:hover)
            color: hsl(var(--clr-backgr))

.onboarding-btn-wrapper
    flex: 0 0 auto
    margin-top: auto
    justify-content: center
    align-items: center
    display: flex
    flex-direction: column
    padding-bottom: 1rem

.onboarding-btn
    background-color: hsl(var(--clr-btnhov))
    border-radius: var(--brd-rad)
    cursor: pointer
    display: flex
    justify-content: center
    align-items: center
    width: fit-content
    height: 64px
    min-height: 64px
    box-shadow: 0 0 1rem 4px hsl(var(--clr-accent), .8)
    transition: background-color 200ms ease-in-out

    &:hover
        background-color: hsl(var(--clr-btnhov2))
        transition: background-color 200ms ease-in-out

    &__inner
        transition: all 200ms ease-in-out
        font-size: 20px
        padding-left: 16px
        padding-right: 16px
        border-radius: 100%
        display: flex
        justify-content: center
        align-items: center
        gap: 8px
        z-index: 2
        position: relative
        color: hsl(var(--clr-text))

    &__arrow
        z-index: 2
        color: hsl(var(--clr-text))

// used inside of onboardingPages
.onboarding-inner-info
    margin-top: 8px
    // Removed max-height and overflow - let parent handle scrolling
</style>
