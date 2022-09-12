<template>
  <div class="color-switch">
    <lottie-player
      ref="anim"
      src="../../assets/settings/theme_lottie.json"
      background="transparent"
      class="color-switch__lottie"
      @click="play()"
    />
    <svg
      class="color-switch__text"
      viewBox="0 0 400 200"
    >
      <path
        id="curve"
        d="M 0 0 A 1 1 0 0 0 400 0"
      />
      <text text-anchor="middle">
        <textPath
          xlink:href="#curve"
          startOffset="50%"
        >
          Klick Mich!
        </textPath>
      </text>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue'
import '@lottiefiles/lottie-player'
import animation from '../../../assets/settings/theme_lottie.json'

export default defineComponent({
  props: {
    animState: {
      type: String as PropType<'dark' | 'light'>,
      default: 'dark'
    }
  },
  setup (props) {
    const anim : any = ref()

    const direction = ref(-1)
    const animSeek = ref(99)

    onMounted(async () => {
      setTimeout(async () => {
        await setAnimationDirection()
      }, 10)
    })

    const play = () => {
      setAnimationDirection()
      anim.value.play()
    }

    const setAnimationDirection = () => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['theme'], (res) => {
          if (res.theme === 'dark') {
            direction.value = -1
            animSeek.value = 99
          }
          if (res.theme === 'light') {
            direction.value = 1
            animSeek.value = 0
          }
          anim.value.setDirection(direction.value)
          anim.value.seek(`${animSeek.value}%`)
          resolve()
        })
      })
    }

    return {
      anim,
      animation,
      direction,
      play
    }
  }
})
</script>

<style lang="sass" scoped>
.color-switch
    width: 40%
    cursor: pointer
    display: flex
    position: relative
    flex-direction: column
    justify-content: center
    align-items: space-between

    &__text
        z-index: -1
        color: currentColor
        text-align: center
        transform: translateY(0%)
        opacity: 0
        transition: transform 225ms ease, opacity 250ms ease
        position: absolute
        user-select: none

    &:hover &__text
            transform: translateY(40%)
            opacity: 1
    .light &:hover &__text
            transform: translateY(75%)

path
  fill: transparent

text
  fill: hsl(var(--clr-primary) )
  font-size: 70px
  font-weight: 700
  letter-spacing: 6px
</style>
