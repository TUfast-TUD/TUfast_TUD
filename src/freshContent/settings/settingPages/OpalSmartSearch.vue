<template>
  <h3 class="card-body-title">OPAL Smart Search</h3>
  <Setting v-model="enabled" :txt="smartSearchStrings.settingsEnable" />
  <Setting v-model="passiveIndexing" :txt="smartSearchStrings.settingsPassiveIndexing" />
  <Setting v-model="activeIndexing" :txt="smartSearchStrings.settingsActiveIndexing" />

  <p class="max-line p-margin">
    {{ smartSearchStrings.settingsPrivacy }}
  </p>
  <p class="max-line p-margin txt-help">{{ smartSearchStrings.settingsCredit }}</p>

  <div class="smart-search-status">
    <div>
      <span class="smart-search-status__label">{{ smartSearchStrings.settingsLocalEntries }}</span>
      <strong>{{ stats.count }}</strong>
    </div>
    <div>
      <span class="smart-search-status__label">{{ smartSearchStrings.settingsLastIndexed }}</span>
      <strong>{{ lastIndexedLabel }}</strong>
    </div>
  </div>

  <button class="smart-search-clear" @click="clearIndex">{{ smartSearchStrings.settingsClearIndex }}</button>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from 'vue'

// types
import type { OpalSmartSearchSettings } from '../../../modules/opalSmartSearch/types'

// components
import Setting from '../components/Setting.vue'

// configurations
import { OPAL_SMART_SEARCH_STRINGS } from '../../../modules/opalSmartSearch/strings'

const DEFAULT_SMART_SEARCH_SETTINGS: OpalSmartSearchSettings = {
  enabled: true,
  passiveIndexing: true,
  activeIndexing: false
}

export default defineComponent({
  components: {
    Setting
  },
  setup() {
    const enabled = ref(true)
    const passiveIndexing = ref(true)
    const activeIndexing = ref(false)
    const stats = ref({ count: 0, lastIndexedAt: 0 })
    const smartSearchStrings = OPAL_SMART_SEARCH_STRINGS
    let ready = false

    const load = async () => {
      const stored = await chrome.storage.local.get({
        opalSmartSearchSettings: DEFAULT_SMART_SEARCH_SETTINGS
      })
      const settings = {
        ...DEFAULT_SMART_SEARCH_SETTINGS,
        ...(stored.opalSmartSearchSettings as Partial<OpalSmartSearchSettings>)
      }

      enabled.value = settings.enabled
      passiveIndexing.value = settings.passiveIndexing
      activeIndexing.value = settings.activeIndexing
      await refreshStats()
      ready = true
    }

    const save = async () => {
      if (!ready) return
      await chrome.storage.local.set({
        opalSmartSearchSettings: {
          enabled: enabled.value,
          passiveIndexing: passiveIndexing.value,
          activeIndexing: activeIndexing.value
        }
      })
    }

    const refreshStats = async () => {
      const response = await chrome.runtime.sendMessage({ cmd: 'opal_smart_search_stats' })
      stats.value = response || { count: 0, lastIndexedAt: 0 }
    }

    const clearIndex = async () => {
      await chrome.runtime.sendMessage({ cmd: 'opal_smart_search_clear' })
      await refreshStats()
    }

    const lastIndexedLabel = computed(() => {
      if (!stats.value.lastIndexedAt) return 'Noch nie'
      return new Date(stats.value.lastIndexedAt).toLocaleString()
    })

    watch([enabled, passiveIndexing, activeIndexing], save)
    onBeforeMount(load)

    return {
      enabled,
      passiveIndexing,
      activeIndexing,
      stats,
      smartSearchStrings,
      lastIndexedLabel,
      clearIndex
    }
  }
})
</script>

<style lang="sass" scoped>
.smart-search-status
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))
  gap: 12px
  margin: 16px 0

  div
    padding: 12px
    border-radius: var(--brd-rad-sm)
    background: hsl(var(--clr-backgr))

  strong
    display: block
    margin-top: 4px

  &__label
    display: block
    color: var(--clr-text-help)
    font-size: .85rem

.smart-search-clear
  border: 0
  border-radius: var(--brd-rad-sm)
  padding: 10px 14px
  background: hsl(var(--clr-btn))
  color: hsl(var(--clr-text))
  cursor: pointer

  &:hover
    background: hsl(var(--clr-btnhov))
</style>
