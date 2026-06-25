<template>
  <div class="language-select">
    <button
      v-for="option in options"
      :key="option.locale"
      type="button"
      class="language-select__option"
      :class="{ 'language-select__option--selected': selected === option.locale }"
      @click="selectLocale(option.locale)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { getAvailableLocales, setLocale, type Locale } from '../../../i18n'
import { useChrome } from '../composables/chrome'

export default defineComponent({
  setup() {
    const { getChromeLocalStorage, setChromeLocalStorage } = useChrome()
    const selected = ref<Locale>('de')
    const options = getAvailableLocales()

    const selectLocale = async (locale: Locale) => {
      if (selected.value === locale) return
      selected.value = locale
      setLocale(locale)
      await setChromeLocalStorage({ locale })
      window.location.reload()
    }

    onMounted(async () => {
      const locale = (await getChromeLocalStorage('locale')) as Locale | undefined
      if (locale) {
        selected.value = locale
        setLocale(locale)
      }
    })

    return {
      options,
      selected,
      selectLocale
    }
  }
})
</script>

<style lang="sass" scoped>
.language-select
  display: flex
  gap: 8px

  &__option
    border: 2px solid hsl(var(--clr-text))
    border-radius: var(--brd-rad-sm)
    background: transparent
    color: hsl(var(--clr-text))
    cursor: pointer
    font: inherit
    padding: 8px 12px

    &--selected
      border-color: hsl(var(--clr-accent))
      background: hsla(var(--clr-accent), .2)
      font-weight: 600
</style>
