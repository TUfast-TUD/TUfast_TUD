import de from './locales/de'

type LocaleMessages = typeof de

// German is the typed fallback; every extra locale is discovered from this folder.
const localeModules = import.meta.glob<LocaleMessages>('./locales/*.ts', { eager: true, import: 'default' })

export type Locale = string

export const fallbackLocale: Locale = 'de'

export const messages = Object.fromEntries(
  Object.entries(localeModules).map(([path, message]) => [path.match(/\/([^/]+)\.ts$/)?.[1] || fallbackLocale, message])
) as Record<Locale, LocaleMessages>

let currentLocale: Locale = readStoredLocale()

function isLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && Object.prototype.hasOwnProperty.call(messages, locale)
}

function readStoredLocale(): Locale {
  try {
    if (typeof localStorage !== 'undefined') {
      const locale = localStorage.getItem('locale')
      if (isLocale(locale)) return locale
    }
  } catch (e) {
    // Ignore storage access errors and use German.
  }
  return fallbackLocale
}

export function getLocale() {
  return currentLocale
}

export function setLocale(locale: Locale) {
  if (!isLocale(locale)) return
  currentLocale = locale
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('locale', locale)
  } catch (e) {
    // Ignore storage access errors; the in-memory locale still applies.
  }
}

export async function initLocale() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const { locale } = await chrome.storage.local.get(['locale'])
      if (isLocale(locale)) setLocale(locale)
    }
  } catch (e) {
    // German remains the fallback if extension storage is unavailable.
  }
  return currentLocale
}

export function getLocaleMessages(locale: Locale = currentLocale) {
  return messages[isLocale(locale) ? locale : fallbackLocale]
}

export function getAvailableLocales() {
  return Object.entries(messages).map(([locale, message]) => ({ locale, label: message.localeName }))
}

export function getBrowserLocaleMessages() {
  const browserLocale = chrome.i18n?.getUILanguage?.().toLowerCase().split('-')[0]
  return getLocaleMessages(isLocale(browserLocale) ? browserLocale : fallbackLocale)
}

export function t(key: string, params?: Record<string, unknown>, plural?: number) {
  let message: unknown = getLocaleMessages()
  for (const part of key.split('.')) {
    if (!message || typeof message !== 'object' || !Object.prototype.hasOwnProperty.call(message, part)) {
      message = getLocaleMessages(fallbackLocale)
      for (const fallbackPart of key.split('.')) {
        if (!message || typeof message !== 'object' || !Object.prototype.hasOwnProperty.call(message, fallbackPart)) {
          return key
        }
        message = (message as Record<string, unknown>)[fallbackPart]
      }
      break
    }
    message = (message as Record<string, unknown>)[part]
  }

  if (typeof message !== 'string') return key

  const text = plural === undefined ? message : message.split('|')[plural === 1 ? 0 : 1]?.trim() || message
  return Object.entries(params ?? {}).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    text
  )
}
