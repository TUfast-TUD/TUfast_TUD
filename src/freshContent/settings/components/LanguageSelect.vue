<template>
    <div class="language-select">
        <ph-caret-double-right
            class="language-select__selector"
            :class="selectorClass"
            @click.capture="switchSel($event)" />
        <div class="language-select__languages" ref="languages">
            <p class="language-select__german language-select__languages--selected" @click="switchSel($event)">Deutsch</p>
            <p class="language-select__english" @click="switchSel($event)">English</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
    setup() {
        enum Selected {
            German = "German",
            English = "English"
        }

        const languages = ref<null | HTMLElement>(null)
        const selected = ref(Selected.German)
        const selectorClass = computed(() => selected.value === Selected.German ? "language-select__selector--german" : "language-select__selector--english")



        const switchSel = (e : MouseEvent) => {
                const target = e.target as HTMLParagraphElement
            if (target.classList.contains("language-select__languages--selected"))  
                return

            switch (selected.value) {
                case Selected.German:
                    selected.value = Selected.English
                    break
                case Selected.English:
                    selected.value = Selected.German
                    break
            }
                for (const language of languages.value!.children)
                    language.classList.toggle("language-select__languages--selected")    
        }   

        return {
            switchSel,
            selectorClass,
            languages
        }
        
    },
})
</script>

<style lang="sass" scoped>
.language-select
    position: relative
    display: grid
    grid-template-columns: min-content auto
    height: min-content
    min-width: min-content
    width: 125px
    
    &__selector
        transition: all 200ms ease-out
        cursor: pointer
        color: hsl(var(--clr-primary) )
        width: 2rem
        height: 2rem
        &--german
            transform: translateY(0)
        &--english
            transform: translateY(100%)

    &__languages
        padding-left: .5rem
        line-height: 2rem
        user-select: none

        &--selected
            font-weight: 600
            font-size: 1.2em
        & :not(&--selected)
            cursor: pointer
</style>