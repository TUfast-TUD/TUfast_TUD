export type Verbs = 'enable' | 'disable' | 'check'

export type OptionsOpalPdf = 'inline' | 'newtab'
export type ResponseOpalPdf = { inline: boolean; newtab: boolean }

export type OptionsOWA = 'fetch' | 'notification'
export type ResponseOWA = { fetch: boolean; notification: boolean }

export type OptionsSE = 'redirect'
export type ResponseSE = { redirect: boolean }

export type OptionsOpalSmartSearch = 'enabled' | 'passiveIndexing'
export type ResponseOpalSmartSearch = { enabled: boolean; passiveIndexing: boolean; activeIndexing: boolean }
export type ResponseOpalSmartSearchStats = { count: number; lastIndexedAt: number }
export type ResponseOpalSmartSearchProgress = {
  status: 'idle' | 'running' | 'done'
  startedAt: number
  updatedAt: number
  totalCourses: number
  completedCourses: number
  indexedItems: number
  currentCourseTitle?: string
}
export type ResponseOpalSmartSearchPrompt = { showPreloadPrompts: boolean; dismissed: boolean }
