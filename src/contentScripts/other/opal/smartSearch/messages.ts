import type { OpalSearchNode, OpalSearchResult } from '../../../../modules/opalSmartSearch/types'

export function upsertOpalSearchNodes(nodes: OpalSearchNode[]): Promise<boolean> {
  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_upsert_nodes', nodes }).catch((error) => {
    console.warn('[TUfast Smart Search] Could not update local index:', error)
    return false
  })
}

export function getIndexedOpalSearchNode(id: string): Promise<OpalSearchNode | undefined> {
  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_get_node', id }).catch((error) => {
    console.warn('[TUfast Smart Search] Could not read local index:', error)
    return undefined
  })
}

export function searchIndexedOpalNodes(rawQuery: string, courseId = '', limit = 8): Promise<OpalSearchResult[]> {
  return chrome.runtime.sendMessage({ cmd: 'opal_smart_search_query', rawQuery, courseId, limit }).catch((error) => {
    console.warn('[TUfast Smart Search] Could not search local index:', error)
    return []
  })
}
