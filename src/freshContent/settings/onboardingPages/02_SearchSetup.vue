<template>
  <h1 class="upper">
    Suchmaschinen-Superkräfte
  </h1>
  <div class="info">
    <p class="search-terms">
      <template
        v-for="site in uniqueSites"
        :key="site"
      >
        {{ site[0] }} → {{ site[1].name }}<br>
      </template>
    </p>
    <Setting
      v-model="searchEngineActive"
      txt="Abkürzungen aktivieren"
      :column="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

// components
import Setting from '../components/Setting.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

// the actual sites
import sites from '../../../contentScripts/forward/searchEngines/sites.json'

export default defineComponent({
  components: {
    //    Onboarding,
    Setting
  },
  setup () {
    const { se } = useSettingHandler()

    const searchEngineActive = ref(true)

    const uniqueSites = Object.entries(sites).filter(([_, site], idx, arr) => {
      return arr.findIndex(([_, site2]) => site2.url === site.url) === idx
    }).sort((a, b) => a[0].localeCompare(b[0]))

    const seUpdate = async () => {
      if (searchEngineActive.value) searchEngineActive.value = await se('enable', 'redirect') as boolean
      else await se('disable', 'redirect')
    }

    watch(searchEngineActive, seUpdate, { immediate: true })

    return {
      searchEngineActive,
      uniqueSites
    }
  }
})

</script>

<style lang="sass" scoped>
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>
