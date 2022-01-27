<template>
    <div class="hide-bg">
        <div class="onboarding onboarding--opening">
            <ph-x v-if="currentStep !== steps" class="onboarding__close" @click="close()" />
            <div class="onboarding__main">
                <slot/>
            </div>
            
            <Stepper class="onboarding__stepper" :steps="steps" :currentStep="currentStep" />
            <div :class="`onboarding__footer ${currentStep === steps ? 'onboarding__footer--center' : ''}`">
                <div v-if="currentStep !== steps" class="footer-text">
                    <h2 class="footer-text__title">{{ h1 }}</h2>
                    <h3 class="footer-text__subtitle max-line">{{ h2 }}</h3>
                </div>
                <OnboardingButton :percentDone="percentDone" @click="next()" class="onboarding__main-btn" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@vue/runtime-core'
import Stepper from './Stepper.vue'
import OnboardingButton from './OnboardingButton.vue'

export default defineComponent({
    components: {
        Stepper,
        OnboardingButton,
    },
    props: {
        h1: {
            type: String as PropType<string>,
            required: true,
        },
        h2: {
            type: String as PropType<string>,
            required: true,
        },
    },
    setup(_, { emit }) {
        const currentStep = ref(1)
        const percentDone = ref(0)
        const steps = ref(7)

        const close = () => {
            document.querySelector(".onboarding")?.classList.add("onboarding--closing")
            setTimeout(() => emit("close-me"), 650);
        }

        const next = () => {
            if (currentStep.value < steps.value) {
                currentStep.value++
                percentDone.value += (1 / (steps.value - 1)) * 100
                emit("next")
            } else
                close()
        }

        setTimeout(() => {
            document.querySelector(".onboarding")?.classList.remove("onboarding--opening")
        }, 800);

        return { currentStep, percentDone, steps, close, next }
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
    display: flex
    flex-direction: column
    align-items: center
    width: 50vw
    height: 70vh
    min-height: 70vh
    background-color: hsl(var(--clr-black), )
    border-radius: var(--brd-rad)
    padding-bottom: .5rem

    &__close
        position: absolute
        z-index: 1
        top: .5rem
        left: .5rem
        width: 4rem
        height: 4rem
        cursor: pointer
        color: hsl(var(--clr-white) )
        &:hover
            color: hsl(var(--clr-alert) )

    &__main
        height: 70%
        max-height: 75%
        width: 100%
        z-index: 0
        color: hsl(var(--clr-white), )
        display: flex
        flex-direction: column
        align-items: center
        justify-content: space-evenly

    &__stepper
        flex: 0 0 auto
        width: 20%

    &__footer
        flex: 1 1 auto
        padding: 1rem 0 0
        display: flex
        justify-content: space-between
        align-items: center
        color: hsl(var(--clr-white), )
        font-weight: 800
        width: 90%

        &--center
            justify-content: center

    &__main-btn
        color: hsl(var(--clr-white), )

    &--closing
        animation: enter 500ms ease
        animation-direction: reverse
        animation-fill-mode: forwards
        animation-delay: 150ms

    &--opening
        animation: enter 500ms ease
        animation-delay: 300ms
        animation-fill-mode: backwards

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
