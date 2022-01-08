<template>
    <div class="color-switch">
        <lottie-player
            ref="anim"
            src="../../assets/settings/theme_lottie.json"
            background="transparent"
            class="color-switch__lottie"
            @click="play()"
        />
        <span class="color-switch__text">Klick mich!</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue"
import "@lottiefiles/lottie-player"
import animation from "../../../assets/settings/theme_lottie.json"

export default defineComponent({
    props: {
        animState: {
            type: String as PropType<"dark" | "light">,
            default: "dark",
        },
    },
    setup(props) {
        const anim : any = ref()

        const direction = ref(props.animState === "dark" ? -1 : 1)
        const animSeek = ref(props.animState === "dark" ? 99 : 0)
        onMounted(() => {
            setTimeout(() => {
                anim.value.seek(`${animSeek.value}%`)
                anim.value.setDirection(direction.value)
            }, 0);
        })

        const play = () => {
            anim.value.setDirection(direction.value)
            anim.value.seek(`${animSeek.value}%`)
            direction.value = direction.value === -1 ? 1 : -1
            animSeek.value = animSeek.value === 99 ? 0 : 99
            anim.value.play()
        }

        return {
            anim,
            animation,
            direction,
            play,
        }
    },
})
</script>

<style lang="sass" scoped>
.color-switch
    width: 40%
    cursor: pointer
    display: flex
    flex-direction: column
    justify-content: center
    align-items: space-between

    &__text
        color: currentColor
        text-align: center
        transform: translateY(-70px)
        opacity: 0
        transition: transform 225ms ease, opacity 250ms ease

    &:hover &__text
            transform: translateY(-35px)
            opacity: 1
    .light &:hover &__text
            transform: translateY(-15px) 
</style>