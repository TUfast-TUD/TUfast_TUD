<template>
  <div class="rocket-select p-margin">
    <div class="rocket-select__rockets">
      <div
        v-for="(rocket, key, index) in rockets"
        :key="index"
        class="rocket-select__rocket"
        :class="{ 'rocket-select__rocket--selected': selectedId === rocket.id }"
      >
        <div class="rocket-select__icon-wrapper">
          <img
            :class="[
              'rocket-select__image',
              {
                'rocket-select__image--invert': index === 0,
                'rocket-select__image--locked': !isUnlocked(rocket)
              }
            ]"
            :src="getIcon(rocket)"
            @click="select(rocket, index)"
          />
        </div>

        <div class="rocket-select__content">
          <CustomLink
            v-if="getLink(rocket)"
            :href="getLink(rocket)"
            target="_blank"
            :txt="getText(rocket)"
            class="rocket-select__link"
            @click="unlockRocket(key)"
          />
          <p v-else class="rocket-select__text">
            {{ getText(rocket) }}
          </p>
        </div>
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
    })

    const isUnlocked = (rocketObj: any) => {
      if (!rocketObj || !rocketObj.id) return false
      else return availableRockets.value.includes(rocketObj.id)
    }

    const select = async (rocketObj: any, index: number) => {
      if (!isUnlocked(rocketObj)) return

      selectedId.value = rocketObj.id

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
      selectedId,
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
    width: 100%
    max-width: 100%

    &__rockets
        display: flex
        flex-direction: column
        gap: 0.5rem
        width: 100%

    &__rocket
        display: grid
        grid-template-columns: auto 1fr
        gap: 1rem
        align-items: center
        padding: 0.5rem 0.8rem
        border-radius: var(--brd-rad)
        transition: background-color 200ms ease-in-out
        min-height: 4rem
        width: 100%

        &--selected
            background-color: hsla(var(--clr-accent), 0.1)
            border: 2px solid hsl(var(--clr-accent))

        &:not(&--selected)
            border: 2px solid transparent

    &__icon-wrapper
        display: flex
        align-items: center
        justify-content: center
        width: 2.5rem
        height: 2.5rem
        flex-shrink: 0

    &__image
        width: 100%
        height: 100%
        object-fit: contain
        cursor: pointer
        transition: transform 200ms ease-in-out

        &:not(&--locked):hover
            transform: scale(1.15)

        &--locked
            filter: grayscale(1)
            opacity: 0.5
            cursor: not-allowed

        &--invert
            filter: invert(1)

        &--invert#{&--locked}
            filter: invert(1) grayscale(1)
            opacity: 0.5

    &__content
        min-width: 0
        flex: 1
        overflow: hidden

    &__text,
    &__link
        word-wrap: break-word
        overflow-wrap: break-word
        hyphens: auto
        line-height: 1.4
        margin: 0

    &__link
        display: inline
        max-width: 100%

// Responsive adjustments
@media (max-width: 480px)
    .rocket-select
        &__rocket
            gap: 0.75rem
            padding: 0.5rem

        &__icon-wrapper
            width: 2rem
            height: 2rem

        &__text,
        &__link
            font-size: 0.9rem
</style>
