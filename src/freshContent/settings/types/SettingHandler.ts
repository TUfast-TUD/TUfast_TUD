export type Verbs = 'enable' | 'disable' | 'check'

export type OptionsOpalPdf = 'inline' | 'newtab'
export type ResponseOpalPdf = { inline: boolean, newtab: boolean }

export type OptionsOWA = 'fetch' | 'notification'
export type ResponseOWA = { fetch: boolean, notification: boolean }

export type OptionsSE = 'redirect'
export type ResponseSE = { redirect: boolean }
