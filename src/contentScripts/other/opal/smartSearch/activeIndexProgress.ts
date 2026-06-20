import {
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY
} from '../../../../modules/opalSmartSearch/settings'
import type { OpalActiveIndexProgress } from '../../../../modules/opalSmartSearch/types'

export type ActiveIndexProgressUpdate = Partial<Omit<OpalActiveIndexProgress, 'startedAt' | 'updatedAt'>> & {
  startedAt?: number
}

export async function publishActiveIndexProgress(
  update: ActiveIndexProgressUpdate
): Promise<OpalActiveIndexProgress> {
  const data = await chrome.storage.local.get([OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY])
  const previous = data[OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY] as OpalActiveIndexProgress | undefined
  const progress: OpalActiveIndexProgress = {
    status: update.status || previous?.status || 'idle',
    startedAt: update.startedAt || previous?.startedAt || Date.now(),
    updatedAt: Date.now(),
    totalCourses: update.totalCourses ?? previous?.totalCourses ?? 0,
    completedCourses: update.completedCourses ?? previous?.completedCourses ?? 0,
    indexedItems: update.indexedItems ?? previous?.indexedItems ?? 0,
    currentCourseTitle: update.currentCourseTitle
  }

  await chrome.storage.local.set({ [OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY]: progress })
  window.dispatchEvent(new CustomEvent(OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT, { detail: progress }))
  return progress
}
