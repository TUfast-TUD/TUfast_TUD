<template>
  <h3 class="card-body-title">OPAL Smart Search</h3>
  <Setting v-model="enabled" :txt="smartSearchStrings.settingsEnable" />
  <Setting v-model="passiveIndexing" :txt="smartSearchStrings.settingsPassiveIndexing" />
  <Setting v-model="showPreloadPrompts" :txt="smartSearchStrings.settingsShowPreloadPrompts" />

  <p class="max-line p-margin">
    {{ smartSearchStrings.settingsPrivacy }}
  </p>
  <p class="max-line p-margin txt-help">{{ smartSearchStrings.settingsCredit }}</p>

  <div class="smart-search-actions">
    <button class="smart-search-button" :disabled="preloadRunning" @click="preloadNow">
      {{ smartSearchStrings.settingsPreloadNow }}
    </button>
    <button class="smart-search-button smart-search-button--secondary" @click="resetPreloadPrompts">
      {{ smartSearchStrings.settingsResetPreloadPrompts }}
    </button>
  </div>

  <div class="smart-search-status">
    <div>
      <span class="smart-search-status__label">{{ smartSearchStrings.settingsPreloadStatus }}</span>
      <strong>{{ preloadStatusLabel }}</strong>
    </div>
    <div>
      <span class="smart-search-status__label">{{ smartSearchStrings.settingsLocalEntries }}</span>
      <strong>{{ stats.count }}</strong>
    </div>
    <div>
      <span class="smart-search-status__label">{{ smartSearchStrings.settingsLastIndexed }}</span>
      <strong>{{ lastIndexedLabel }}</strong>
    </div>
  </div>

  <button class="smart-search-button smart-search-button--secondary" @click="clearIndex">
    {{ smartSearchStrings.settingsClearIndex }}
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from 'vue'

// types
import type {
  ResponseOpalSmartSearch,
  ResponseOpalSmartSearchPrompt,
  ResponseOpalSmartSearchProgress,
  ResponseOpalSmartSearchStats
} from '../types/SettingHandler'

// components
import Setting from '../components/Setting.vue'

// configurations
import { OPAL_SMART_SEARCH_STRINGS } from '../../../modules/opalSmartSearch/strings'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    Setting
  },
  setup() {
    const {
      opalSmartSearch,
      opalSmartSearchStats,
      opalSmartSearchProgress,
      opalSmartSearchPrompt,
      startOpalSmartSearchPreload,
      resetOpalSmartSearchPreloadPrompts,
      clearOpalSmartSearchIndex
    } = useSettingHandler()
    const enabled = ref(true)
    const passiveIndexing = ref(true)
    const showPreloadPrompts = ref(true)
    const stats = ref<ResponseOpalSmartSearchStats>({ count: 0, lastIndexedAt: 0 })
    const progress = ref<ResponseOpalSmartSearchProgress>({
      status: 'idle',
      startedAt: 0,
      updatedAt: 0,
      totalCourses: 0,
      completedCourses: 0,
      indexedItems: 0
    })
    const smartSearchStrings = OPAL_SMART_SEARCH_STRINGS
    let ready = false

    const load = async () => {
      const settings = (await opalSmartSearch('check')) as ResponseOpalSmartSearch
      const prompts = (await opalSmartSearchPrompt('check')) as ResponseOpalSmartSearchPrompt

      enabled.value = settings.enabled
      passiveIndexing.value = settings.passiveIndexing
      showPreloadPrompts.value = prompts.showPreloadPrompts
      await refreshStats()
      await refreshProgress()
      ready = true
    }

    const save = async () => {
      if (!ready) return
      await opalSmartSearch(enabled.value ? 'enable' : 'disable', 'enabled')
      await opalSmartSearch(passiveIndexing.value ? 'enable' : 'disable', 'passiveIndexing')
      await opalSmartSearchPrompt(showPreloadPrompts.value ? 'enable' : 'disable')
    }

    const refreshStats = async () => {
      stats.value = await opalSmartSearchStats()
    }

    const refreshProgress = async () => {
      progress.value = await opalSmartSearchProgress()
    }

    const preloadNow = async () => {
      await startOpalSmartSearchPreload()
      await refreshProgress()
    }

    const resetPreloadPrompts = async () => {
      await resetOpalSmartSearchPreloadPrompts()
      showPreloadPrompts.value = true
    }

    const clearIndex = async () => {
      await clearOpalSmartSearchIndex()
      await refreshStats()
    }

    const lastIndexedLabel = computed(() => {
      if (!stats.value.lastIndexedAt) return 'Noch nie'
      return new Date(stats.value.lastIndexedAt).toLocaleString()
    })

    const preloadRunning = computed(() => progress.value.status === 'running')

    const preloadStatusLabel = computed(() => {
      if (progress.value.status === 'running') return smartSearchStrings.settingsPreloadRunning
      if (progress.value.status === 'done') return smartSearchStrings.settingsPreloadDone
      return enabled.value ? smartSearchStrings.settingsPreloadEnabled : smartSearchStrings.settingsPreloadIdle
    })

    watch([enabled, passiveIndexing, showPreloadPrompts], save)
    onBeforeMount(load)

    return {
      enabled,
      passiveIndexing,
      showPreloadPrompts,
      stats,
      smartSearchStrings,
      lastIndexedLabel,
      preloadRunning,
      preloadStatusLabel,
      preloadNow,
      resetPreloadPrompts,
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

.smart-search-actions
  display: flex
  flex-wrap: wrap
  gap: 8px
  margin: 16px 0

.smart-search-button
  border: 0
  border-radius: var(--brd-rad-sm)
  padding: 10px 14px
  background: hsl(var(--clr-btn))
  color: hsl(var(--clr-text))
  cursor: pointer

  &:hover
    background: hsl(var(--clr-btnhov))

  &:disabled
    opacity: .5
    cursor: not-allowed

  &--secondary
    background: hsl(var(--clr-backgr))
</style>
