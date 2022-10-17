<template>
  <div class="stepper">
    <div
      v-for="step of stepsCount"
      :key="step"
      :class="`stepper__step ${step === currentOnboardingStep ? 'stepper__step--current' : ''}`"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// types
import type { PropType } from 'vue'

// composables
import { useStepper } from '../composables/stepper'

export default defineComponent({
  setup () {
    const {
      stepsCount,
      currentOnboardingStep,
    } = useStepper()

    return {
      stepsCount,
      currentOnboardingStep,
    }
  }
})
</script>

<style lang="sass">
.stepper
    display: flex
    min-height: .5rem
    height: .5rem
    gap: .5rem

    &__step
        list-style: none
        border-radius: .6rem
        background-color: hsl(var(--clr-white), .4)
        flex: 1 0 auto
        transition: all 500ms ease

        &--current
            flex: 2 0 auto
            background-color: hsl(var(--clr-white), .8)

.light
    & .stepper__step
        background-color: hsl(var(--clr-black), .4)

        &--current
            background-color: hsl(var(--clr-black), .8)
</style>
