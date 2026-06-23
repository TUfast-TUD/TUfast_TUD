<template>
  <div class="dropdown-list">
    <div
      v-for="(study, key, index) in studies"
      :key="index"
      :class="`dropdown-list__item ${selectedStudy === key ? 'dropdown-list__item--selected' : ''}`"
      tabindex="0"
      @click="setStudySubject(key)"
      @keyup.enter="setStudySubject(key)"
      @keyup.space="setStudySubject(key)"
    >
      <img
        v-if="study.fsr_icon"
        class="dropdown-list__image"
        :src="study.fsr_icon"
        :alt="t('settings.faculty.alt', { name: facultyName(String(key), study.name) })"
      />
      <h3 class="dropdown-list__title">
        {{ facultyName(String(key), study.name) }}
      </h3>
      <div v-if="selectedStudy === key" class="dropdown-list__icon-selected">
        <IconCheck size="32px" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { useChrome } from '../composables/chrome'
import studies from '../../studies.json'
import { t } from '../../../i18n'

export default defineComponent({
  props: {
    title: {
      type: String as PropType<string>,
      default: t('settings.faculty.placeholder')
    }
  },
  setup() {
    const { getChromeLocalStorage, setChromeLocalStorage } = useChrome()
    const clicked = ref(false)
    const selectedStudy = ref(t('settings.faculty.default'))

    getChromeLocalStorage('studiengang').then((studiengang) => {
      selectedStudy.value = (studiengang as string | undefined) || t('settings.faculty.default')
    })

    const setStudySubject = async (studiengang: string) => {
      if (studiengang === 'addStudiengang') {
        window.open(`mailto:frage@tu-fast.de?Subject=${t('settings.faculty.mailSubject')}`, '_blank')
        return
      }
      selectedStudy.value = studiengang
      await setChromeLocalStorage({ studiengang })
    }

    const facultyName = (key: string, fallback: string) => {
      const value = t(`settings.faculty.names.${key}`)
      return value === `settings.faculty.names.${key}` ? fallback : value
    }

    return {
      studies,
      clicked,
      setStudySubject,
      selectedStudy,
      facultyName,
      t
    }
  }
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
        user-select: none

.dropdown-list

    &__item
        cursor: pointer
        position: relative
        display: flex
        align-items: center
        background-color: hsl(var(--clr-btnhov))
        height: 96px
        padding: 1rem 1rem
        z-index: 2
        border-radius: var(--brd-rad)
        margin-bottom: 16px
        color: hsl(var(--clr-text))

        &:hover
            background-color: hsl(var(--clr-btnhov2))

        &--selected
            border: solid 2px hsl(var(--clr-accent))

    &__image
        height: 100%
        min-height: 64px
        min-width: 120px
        aspect-ratio: 1.875
        object-fit: contain
        object-position: center
        background-color: hsl(var(--clr-white))
        padding: 4px
        border-radius: var(--brd-rad-sm)

        @media screen and (max-width: 650px)
            min-height: 64px
            max-height: 64px
            min-width: 64px
            max-width: 64px
            object-fit: contain

    &__title
        margin-left: 16

    &__icon-selected
        color: hsl(var(--clr-text))
        margin-left: auto

.light .dropdown-list
  &__item
    &:hover
      color: hsl(var(--clr-white) )
</style>
