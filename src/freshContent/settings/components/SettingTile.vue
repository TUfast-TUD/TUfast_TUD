<template>
    <div class="settings-tile" @mouseenter="toggleFocus()" @mouseleave="toggleFocus()" @click="click($event)">
        <component :is="icon" color="hsl(var(--clr-primary) )" size="4rem" />
        <h2 class="settings-tile__title">{{ title }}</h2>    
    </div>    
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props: {
        icon: {
            type: String as PropType<string>,
            required: true,
        },
        title: {
            type: String as PropType<string>,
            required: true,
        },
    },
    setup() {

        const toggleFocus = () => {
            const tiles = [...document.querySelectorAll(".settings-tile")]
            for (const tile of tiles) {
                    tile.classList.toggle("settings-tile--unfocus")
            }
        }

        const click = (e : Event) => {
            console.log("clicked!")
            let target = e.target as HTMLElement
            if(target.parentElement?.classList.contains("settings-tile"))
                target = target.parentElement
            target.classList.add("settings-tile--animate")
            setTimeout(() => target.classList.remove("settings-tile--animate"), 1000);
        }

        return {
            toggleFocus,
            click,
        }

    },
})
</script>

<style lang="sass" scoped>
.settings-tile
    --wave-animation-time: 1000ms
    --wave-delay: 150ms
    background-color: hsl(var(--clr-black) )
    border-radius: var(--brd-rad)
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    text-align: center

    min-height: 250px
    min-width: 250px
    height: 280px
    width: 280px

    user-select: none
    cursor: pointer
    position: relative

    transition: all 150ms ease-out

    &__title
        margin-top: 1rem

    &:hover
        transform: translateY(-7px) scale(1.05)
        box-shadow: 5px 6px 20px 7px rgb(255 255 255 / 20%)
        filter: brightness(1)

    &--unfocus
        transform: scale(0.95)
        filter: brightness(.6)

    &--animate
        &::before, &::after
            content: ""
            z-index: -1
            position: absolute
            top: 0
            left: 0
            width: 100%
            height: 100%
            border-radius: var(--brd-rad)
            animation-fill-mode: forwards
            background-color: hsl(var(--clr-black) )
        &::before
            animation: wave var(--wave-animation-time)
        &::after
            animation: wave var(--wave-animation-time)
            animation-delay: var(--wave-delay)

@keyframes wave
    0%
        transform: scale(1)
        opacity: .65
    100%
        transform: scale(2)
        opacity: 0

</style>