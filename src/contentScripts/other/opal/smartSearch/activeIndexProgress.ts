import { smartSearchProgressEvent } from '../../../../modules/opalSmartSearch/settings'
import type { OpalActiveIndexProgress } from '../../../../modules/opalSmartSearch/types'

export type ActiveIndexProgressUpdate = Partial<
  Omit<OpalActiveIndexProgress, 'startedAt' | 'updatedAt' | 'ownerTabId'>
> & {
  startedAt?: number
}

export async function publishActiveIndexProgress(update: ActiveIndexProgressUpdate): Promise<OpalActiveIndexProgress> {
  const progress = (await chrome.runtime.sendMessage({
    cmd: 'opal_smart_search_publish_progress',
    update
  })) as OpalActiveIndexProgress
  window.dispatchEvent(new CustomEvent(smartSearchProgressEvent, { detail: progress }))
  return progress
}
