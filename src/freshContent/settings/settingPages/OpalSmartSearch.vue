<template>
  <h3 class="card-body-title">{{ t('settings.pages.opalSmartSearch.title') }}</h3>
  <Setting v-model="enabled" :txt="t('settings.pages.opalSmartSearch.enableToggle')" />

  <p class="max-line p-margin">{{ t('settings.pages.opalSmartSearch.privacy') }}</p>

  <div class="smart-search-actions">
    <TufastButton :title="improveButtonLabel" :disabled="controlBusy || !enabled" @click="improveSmartSearch" />
    <p class="txt-help">{{ t('settings.pages.opalSmartSearch.improveHelp') }}</p>
  </div>

  <div class="smart-search-status" role="status" aria-live="polite">
    <strong>{{ smartSearchStatusLabel }}</strong>
    <span v-if="progressLabel">{{ progressLabel }}</span>
    <span v-else>{{ t('settings.pages.opalSmartSearch.lastIndexedLabel') }}: {{ lastIndexedLabel }}</span>
  </div>

  <button class="smart-search-delete" type="button" @click="clearIndex">
    {{ t('settings.pages.opalSmartSearch.deleteDataButton') }}
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'
import { t } from '../../../i18n'

import type {
  ResponseOpalSmartSearch,
  ResponseOpalSmartSearchProgress,
  ResponseOpalSmartSearchStats
} from '../types/SettingHandler'

import Setting from '../components/Setting.vue'
import TufastButton from '../components/Button.vue'
import { useSettingHandler } from '../composables/setting-handler'
import { SmartSearchKey } from '../../../modules/opalSmartSearch/settings'

const idleProgress = (): ResponseOpalSmartSearchProgress => ({
  status: 'idle',
  startedAt: 0,
  updatedAt: 0,
  totalCourses: 0,
  completedCourses: 0,
  failedCourses: 0,
  indexedItems: 0
})

