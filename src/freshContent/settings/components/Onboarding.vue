<template>
    <div class="hide-bg">
        <div class="onboarding">
        <lottie-player
            class="onboarding__rocket"
            src="../../assets/settings/rocket_lottie.json"
            loop
            autoplay
        />
        <Stepper class="onboarding__stepper" :steps="5" />
        <!-- <footer></footer> -->
        </div>
    </div>
    
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import Stepper from './Stepper.vue'

export default defineComponent({
    components: {
        Stepper,
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
    justify-content: space-evenly
    width: 50vw
    height: 60vh
    max-height: 70vh
    background-color: hsl(var(--clr-white), )

    &__rocket
        max-height: 75%

    &__stepper
        width: 25%
</style>
