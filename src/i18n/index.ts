import de from './locales/de.json'

type LocaleMessages = typeof de

// German is the typed fallback; every extra locale is discovered from this folder.
const localeModules = import.meta.glob<LocaleMessages>('./locales/*.json', { eager: true, import: 'default' })

export type Locale = string
export type LocaleSetting = 'auto' | Locale

export const fallbackLocale: Locale = 'de'
export const defaultLocaleSetting: LocaleSetting = 'auto'

export const messages = Object.fromEntries(
  Object.entries(localeModules).map(([path, message]) => [
    path.match(/\/([^/]+)\.json$/)?.[1] || fallbackLocale,
    message
  ])
) as Record<Locale, LocaleMessages>

let currentLocaleSetting: LocaleSetting = readStoredLocaleSetting()
let currentLocale: Locale = resolveLocale(currentLocaleSetting)

function isLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && Object.prototype.hasOwnProperty.call(messages, locale)
}

function isLocaleSetting(locale: unknown): locale is LocaleSetting {
  return locale === 'auto' || isLocale(locale)
}

function readStoredLocaleSetting(): LocaleSetting {
  try {
    if (typeof localStorage !== 'undefined') {
      const locale = localStorage.getItem('locale')
      if (isLocaleSetting(locale)) return locale
    }
  } catch (e) {
    // Ignore storage access errors and use German.
  }
  return defaultLocaleSetting
}

export function getBrowserDefaultLocale(): Locale {
  const raw =
    (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage?.()) ||
    (typeof navigator !== 'undefined' && navigator.language) ||
    fallbackLocale
  const locale = raw.toLowerCase().split(/[-_]/)[0]
  return isLocale(locale) ? locale : fallbackLocale
}

function resolveLocale(locale: LocaleSetting): Locale {
  return locale === 'auto' ? getBrowserDefaultLocale() : locale
}

export function getLocale() {
  return currentLocale
}

export function getLocaleSetting() {
  return currentLocaleSetting
}

export function setLocale(locale: LocaleSetting) {
  if (!isLocaleSetting(locale)) return
  currentLocaleSetting = locale
  currentLocale = resolveLocale(locale)
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
      if (isLocaleSetting(locale)) setLocale(locale)
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
  const resolvedAuto = getLocaleMessages(getBrowserDefaultLocale()).localeName
  return [
    { locale: 'auto', label: `Auto (${resolvedAuto})` },
    ...Object.entries(messages).map(([locale, message]) => ({ locale, label: message.localeName }))
  ]
}

export function getBrowserLocaleMessages() {
  return getLocaleMessages(getBrowserDefaultLocale())
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
