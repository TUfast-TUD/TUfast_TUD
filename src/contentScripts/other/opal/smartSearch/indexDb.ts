import type { OpalSearchNode } from './types'
import { rebuildGraphFields } from './searchEngine/graph'

const DB_NAME = 'TUfastOpalSmartSearch'
const DB_VERSION = 2
const STORE_NAME = 'nodes'

let dbPromise: Promise<IDBDatabase> | null = null

export function openOpalSearchDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.objectStoreNames.contains(STORE_NAME)
        ? request.transaction!.objectStore(STORE_NAME)
        : db.createObjectStore(STORE_NAME, { keyPath: 'id' })

      createIndex(store, 'courseId')
      createIndex(store, 'parentId')
      createIndex(store, 'type')
      createIndex(store, 'lastVisited')
      createIndex(store, 'indexedAt')
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

export async function upsertOpalSearchNode(node: OpalSearchNode): Promise<void> {
  await upsertGraphNode(node)
}

export async function upsertGraphNode(node: OpalSearchNode): Promise<void> {
  if (!node.id || !node.title || !node.url) return
  await upsertGraphNodes([node])
}

export async function upsertGraphNodes(nodesToUpsert: OpalSearchNode[]): Promise<void> {
  const validNodes = nodesToUpsert.filter((node) => node.id && node.title && node.url)
  if (validNodes.length === 0) return

  const now = Date.now()
  const existingNodes = await getAllOpalSearchNodes()
  const byId = new Map(existingNodes.map((entry) => [entry.id, entry]))

  for (const node of validNodes) {
    const existing = byId.get(node.id)
    const merged: OpalSearchNode = existing
      ? {
          ...existing,
          ...node,
          visitCount: (existing.visitCount || 0) + 1,
          lastVisited: now,
          indexedAt: now,
          source: existing.source === 'user' ? 'user' : node.source || existing.source
        }
      : {
          ...node,
          visitCount: node.visitCount || 1,
          lastVisited: node.lastVisited || now,
          indexedAt: now
        }

    byId.set(merged.id, merged)
  }

  // Parent and path metadata depend on the whole local tree, so rebuild after each batch.
  // This also repairs old v1 entries that do not yet have graph fields.
  await putAllOpalSearchNodes(rebuildGraphFields([...byId.values()]))
}

export async function getOpalSearchNode(id: string): Promise<OpalSearchNode | undefined> {
  return withStore('readonly', (store) => store.get(id))
}

export async function getAllOpalSearchNodes(): Promise<OpalSearchNode[]> {
  const nodes = await withStore('readonly', (store) => store.getAll())
  // Keep reads backward compatible with pre-graph IndexedDB entries.
  return rebuildGraphFields(nodes)
}

export async function clearOpalSearchIndex(): Promise<void> {
  await withStore('readwrite', (store) => store.clear())
}

export async function getOpalSearchIndexStats(): Promise<{ count: number; lastIndexedAt: number }> {
  const nodes = await getAllOpalSearchNodes()
  return {
    count: nodes.length,
    lastIndexedAt: nodes.reduce((latest, node) => Math.max(latest, node.indexedAt || node.lastVisited || 0), 0)
  }
}

async function withStore<T>(mode: 'readonly' | 'readwrite', run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openOpalSearchDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = run(tx.objectStore(STORE_NAME))

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.onerror = () => reject(tx.error)
  })
}

async function putAllOpalSearchNodes(nodes: OpalSearchNode[]): Promise<void> {
  const db = await openOpalSearchDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    for (const node of nodes) store.put(node)

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function createIndex(store: IDBObjectStore, name: string): void {
  if (!store.indexNames.contains(name)) store.createIndex(name, name)
}
