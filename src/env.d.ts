/* eslint-disable no-var, no-unused-vars */

type TufastContentStrings = typeof import('./i18n/locales/de').de.content

declare global {
  var TUFAST_STRINGS: TufastContentStrings

  interface Window {
    TUFAST_STRINGS: TufastContentStrings
  }

  interface ImportMeta {
    glob<T>(pattern: string, options: { eager: true; import: 'default' }): Record<string, T>
  }
}

export {}
