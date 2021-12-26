<template>
    <div class="statistics">
        <p class="txt-bold">Bereits gespart</p>
        <div class="statistics__clicks">
                <ph-cursor />
                <span class="txt-bold">{{ counter }}</span>
                <span>{{ counter === 1 ? "Click" : "Clicks" }}</span>
        </div>
        <div class="statistics__minutes">
            <ph-timer />
            <span class="txt-bold">{{ getMinutes(counter) }}min</span>
            <span>{{ getSeconds(counter) }}s</span>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {

        const counter = ref<number>(0)
        chrome.storage.local.get(["saved_click_counter"], (clicks) => counter.value = clicks.saved_click_counter ?? 0)

        const getMinutes = (clicks : number) => {
            const clickValue = clicks * 3
            return Math.floor(clicks / 60) ?? 0
        }

        const getSeconds = (clicks : number) => {
            const clickValue = clicks * 3
            return clicks % 60 ?? 0
        }

        return {
            counter,
            getMinutes,
            getSeconds,
        }
        
    },
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