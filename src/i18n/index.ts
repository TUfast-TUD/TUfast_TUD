import { createI18n } from 'vue-i18n'
import { de } from './de'

export const messages = { de } as const
export type Locale = keyof typeof messages
export type MessageSchema = typeof de

export const defaultLocale: Locale = 'de'

export const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false,
  globalInjection: true,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages
})

export function t(key: string, params?: Record<string, unknown>, plural?: number) {
  if (plural === undefined) return i18n.global.t(key, params ?? {})
  return i18n.global.t(key, params ?? {}, plural)
}

export function tm<T>(key: string) {
  return i18n.global.tm(key) as T
}

export { de as strings }
