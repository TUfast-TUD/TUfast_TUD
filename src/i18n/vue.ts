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
