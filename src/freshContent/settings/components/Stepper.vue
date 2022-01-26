<template>
    <div class="stepper">
        <div
            v-for="step of steps"
            :key="step"
            :class="`stepper__step ${step === currentStep ? 'stepper__step--current' : ''}`"
        />
    </div>
</template>

<script lang="ts">
import { PropType, ref, defineComponent } from 'vue'

export default defineComponent({
    props: {
        steps: Number as PropType<number>,
    },
    setup() {
        const currentStep = ref(1)

        return { currentStep }
    }
})
</script>

<style lang="sass">
.stepper
    display: flex
    height: 1rem
    gap: .8rem

    &__step
        list-style: none
        border-radius: .3rem
        background-color: hsl(var(--clr-grey), .4)
        flex: 1 0 auto
        transition: all 500ms ease

        &--current
            flex: 2 0 auto
            background-color: hsl(var(--clr-grey), .8)
</style>
