<template>
    <div class="card-bg" @click="close()" />
    <div tabindex="0" @keydown.esc="close()" class="card">
            <div class="card__header">
                <h1 class="card__title upper">{{ title }}</h1>
                <PhX class="card__close" @click="close()" />
            </div>
            <div class="card__body">
                <slot>Body</slot>
            </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType } from 'vue'
import { PhX } from '@dnlsndr/vue-phosphor-icons'

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
            const card = document.querySelector(".card") as HTMLDivElement
            card?.classList.add("card--opening")
            setTimeout(() => {
                card?.classList.remove("card--opening")
                card.focus()
            }, 850)
        }

        onMounted(() => open())
        
        return {
            close,
        }
    },
    components: {
        PhX,
    }
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
    display: flex
    flex-direction: column
    outline: none

    &__header
        height: min-content
        display: flex
        justify-content: space-between
        align-items: center
        margin: 1rem 1rem

    &__body
        margin: 2rem 2.5rem
        height: 100%
        overflow: auto

    &__close
        width: 4rem
        height: 4rem
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
