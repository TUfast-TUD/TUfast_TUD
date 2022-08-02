<template>
    <div class="rocket-select p-margin">
        <div
            ref="sel"
            class="rocket-select__selector"
            :style="`--pos: ${pos}%`"
        />
        <div class="rocket-select__rockets">
            <div v-for="(rocket, index) in rockets" :key="index" class="rocket-select__rocket">
                <img @click="select(index)" :class="`rocket-select__image ${index === 0 ? 'rocket-select__image--invert' : ''}`" :src="rocket.iconPathUnlocked">
                <Link v-if="rocket.link" :href="rocket.link" target="_blank" :txt="rocket.unlocked" />
                <Link v-else-if="isFirefox" :href="rocket.linkFirefox" target="_blank" :txt="rocket.unlocked" />
                <Link v-else-if="rocket.linkChromium" :href="rocket.linkChromium" target="_blank" :txt="rocket.unlocked" />
                <p v-else class="rocket-select__text">{{ rocket.unlocked }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

import rockets from "../rockets.json"

import Link from './Link.vue'

export default defineComponent({
    components: {
        Link
    },
    setup() {
        const pos = ref(0)

        const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection

        const select = (index : number) => {
            pos.value = 100 * index

            const rocket = rockets[index]
            chrome.storage.local.set({ selectedRocketIcon: JSON.stringify(rocket) })
            //chrome.storage.local.set({ selectedRocketId : index }, () => {})
            chrome.browserAction.setIcon({ path: rocket.iconPathUnlocked })
        }

        onMounted(() => chrome.storage.local.get("selectedRocketId", (res) => { pos.value = 100 * res.selectedRocketId }))

        return {
            rockets,
            pos,
            select,
            isFirefox,
        }
    },
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
