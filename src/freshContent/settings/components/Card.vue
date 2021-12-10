<template>
    <div class="card-bg" @click="close()" />
    <div class="card">
            <div class="card__header">
                <h1 class="card__title">{{ title }}</h1>
                <ph-x class="card__close" @click="close()"></ph-x>
            </div>
            <div class="card__body">
                <slot>Body</slot>
            </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType } from 'vue'

export default defineComponent({
    props: {
        title: {
            type: String as PropType<string>,
            default: ""
        },
    },
    setup(_, { emit }) {

        const close = () => {
            document.querySelector(".card")?.classList.add("card--closing")
            setTimeout(() => emit("close-me"), 650);
        }

        const open = () => {
            const card = document.querySelector(".card")
            card?.classList.add("card--opening")
            setTimeout(() => card?.classList.remove("card--opening"), 850)
        }

        onMounted(() => open())
        
        return {
            close,
        }
    },
})
</script>

<style lang="sass" scoped>
.card-bg
    position: absolute
    z-index: 0
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    background-color: hsl(var(--clr-grey), .6)

.card
    --card-with: 80vw
    --card-height: 80vh

    position: absolute
    top: calc(50% - var(--card-height)/2)
    left: calc(50% - var(--card-with)/2)
    width: var(--card-with)
    height: var(--card-height)
    background-color: hsl(var(--clr-black) )
    border-radius: var(--brd-rad)

    &__title
        text-transform: uppercase

    &__header
        // width: 100%
        height: min-content
        display: flex
        justify-content: space-between
        align-items: center
        margin: 1rem 1rem

    &__body
        margin: 2rem 2.5rem

    &__close
        width: 4rem
        height: 4rem
        // margin: 1rem 1rem
        cursor: pointer
        &:hover
            color: hsl(var(--clr-alert) )

    &--opening
        animation: enter 500ms ease
        animation-fill-mode: backwards
        animation-delay: 350ms
    
    &--closing
        animation: enter 500ms ease
        animation-direction: reverse
        animation-fill-mode: forwards
        animation-delay: 150ms

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