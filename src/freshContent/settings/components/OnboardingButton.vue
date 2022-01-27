<template>
    <div class="onboarding-btn">
        <div class="onboarding-btn__inner">
            <svg class="onboarding-btn__progress" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" :style="`--done: ${(percentDone/100) * 280}`" />
            </svg>
            <ph-arrow-right class="onboarding-btn__arrow" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core"


export default defineComponent({
    props: {
        percentDone: {
            type: Number as PropType<number>,
            required: true,
        },
    },
})
    
</script>

<style lang="sass">
.onboarding-btn
    border-radius: 100%
    display: flex
    justify-content: center
    align-items: center
    width: 8rem
    height: 8rem
    box-shadow: 0 0 3rem 4px rgb(0 0 0 / 40%)
    z-index: 0
    cursor: pointer

    // &:hover &__arrow
    //     color: hsl(var(--clr-primary), )

    &:hover
        box-shadow: 0 0 3rem 4px hsl(var(--clr-primary), .4)
        .onboarding-btn__inner
            transform: scale(1.1)

    &__inner
        transition: all 200ms ease
        border-radius: 100%
        display: flex
        justify-content: center
        align-items: center
        width: 80%
        height: 80%
        background-color: hsl(var(--clr-grey), )
        z-index: 2
        position: relative

    &__progress
        height: 100%
        width: 100%
        z-index: 3
        position: absolute

        & circle
            transition: all 400ms ease
            stroke: hsl(var(--clr-primary), )
            stroke-width: 4
            stroke-linecap: round
            stroke-linejoin: round
            fill: none
            stroke-dasharray: var(--done) 280

    &__arrow
        width: 80%
        height: 80%
        z-index: 2
</style>
