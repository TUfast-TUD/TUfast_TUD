export type OpalSearchNodeType = 'course' | 'folder' | 'file' | 'action'

export interface OpalSearchNode {
  id: string
  title: string
  url: string
  type: OpalSearchNodeType
  courseId: string
  parentId: string | null
  lastVisited: number
  visitCount: number
  fileExtension?: string
  source?: 'user' | 'active'
  indexedAt?: number
  lastFetchedAt?: number
  structureHash?: string
  searchText?: string
  pathIds?: string[]
  pathTitles?: string[]
  titleTokens?: string[]
  pathTokens?: string[]
  titleNumbers?: string[]
  pathNumbers?: string[]
  numbers?: string[]
  primaryTitleNumber?: string
  aliases?: string[]
  childrenIds?: string[]
}

export interface OpalSearchResult {
  node: OpalSearchNode
  score: number
  explanation?: string[]
}

export interface OpalSmartSearchSettings {
  enabled: boolean
  passiveIndexing: boolean
  activeIndexing: boolean
}

export interface OpalActiveIndexProgress {
  status: 'idle' | 'running' | 'done'
  startedAt: number
  updatedAt: number
  totalCourses: number
  completedCourses: number
  indexedItems: number
  currentCourseTitle?: string
}

export interface OpalStoredCourse {
  name?: string
  title?: string
  link?: string
  href?: string
}
