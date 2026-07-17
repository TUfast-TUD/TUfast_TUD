import type { OpalSearchNode, OpalSearchResult } from '../../../../modules/opalSmartSearch/types'

export function upsertOpalSearchNodes(nodes: OpalSearchNode[], jobStartedAt?: number): Promise<boolean> {
  if (nodes.length === 0) return Promise.resolve(true)

  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_upsert_nodes', nodes, jobStartedAt }).then((updated) => {
    if (!updated) throw new Error('Background rejected the index update')
    return true
  })
}

export function pruneIndexedOpalCourse(courseId: string, olderThan: number, jobStartedAt: number): Promise<number> {
  return chrome.runtime
    .sendMessage({ cmd: 'opal_smart_search_prune_course', courseId, olderThan, jobStartedAt })
    .then((deleted) => {
      if (typeof deleted !== 'number') throw new Error('Background rejected course pruning')
      return deleted
    })
}

export function commitActiveIndexedCourse(
  courseUrl: string,
  jobStartedAt: number,
  successful: boolean
): Promise<{ completedCourses: number; failedCourses: number }> {
  return chrome.runtime
    .sendMessage({ cmd: 'opal_smart_search_commit_course', courseUrl, jobStartedAt, successful })
    .then((committed) => {
      if (!committed || typeof committed.completedCourses !== 'number' || typeof committed.failedCourses !== 'number')
        throw new Error('Background rejected the course completion')
      return committed
    })
}

export function claimActiveIndexJob(jobStartedAt: number): Promise<boolean> {
  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_claim_job', jobStartedAt }).then(Boolean)
}

export function getIndexedOpalSearchNode(id: string): Promise<OpalSearchNode | undefined> {
  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_get_node', id }).catch((error) => {
    console.warn('[TUfast Smart Search] Could not read local index:', error)
    return undefined
  })
}

export function getOpalSearchIndexStats(): Promise<{ count: number; lastIndexedAt: number }> {
  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_stats' }).catch((error) => {
    console.warn('[TUfast Smart Search] Could not read local index stats:', error)
    return { count: 0, lastIndexedAt: 0 }
  })
}

export function searchIndexedOpalNodes(rawQuery: string, courseId?: string, limit = 8): Promise<OpalSearchResult[]> {
  const message = {
    cmd: 'opal_smart_search_query',
    rawQuery,
    limit,
    ...(courseId ? { courseId } : {})
  }

  return chrome.runtime
    .sendMessage(message)
    .then((results: unknown) => {
      if (!Array.isArray(results)) throw new Error('SmartSearch query returned no result')
      return results as OpalSearchResult[]
    })
    .catch((error) => {
      console.warn('[TUfast Smart Search] Could not search local index:', error)
      throw error
    })
}
