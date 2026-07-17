export type OpalSearchNodeType = 'course' | 'folder' | 'file'

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
  pathTitles?: string[]
  titleTokens?: string[]
  pathTokens?: string[]
  titleNumbers?: string[]
  pathNumbers?: string[]
  primaryTitleNumber?: string
  aliases?: string[]
  childrenIds?: string[]
}

export interface OpalSearchResult {
  node: OpalSearchNode
  score: number
}

export interface OpalSmartSearchSettings {
  enabled: boolean
}

export interface OpalActiveIndexProgress {
  status: 'idle' | 'starting' | 'running' | 'done' | 'failed'
  startedAt: number
  updatedAt: number
  ownerTabId?: number
  totalCourses: number
  completedCourses: number
  failedCourses?: number
  indexedItems: number
  currentCourseTitle?: string
}

export interface OpalStoredCourse {
  name?: string
  title?: string
  link?: string
  href?: string
}
