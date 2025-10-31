<template>
  <div class="statistics" style="vertical-align: middle">
    <span class="statistics__pre-text txt-bold">Bereits gespart:</span>
    <div class="statistics__box">
      <div class="statistics__box-icon">
        <IconClick />
      </div>
      <div class="statistics__box-text statistics__clicks">
        <span class="txt-bold">{{ counter }}</span>
        <span class="txt-bold">{{ counter === 1 ? ' Klick' : ' Klicks' }}</span>
      </div>
    </div>
    <div class="statistics__box">
      <div class="statistics__box-icon">
        <IconStopwatch />
      </div>
      <div class="statistics__box-text statistics__minutes">
        <span class="txt-bold">{{ time.getMinutes(counter) }}m </span>
        <span class="txt-bold">{{ time.getSeconds(counter) }}s</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { time } from '../utilities'
import { useChrome } from '../composables/chrome'

export default defineComponent({
  setup() {
    const { getChromeLocalStorage } = useChrome()
    const counter = ref<number>(0)

    getChromeLocalStorage('savedClickCounter').then((clicks) => {
      counter.value = typeof clicks === 'number' ? clicks : Number.parseInt(clicks as string) || 0
    })

    return {
      counter,
      time
    }
  }
})
</script>

<style lang="sass" scoped>
.txt-bold
    font-weight: 600

.statistics
  display: flex
  align-items: center
  gap: 16px

  > .txt-bold
    white-space: nowrap
    font-weight: 600
    font-size: 16px

  &__box
    background-color: hsl(var(--clr-btnhov))
    border-radius: var(--brd-rad)
    padding: 8px 12px
    text-align: center
    min-width: 128px
    display: flex
    flex-direction: row
    align-items: center
    justify-content: center

  &__box-icon
    margin-bottom: 4px
    color: hsl(var(--clr-text))
    display: flex
    justify-content: center
    align-items: center

  &__box-icon svg
    display: block
    height: 24px
    width: 24px

  &__box-text
    font-weight: 600
    color: hsl(var(--clr-text))
    font-size: 14px
    white-space: nowrap
    padding-left: 4px

  &__pre-text
    color: var(--clr-text-help)

    @media screen and (max-width: 800px)
      display: none

  @media screen and (max-width: 650px)
    gap: 6px

    &__box
      padding: 4px 6px
      min-width: auto
</style>