export default defineComponent({
  components: {
    TufastButton,
    Setting
  },
  setup() {
    const {
      opalSmartSearch,
      opalSmartSearchStats,
      opalSmartSearchProgress,
      startOpalSmartSearchPreload,
      cancelOpalSmartSearchPreload,
      clearOpalSmartSearchIndex
    } = useSettingHandler()
    const enabled = ref(true)
    const stats = ref<ResponseOpalSmartSearchStats>({ count: 0, lastIndexedAt: 0 })
    const progress = ref<ResponseOpalSmartSearchProgress>(idleProgress())
    const controlPending = ref<'start' | 'stop' | null>(null)
    const controlError = ref(false)
    let controlRequestId = 0
    let ready = false

    const load = async () => {
      const settings = (await opalSmartSearch('check')) as ResponseOpalSmartSearch

      enabled.value = settings.enabled
      await refreshStats()
      await refreshProgress()
      ready = true
    }

    const save = async () => {
      if (!ready) return
      if (!enabled.value) {
        controlRequestId += 1
        controlPending.value = null
      }
      await opalSmartSearch(enabled.value ? 'enable' : 'disable', 'enabled')
    }

    const refreshStats = async () => {
      stats.value = await opalSmartSearchStats()
    }

    const refreshProgress = async () => {
      progress.value = await opalSmartSearchProgress()
    }

    const improveSmartSearch = async () => {
      const stopping =
        controlPending.value === 'start' || progress.value.status === 'starting' || progress.value.status === 'running'
      const currentControlRequest = ++controlRequestId
      controlPending.value = stopping ? 'stop' : 'start'
      controlError.value = false

      try {
        const succeeded = stopping ? await cancelOpalSmartSearchPreload() : await startOpalSmartSearchPreload()
        if (currentControlRequest !== controlRequestId) return
        if (!succeeded) throw new Error('SmartSearch indexing control failed')
        await refreshProgress()
      } catch {
        if (currentControlRequest !== controlRequestId) return
        controlError.value = true
      } finally {
        if (currentControlRequest === controlRequestId) controlPending.value = null
      }
    }

    const clearIndex = async () => {
      if (!window.confirm(t('settings.pages.opalSmartSearch.deleteDataConfirm'))) return
      controlRequestId += 1
      controlPending.value = null
      controlError.value = false
      try {
        if (!(await clearOpalSmartSearchIndex())) throw new Error('SmartSearch index deletion failed')
        await refreshStats()
        await refreshProgress()
      } catch {
        controlError.value = true
      }
    }

    const lastIndexedLabel = computed(() => {
      if (!stats.value.lastIndexedAt) return t('settings.pages.opalSmartSearch.never')
      return new Date(stats.value.lastIndexedAt).toLocaleString()
    })

    const improveRunning = computed(() => progress.value.status === 'starting' || progress.value.status === 'running')
    const controlBusy = computed(() => controlPending.value === 'stop')
    const improveButtonLabel = computed(() =>
      controlPending.value === 'stop'
        ? t('settings.pages.opalSmartSearch.statusStopping')
        : controlPending.value === 'start' || improveRunning.value
          ? t('settings.pages.opalSmartSearch.stopButton')
          : progress.value.status === 'failed'
            ? t('settings.pages.opalSmartSearch.retryButton')
            : t('settings.pages.opalSmartSearch.improveButton')
    )
    const progressLabel = computed(() => {
      if (!progress.value.totalCourses) return ''
      if (progress.value.status === 'failed')
        return t('settings.pages.opalSmartSearch.progressFailed', {
          processed: progress.value.completedCourses + progress.value.failedCourses,
          total: progress.value.totalCourses,
          successful: progress.value.completedCourses,
          failed: progress.value.failedCourses,
          entries: progress.value.indexedItems
        })
      if (progress.value.status === 'running')
        return t('settings.pages.opalSmartSearch.progressCourses', {
          processed: progress.value.completedCourses + progress.value.failedCourses,
          total: progress.value.totalCourses,
          entries: progress.value.indexedItems
        })
      return ''
    })
    const smartSearchStatusLabel = computed(() => {
      if (controlPending.value === 'start') return t('settings.pages.opalSmartSearch.statusStarting')
      if (controlPending.value === 'stop') return t('settings.pages.opalSmartSearch.statusStopping')
      if (controlError.value) return t('settings.pages.opalSmartSearch.statusControlFailed')
      if (progress.value.status === 'starting') return t('settings.pages.opalSmartSearch.statusStarting')
      if (progress.value.status === 'running') return t('settings.pages.opalSmartSearch.statusRunning')
      if (progress.value.status === 'done') return t('settings.pages.opalSmartSearch.statusDone')
      if (progress.value.status === 'failed') return t('settings.pages.opalSmartSearch.statusFailed')
      return enabled.value
        ? t('settings.pages.opalSmartSearch.statusReady')
        : t('settings.pages.opalSmartSearch.statusDisabled')
    })

    const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      const change = changes[SmartSearchKey.activeProgress]
      if (areaName !== 'local' || !change) return
      controlError.value = false
      progress.value = change.newValue ? (change.newValue as ResponseOpalSmartSearchProgress) : idleProgress()
      if (progress.value.status === 'done' || progress.value.status === 'failed') refreshStats()
      if (!change.newValue) refreshStats()
    }

    watch(enabled, save)
    onBeforeMount(() => {
      chrome.storage.onChanged.addListener(onStorageChanged)
      load()
    })
    onBeforeUnmount(() => chrome.storage.onChanged.removeListener(onStorageChanged))

    return {
      enabled,
      stats,
      lastIndexedLabel,
      improveRunning,
      controlBusy,
      improveButtonLabel,
      progressLabel,
      smartSearchStatusLabel,
      improveSmartSearch,
      clearIndex,
      t
    }
  }
})
</script>

<style lang="sass" scoped>
.smart-search-actions
  display: grid
  justify-items: start
  gap: 6px
  margin: 16px 0

.smart-search-actions p
  margin: 0

.smart-search-status
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 8px 16px
  margin: 16px 0
  padding: 12px
  border-radius: var(--brd-rad)
  background: hsl(var(--clr-backgr))

  span
    color: var(--clr-text-help)
    font-size: .85rem

.smart-search-delete
  border: 0
  padding: 4px 0
  background: transparent
  color: hsl(var(--clr-alert))
  cursor: pointer
  font: inherit
  text-decoration: underline
  text-underline-offset: 3px

  &:focus-visible
    outline: 2px solid hsl(var(--clr-focus))
    outline-offset: 3px
</style>
