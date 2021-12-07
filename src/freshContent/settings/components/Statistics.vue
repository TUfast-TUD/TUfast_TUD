<template>
    <div class="statistics">
        <p class="txt-bold">Bereits gespart</p>
        <div class="statistics__clicks">
                <ph-cursor />
                <span class="txt-bold">40</span>
                <span>Clicks</span>
        </div>
        <div class="statistics__minutes">
            <ph-timer />
            <span class="txt-bold">2min</span>
            <span>15s</span>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {
        
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