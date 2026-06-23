import { createI18n } from 'vue-i18n'
import { de } from './de'

type MessageSchema = typeof de
type Locale = 'de'

export const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false,
  globalInjection: true,
  locale: 'de',
  fallbackLocale: 'de',
  messages: { de }
})

export function t(key: string, params?: Record<string, unknown>, plural?: number) {
  if (plural === undefined) return i18n.global.t(key, params ?? {})
  return i18n.global.t(key, params ?? {}, plural)
}
