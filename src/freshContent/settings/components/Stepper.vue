<template>
  <div class="stepper">
    <IconChevronLeft
      class="stepper__icon stepper__icon--clickable"
      tabindex="0"
      @click="goBack"
      @keyup.enter="goBack"
      @keyup.space="goBack"
    />

    <div class="stepper__progress-container">
      <div class="stepper__background-stroke" />
      <div class="stepper__filled-stroke" :style="{ width: progressWidth }" />
    </div>

    <span class="stepper__counter">
      {{ String(currentOnboardingStep).padStart(2, '0') }} / {{ String(stepsCount).padStart(2, '0') }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

// composables
import { useStepper } from '../composables/stepper'

export default defineComponent({
  setup() {
    const { stepsCount, currentOnboardingStep, prev } = useStepper()

    const progressWidth = computed(() => {
      const progress = (currentOnboardingStep.value / stepsCount.value) * 100
      return `${progress}%`
    })

    const goBack = () => {
      prev()
    }

    return {
      stepsCount,
      currentOnboardingStep,
      progressWidth,
      goBack
    }
  }
})
</script>

<style lang="sass">
.stepper
    display: flex
    align-items: center
    gap: 1rem
    width: 100%
    margin-top: 16px

    &__icon
        flex-shrink: 0
        width: 1.5rem
        height: 1.5rem
        color: hsl(var(--clr-text))
        transition: all 200ms ease-in-out

        &--clickable
            cursor: pointer

            &:hover
                color: hsl(var(--clr-white), 1)
                transform: translateX(-2px)

            &:active
                transform: translateX(-4px)

    &__progress-container
        position: relative
        flex: 1
        height: 0.5rem
        border-radius: 0.5rem
        overflow: hidden

    &__background-stroke
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background-color: hsl(var(--clr-white), .3)
        border-radius: 0.5rem

    &__filled-stroke
        position: absolute
        top: 0
        left: 0
        height: 100%
        background-color: hsl(var(--clr-accent))
        border: 1px solid hsl(var(--clr-accent))
        border-radius: 0.5rem
        transition: width 200ms ease-in-out
        min-width: 0.5rem

    &__counter
        flex-shrink: 0
        color: hsl(var(--clr-text))
        font-size: 0.875rem
        font-weight: 600
        min-width: 3.5rem
        text-align: right
</style>
