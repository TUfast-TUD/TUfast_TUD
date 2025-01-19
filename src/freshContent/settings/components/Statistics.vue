<template>
  <div class="statistics">
    <p class="txt-bold">Bereits gespart</p>
    <div class="statistics__clicks">
      <PhCursor />
      <span class="txt-bold">{{ counter }}</span>
      <span>{{ counter === 1 ? 'Click' : 'Clicks' }}</span>
    </div>
    <div class="statistics__minutes">
      <PhTimer />
      <span class="txt-bold">{{ time.getMinutes(counter) }}min</span>
      <span>{{ time.getSeconds(counter) }}s</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { PhCursor, PhTimer } from '@dnlsndr/vue-phosphor-icons'
import { time } from '../utilities'
import { useChrome } from '../composables/chrome'

export default defineComponent({
  components: {
    PhCursor,
    PhTimer
  },
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
    &__clicks
        display: flex
        justify-content: space-between
        align-items: flex-start
    &__minutes
        display: flex
        justify-content: space-between
</style>
