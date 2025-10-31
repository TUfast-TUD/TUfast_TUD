<template>
  <div class="language-select" disabled>
    <!--     <IconLanguage class="language-select__selector" :class="selectorClass" @click.capture="switchSel($event)" />
    <div ref="languages" class="language-select__languages">
      <p class="language-select__german language-select__languages--selected" @click="switchSel($event)">Deutsch</p>
      <p class="language-select__english" @click="switchSel($event)">English</p>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  setup() {
    /* eslint-disable no-unused-vars */
    enum Selected {
      German = 'German',
      English = 'English'
    }
    /* eslint-enable no-unused-vars */

    const languages = ref<null | HTMLElement>(null)
    const selected = ref(Selected.German)
    const selectorClass = computed(() =>
      selected.value === Selected.German ? 'language-select__selector--german' : 'language-select__selector--english'
    )

    const switchSel = (e: MouseEvent) => {
      const target = e.target as HTMLParagraphElement
      if (target.classList.contains('language-select__languages--selected')) {
        return
      }

      // disabled for now until someone translated the app to english ;)
      return

      /* eslint-disable no-unreachable */
      switch (selected.value) {
        case Selected.German:
          selected.value = Selected.English
          break
        case Selected.English:
          selected.value = Selected.German
          break
      }
      for (const language of languages.value!.children) {
        language.classList.toggle('language-select__languages--selected')
      }
      /* eslint-enable no-unreachable */
    }

    return {
      switchSel,
      selectorClass,
      languages
    }
  }
})
</script>

<style lang="sass" scoped>

.tuf-dropdown-button
  display: inline-flex
  align-items: center
  justify-content: space-between
  padding: 8px 16px
  background-color: gray
  color: white
  border: none
  border-radius: var(--brd-rad)
  cursor: pointer
  font-size: 16px
  width: 100%

  &:hover
    background-color: gray

  &__icon
    margin-right: 16px
    display: flex
    align-items: center

  &__text
    flex-grow: 1
    display: flex
    align-items: center

.language-select
    position: relative
    display: grid
    grid-template-columns: min-content auto
    height: min-content
    min-width: min-content
    width: 125px

    .light & &__languages
      color: hsl(var(--clr-backgr))

    &__selector
        transition: all 200ms ease-in-out
        cursor: pointer
        color: hsl(var(--clr-accent) )
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
.soon
  position: absolute
  left: 30%
  top: 15%
  transform: rotate(-45deg)
  font-weight: 800
  color: hsl(var(--clr-white) )
  font-size: 1.5rem
  background-color: black

*[disabled]:not(.soon)
  color: hsl(var(--clr-white), .6)
</style>
