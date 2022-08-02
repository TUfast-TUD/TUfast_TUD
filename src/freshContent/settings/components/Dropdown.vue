<template>
    <div class="dropdown">
        <div class="dropdown__dropdown">
            <span @click="clicked = !clicked" class="dropdown__title txt-bold">Studiengang</span>
            <ph-caret-down
                @click="clicked = !clicked"
                class="dropdown__arrow"
                color="hsl(var(--clr-primary) )"
                size="2rem" />
        </div>
        <transition-group @mouseleave="clicked=false" v-if="clicked" tag="div" class="dropdown-list">
            <div
                v-for="(study, key, index) in studies"
                :key="index"
                :class="`dropdown-list__item ${selectedStudy === key ? 'dropdown-list__item--selected' : ''}`"
                @click="setStudySubject(key)"
            >

                <ph-caret-double-right class="dropdown-list__arrow" />
                <img v-if="study.fsr_icon" class="dropdown-list__image" :src="study.fsr_icon" :alt="`Das Icon des Studiengangs ${study.name}`">
                <h3 class="dropdown-list__title">{{ study.name }}</h3>
            </div>
        </transition-group>
    </div>
    
    
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'

import studies from "../../studies.json"

export default defineComponent({
    props: {
        title: {
            type: String as PropType<string>,
            default: "Platzhalter"
        }
    },
    setup() {
        const clicked = ref(false)
        const selectedStudy = ref("Standardeinstellungen")
 
        chrome.storage.local.get("studiengang", (res) => selectedStudy.value = res.studiengang)

        const setStudySubject = (studiengang: string) => {
            if (studiengang === "addStudiengang") {
                window.location.href = "mailto:frage@tu-fast.de?Subject=Vorschlag Studiengang"
                return
            }
            chrome.storage.local.set({ studiengang })
            selectedStudy.value = studiengang
        }

        return {
            studies,
            clicked,
            setStudySubject,
            selectedStudy,
        }
    },
})
</script>

<style lang="sass" scoped>
.dropdown
    position: relative

    &__dropdown
        display: flex
        align-items: center
        height: min-content
        cursor: pointer


    &__dropdown:hover &__title
        text-decoration: underline

.dropdown-list
    cursor: default
    z-index: 100
    display: flex
    flex-direction: column
    justify-content: space-evenly
    position: absolute
    min-width: max-content
    top: 50px
    left: 0
    border-radius: var(--brd-rad)
    overflow: hidden
    box-shadow: 10px 10px 41px 9px hsl(var(--clr-white), .12)

    &__item
        cursor: pointer
        position: relative
        display: flex
        align-items: center
        justify-content: space-between
        background-color: hsl(var(--clr-grey))
        height: 70px
        padding: 1rem 1rem
        z-index: 2

        &:hover
            background-color: hsl(var(--clr-black))
            & .dropdown-list__arrow
                transform: translateX(20px)
                opacity: .4

        &--selected
            background-color: hsl(var(--clr-primary) )

            &:hover
                background-color: hsl(var(--clr-primary))
                filter: brightness(.8)

    &__image
        max-height: 100%

    &__title
        margin-left: .8rem


    &__arrow
        position: absolute
        right: 25px
        transition: transform 200ms ease, opacity 200ms ease
        color: hsl(var(--clr-primary) )
        height: 100%
        width: 20%
        opacity: .2
        z-index: 1

.light .dropdown-list
  &__item
    &:hover
      color: hsl(var(--clr-white) )
</style>
