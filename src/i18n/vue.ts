import { createI18n } from 'vue-i18n'
import de from './locales/de.json'
import { fallbackLocale, getLocale, messages, type Locale } from '.'

type MessageSchema = typeof de

export const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false,
  globalInjection: true,
  locale: getLocale(),
  fallbackLocale,
  messages
})
