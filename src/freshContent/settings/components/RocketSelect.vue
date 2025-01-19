<template>
  <div class="rocket-select p-margin">
    <div ref="sel" class="rocket-select__selector" :style="`--pos: ${pos}%`" />
    <div class="rocket-select__rockets">
      <div v-for="(rocket, key, index) in rockets" :key="index" class="rocket-select__rocket">
        <img
          :class="`rocket-select__image ${index === 0 ? 'rocket-select__image--invert' : ''}`"
          :src="getIcon(rocket)"
          @click="select(rocket, index)"
        />
        <CustomLink
          v-if="getLink(rocket)"
          :href="getLink(rocket)"
          target="_blank"
          :txt="getText(rocket)"
          @click="unlockRocket(key)"
        />
        <p v-else class="rocket-select__text">
          {{ getText(rocket) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { isFirefox } from '../../../modules/firefoxCheck'

import rockets from '../../rockets.json'

import Link from './Link.vue'
import { useChrome } from '../composables/chrome'

export default defineComponent({
  components: {
    CustomLink: Link
  },
  setup() {
    const { sendChromeRuntimeMessage } = useChrome()

    const pos = ref(0)
    const availableRockets = ref(['default'])
    const selectedId = ref('default')

    onMounted(async () => {
      // Load rockets
      const { available, selected } = (await sendChromeRuntimeMessage({ cmd: 'check_rocket_status' })) as {
        selected: string
        available: string[]
      }

      availableRockets.value = [...available] || ['default']
      // No exceptions pls
      selectedId.value = (() => {
        try {
          return JSON.parse(selected).id
        } catch {
          return 'default'
        }
      })()

      pos.value = 100 * Object.keys(rockets).indexOf(selectedId.value)
    })

    const isUnlocked = (rocketObj: any) => {
      if (!rocketObj || !rocketObj.id) return false
      else return availableRockets.value.includes(rocketObj.id)
    }

    const select = async (rocketObj: any, index: number) => {
      if (!isUnlocked(rocketObj)) return

      pos.value = 100 * index

      await sendChromeRuntimeMessage({ cmd: 'set_rocket_icon', rocketId: rocketObj.id })
    }

    const getIcon = (rocketObj: any) => {
      return chrome.runtime.getURL(isUnlocked(rocketObj) ? rocketObj.iconPathUnlocked : rocketObj.iconPathBeforeUnlock)
    }

    const getLink = (rocketObj: any): string | undefined => {
      return rocketObj.link || (isFirefox() ? rocketObj.linkFirefox : rocketObj.linkChromium)
    }

    const getText = (rocketObj: any) => {
      return isUnlocked(rocketObj) ? rocketObj.unlocked : rocketObj.beforeUnlock
    }

    const unlockRocket = async (rocketId: string) => {
      await sendChromeRuntimeMessage({ cmd: 'unlock_rocket_icon', rocketId })
      availableRockets.value.push(rocketId)
    }

    return {
      rockets,
      pos,
      select,
      getLink,
      getText,
      getIcon,
      isUnlocked,
      unlockRocket
    }
  }
})
</script>

<style lang="sass" scoped>
.rocket-select
    position: relative
    display: flex
    flex-direction: column
    align-items: flex-start
    min-width: max-content
    width: 125px

    &__selector
        position: absolute
        top: 0
        left: 0
        transition: all 200ms ease-out
        height: 4rem
        width: 4rem
        padding: .3rem
        border: 2px solid hsl(var(--clr-primary))
        border-radius: 100%
        transform: translateY(var(--pos))

    &__rockets
        padding-left: .8rem
        padding-top: .2rem
        user-select: none
        display: flex
        flex-direction: column
        justify-content: space-between

    &__rocket
        display: flex
        align-items: center
        height: 4rem
        padding-right: .2rem

    &__image
        margin-right: .8rem
        height: 2.5rem
        cursor: pointer
        transition: transform 200ms ease

        &:hover:not(&--beforeUnlocked)
            transform: scale(1.15)

        &--beforeUnlocked
            filter: grayscale(1)
        &--invert
            filter: invert(1)
</style>
