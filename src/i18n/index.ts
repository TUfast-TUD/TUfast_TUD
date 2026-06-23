import { de } from './de'

export function t(key: string, params?: Record<string, unknown>, plural?: number) {
  let message: unknown = de
  for (const part of key.split('.')) {
    if (!message || typeof message !== 'object' || !Object.prototype.hasOwnProperty.call(message, part)) return key
    message = (message as Record<string, unknown>)[part]
  }

  if (typeof message !== 'string') return key

  const text = plural === undefined ? message : message.split('|')[plural === 1 ? 0 : 1]?.trim() || message
  return Object.entries(params ?? {}).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    text
  )
}
