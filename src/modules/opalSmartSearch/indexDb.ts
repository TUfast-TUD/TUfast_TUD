import type { OpalSearchNode } from './types'
import { rebuildGraphFields } from './searchEngine/graph'
import { extractOpalRepositoryId } from './urlPolicy'

const DB_NAME = 'TUfastOpalSmartSearch'
// The abandoned Smart Search branch already opened version 2. Keeping it avoids IndexedDB downgrade
// errors for testers; future schema changes should increment from here and migrate in `onupgradeneeded`.
const DB_VERSION = 2
const STORE_NAME = 'nodes'

let dbPromise: Promise<IDBDatabase> | null = null
let indexRevision = 0
let writeQueue = Promise.resolve()

export function getOpalSearchIndexRevision(): number {
  return indexRevision
}

export function openOpalSearchDb(): Promise<IDBDatabase> {
  // Reuse the same db connection while the background script is alive
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

export function upsertGraphNodes(nodesToUpsert: OpalSearchNode[]): Promise<void> {
  return enqueueIndexWrite(() => upsertGraphNodesNow(nodesToUpsert))
}

async function upsertGraphNodesNow(nodesToUpsert: OpalSearchNode[]): Promise<void> {
  // Only store complete search nodes
  const validNodes = nodesToUpsert.filter((node) => node.id && node.title && node.url)
  if (validNodes.length === 0) return

  const now = Date.now()
  const byId = await getStoredOpalSearchNodes(validNodes.map((node) => node.id))

  for (const node of validNodes) {
    byId.set(node.id, mergeOpalSearchNode(byId.get(node.id), node, now))
  }

  await putOpalSearchNodes([...byId.values()])
  indexRevision += 1
}

export function mergeOpalSearchNode(
  existing: OpalSearchNode | undefined,
  node: OpalSearchNode,
  now: number
): OpalSearchNode {
  const addedVisits = Math.max(0, node.visitCount || 0)
  const wasVisited = addedVisits > 0
  // Producers emit optional fields as undefined; those must not erase stored values.
  const incoming = Object.fromEntries(Object.entries(node).filter(([, value]) => value !== undefined)) as OpalSearchNode

  return {
    ...existing,
    ...incoming,
    visitCount: (existing?.visitCount || 0) + addedVisits,
    lastVisited: wasVisited ? node.lastVisited || now : existing?.lastVisited || 0,
    indexedAt: now,
    source: existing?.source === 'user' ? 'user' : node.source ?? existing?.source
  }
}

export async function getOpalSearchNode(id: string): Promise<OpalSearchNode | undefined> {
  return withStore('readonly', (store) => store.get(id))
}

export function recordOpalSearchNodeVisit(id: string): Promise<boolean> {
  return enqueueIndexWrite(async () => {
    const node = await getOpalSearchNode(id)
    if (!node) return false

    await putOpalSearchNodes([
      {
        ...node,
        lastVisited: Date.now(),
        visitCount: (node.visitCount || 0) + 1,
        source: 'user'
      }
    ])
    indexRevision += 1
    return true
  })
}

export async function getAllOpalSearchNodes(): Promise<OpalSearchNode[]> {
  const nodes = await getAllStoredOpalSearchNodes()
  // Repair older entries when they are read
  return rebuildGraphFields(nodes)
}

export function clearOpalSearchIndex(): Promise<void> {
  return enqueueIndexWrite(clearOpalSearchIndexNow)
}

async function clearOpalSearchIndexNow(): Promise<void> {
  const db = await openOpalSearchDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  indexRevision += 1
}

export function pruneOpalSearchCourse(courseId: string, olderThan: number): Promise<number> {
  return enqueueIndexWrite(() => pruneOpalSearchCourseNow(courseId, olderThan))
}

async function pruneOpalSearchCourseNow(courseId: string, olderThan: number): Promise<number> {
  const repositoryId = extractOpalRepositoryId(courseId)
  if (!repositoryId || !Number.isFinite(olderThan)) return 0

  // User-visited nodes keep their visit history even when a crawl no longer emits them.
  const staleIds = (await getAllStoredOpalSearchNodes())
    .filter(
      (node) =>
        node.source !== 'user' &&
        extractOpalRepositoryId(node.courseId) === repositoryId &&
        (node.indexedAt || 0) < olderThan
    )
    .map((node) => node.id)
  if (staleIds.length === 0) return 0

  const db = await openOpalSearchDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    for (const id of staleIds) store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  indexRevision += 1
  return staleIds.length
}

function enqueueIndexWrite<T>(write: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(write)
  writeQueue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

export async function getOpalSearchIndexStats(): Promise<{ count: number; lastIndexedAt: number }> {
  const nodes = await getAllStoredOpalSearchNodes()
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

async function getAllStoredOpalSearchNodes(): Promise<OpalSearchNode[]> {
  return withStore('readonly', (store) => store.getAll())
}

async function getStoredOpalSearchNodes(ids: string[]): Promise<Map<string, OpalSearchNode>> {
  const db = await openOpalSearchDb()
  const uniqueIds = [...new Set(ids)]

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const nodes = new Map<string, OpalSearchNode>()

    for (const id of uniqueIds) {
      const request = store.get(id)
      request.onsuccess = () => {
        if (request.result) nodes.set(id, request.result)
      }
    }

    tx.oncomplete = () => resolve(nodes)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

async function putOpalSearchNodes(nodes: OpalSearchNode[]): Promise<void> {
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
