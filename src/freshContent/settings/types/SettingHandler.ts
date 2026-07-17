export type Verbs = 'enable' | 'disable' | 'check'

export type OptionsOpalPdf = 'inline' | 'newtab'
export type ResponseOpalPdf = { inline: boolean; newtab: boolean }

export type OptionsOWA = 'fetch' | 'notification'
export type ResponseOWA = { fetch: boolean; notification: boolean }

export type OptionsSE = 'redirect'
export type ResponseSE = { redirect: boolean }

export type OptionsOpalSmartSearch = 'enabled'
export type ResponseOpalSmartSearch = {
  enabled: boolean
}
export type ResponseOpalSmartSearchStats = { count: number; lastIndexedAt: number }
export type ResponseOpalSmartSearchProgress = {
  status: 'idle' | 'starting' | 'running' | 'done' | 'failed'
  startedAt: number
  updatedAt: number
  totalCourses: number
  completedCourses: number
  failedCourses: number
  indexedItems: number
  currentCourseTitle?: string
}
