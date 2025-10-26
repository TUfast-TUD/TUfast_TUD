<template>
  <h3 class="card-body-title">Kurzbefehle in Suchmaschinen öffnen OPAL und weitere Tools direkt</h3>
  <Setting v-model="searchEngineActive" txt="Suchmaschinen Superkräfte aktivieren" />
  <p class="max-line p-margin">
    Gib z.B. "tumail" in der Google-Suche ein, um direkt zur Outlook-Web-App zu kommen. Es werden die meisten
    Suchmaschinen unterstützt!
  </p>

  <p class="search-terms p-margin">
    <template v-for="site in uniqueSites" :key="site">
      <span class="search-terms__bg"> {{ site[0] }}</span> → {{ site[1].name }}<br />
    </template>
  </p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'

// types
import type { ResponseSE } from '../types/SettingHandler'

// components
import Setting from '../components/Setting.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

// the actual sites
import sites from '../../../contentScripts/forward/searchEngines/sites.json'

export default defineComponent({
  components: {
    Setting
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
      uniqueSites
    }
  }
})
</script>

<style lang="sass" scoped>
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
