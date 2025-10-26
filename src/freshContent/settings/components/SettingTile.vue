<template>
  <div class="settings-tile" tabindex="0">
    <component :is="icon" color="hsl(var(--clr-accent) )" class="settings-tile__icon" />
    <div class="settings-tile__title-indicator">
      <h2 class="settings-tile__title">
        {{ title }}
      </h2>
      <div v-if="shouldShowIndicator" class="settings-tile__indicator" :class="indicatorClass">
        <div class="settings-tile__indicator-icon"><IconPointFilled size="24" /></div>
        <div class="settings-tile__indicator-text">{{ indicatorText }}</div>
      </div>
    </div>
    <div class="settings-tile__type" :class="{ 'is-rotated': isActive }">
      <IconChevronDown size="24px" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { useAllSettingsStatus } from '../composables/useAllSettingsStatus'

export default defineComponent({
  props: {
    icon: {
      type: String as PropType<string>,
      required: true
    },
    title: {
      type: String as PropType<string>,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    settingType: { type: String as PropType<string>, required: true },
    platform: { type: String, default: 'zih' }
  },
  setup(props) {
    const { settings } = useAllSettingsStatus(props.platform)

    // Handle empty settingType (no indicator to show)
    const shouldShowIndicator = computed(() => props.settingType !== '')

    // Get the value from settings (could be boolean or string)
    const settingValue = computed(() => {
      if (!shouldShowIndicator.value) return null
      return settings.value[props.settingType as keyof typeof settings.value] ?? null
    })

    // Determine if value is boolean or string
    const isBoolean = computed(() => typeof settingValue.value === 'boolean')
    /* const isString = computed(() => typeof settingValue.value === 'string') */

    // Generate indicator class and text based on type
    const indicatorClass = computed(() => {
      if (!shouldShowIndicator.value) return 'hidden'
      if (isBoolean.value) {
        return settingValue.value ? 'active' : 'inactive'
      }
      return 'value-display'
    })

    const indicatorText = computed(() => {
      if (!shouldShowIndicator.value) return ''
      if (isBoolean.value) {
        return settingValue.value ? 'AKTIVIERT' : 'DEAKTIVIERT'
      }
      return String(settingValue.value) // Display the actual value for strings
    })

    return { shouldShowIndicator, indicatorClass, indicatorText }
  }
})
</script>

<style lang="sass" scoped>
.settings-tile
    background-color: hsl(var(--clr-btn))
    border-radius: var(--brd-rad)
    display: flex
    flex-direction: row
    justify-content: space-between
    align-items: center
    text-align: center
    width: 100%
    height: 64px
    padding: 0 .8rem
    user-select: none
    cursor: pointer
    position: relative
    transition: all 200ms ease-in-out

    &__title-indicator
        display: flex
        flex-direction: row
        align-items: center
        gap: 16px
        flex: 1

        @media screen and (max-width: 650px)
            gap: 0px

    &__title
        text-align: left

    &__indicator
        display: flex
        flex-direction: row
        align-items: center
        width: auto
        padding: 4px
        padding-right: 8px
        border-radius: var(--brd-rad-sm)

        @media screen and (max-width: 650px)
            paddin-right: 0px

        &.active
            border: 2px solid #0066ff
            background-color: hsla(210, 100%, 50%, 0.2)

            @media screen and (max-width: 650px)
                border: none !important
                background-color: transparent !important

        &.inactive
            border: 2px solid hsl(var(--clr-text))
            background-color: hsla(var(--clr-text), .2)
            opacity: 0.5

            svg
                color: hsl(var(--clr-text))

            @media screen and (max-width: 650px)
                border: none !important
                background-color: transparent !important

        &.value-display
            border: 2px solid #0066ff
            background-color: hsla(210, 100%, 50%, 0.2)

            @media screen and (max-width: 650px)
                border: none !important
                background-color: transparent !important

        &.hidden
            display: none

    &__indicator-icon
        display: flex
        align-items: center
        justify-content: center
        width: 24px
        height: 24px
        color: hsl(var(--clr-accent))

    &__indicator-text
        font-size: 14px
        white-space: nowrap
        line-height: 1
        font-weight: 600
        color: hsl(var(--clr-text))

        @media screen and (max-width: 650px)
            display: none

    &__icon
        width: 48px
        height: 48px
        margin-right: 16px
        flex-shrink: 0
        color: hsl(var(--clr-accent))

        @media screen and (max-width: 650px)
            width: 32px
            height: 32px

    &__type
        flex-shrink: 0
        margin-left: 16px
        display: flex
        justify-content: center
        align-items: center
        padding-right: 8px
        color: hsl(var(--clr-text))

        svg
            transition: transform 200ms ease-in-out
            transform-origin: center center

        &.is-rotated svg
            transform: rotate(180deg)

.settings-tile:hover
    background-color: hsl(var(--clr-btnhov))

.value-display

    .settings-tile__indicator-text

        @media screen and (max-width: 650px)
            display: block !important
</style>
