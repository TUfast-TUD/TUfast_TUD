<template>
  <p class="txt-help txt-center"></p>
  <div class="onboarding-inner-info">
    <SearchEngines />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'

// types
import type { ResponseSE } from '../types/SettingHandler'

// components
import SearchEngines from '../settingPages/SearchEngines.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

// the actual sites
import sites from '../../../contentScripts/forward/searchEngines/sites.json'

export default defineComponent({
  components: {
    SearchEngines
  },
  setup() {
    const { se } = useSettingHandler()
    const searchEngineActive = ref(false)

    const uniqueSites = Object.entries(sites)
      .filter(([_, site], idx, arr) => {
        return arr.findIndex(([_, site2]) => site2.url === site.url) === idx
      })
      .sort((a, b) => a[0].localeCompare(b[0]))

    onBeforeMount(async () => {
      const { redirect } = (await se('check', 'redirect')) as ResponseSE

      searchEngineActive.value = redirect

      watch(searchEngineActive, seUpdate)
    })

    const seUpdate = async () => {
      if (searchEngineActive.value) {
        searchEngineActive.value = (await se('enable', 'redirect')) as boolean
      } else await se('disable', 'redirect')
    }

    return {
      searchEngineActive,
      uniqueSites,
      SearchEngines
    }
  }
})
</script>

<style lang="sass" scoped>
:deep(.onboarding-hide)
    display: none !important

:deep(.onboarding-margin)
    margin-top: 32px

.search-terms
    line-height: 2.5
    margin-left: 1rem

    &__bg
        margin-top: 4px
        margin-bottom: 4px
        padding: 4px
        border-radius: var(--brd-rad-sm)
        background-color: hsl(var(--clr-backgr))

    @media (prefers-color-scheme: light)
        color: var(--clr-text-help)
</style>
