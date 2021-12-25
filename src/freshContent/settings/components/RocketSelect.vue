<template>
    <div class="rocket-select p-margin">
        <ph-caret-double-right
            ref="sel"
            @click="print()"
            class="rocket-select__selector"
            :style="`--pos: ${pos}%`"
        />
        <div class="rocket-select__rockets">
            <div v-for="(rocket, index) in rockets" :key="index" class="rocket-select__rocket">
                <img @click="select(index, rocket.iconPathUnlocked)" class="rocket-select__image rocket-select__image--dark-mode" :src="rocket.iconPathUnlocked">
                <Link :href="rocket.link" target="_blank" v-if="rocket.link" :txt="rocket.unlocked" />
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

        const select = (index : number, iconPath : string) => {
            pos.value = 100 * index

            chrome.storage.local.set({ selectedRocketIcon: `{ "id": 1, link: "${iconPath}" }` }, () => {})
            chrome.storage.local.set({ selectedRocketId : index }, () => {})
            chrome.browserAction.setIcon({ path: iconPath })
        }

        onMounted(() => chrome.storage.local.get("selectedRocketId", (res) => { pos.value = 100 * res.selectedRocketId }))

        return {
            rockets,
            pos,
            select,
        }
    },
})
</script>

<style lang="sass" scoped>
.rocket-select
    position: relative
    display: grid
    grid-template-columns: min-content auto
    height: min-content
    min-width: max-content
    width: 125px
    
    &__selector
        color: hsl(var(--clr-primary) )
        transition: all 200ms ease-out
        height: 4rem
        width: 3rem
        transform: translateY(var(--pos))

    &__rockets
        padding-left: .5rem
        user-select: none
        display: flex
        flex-direction: column
        justify-content: space-between

    &__rocket
        display: flex
        align-items: center
        height: 4rem

    &__image
        margin-right: .8rem
        height: 2.5rem
        cursor: pointer
        transition: transform 200ms ease

        &:hover
            transform: scale(1.15)

        &--beforeUnlocked
            filter: grayscale(1)
        &--dark-mode
            filter: invert(1)
</style>
