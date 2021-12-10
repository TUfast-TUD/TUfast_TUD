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
            <span class="txt-bold">2min</span>
            <span>15s</span>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {

        const counter = ref(null)
        chrome.storage.local.get(["saved_click_counter"], (clicks) => counter.value = clicks.saved_click_counter)


        return {
            counter,
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