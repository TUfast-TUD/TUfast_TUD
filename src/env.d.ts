/* eslint-disable no-var, no-unused-vars */

type TufastContentStrings = typeof import('./i18n/de').de.content

declare global {
  var TUFAST_STRINGS: TufastContentStrings

  interface Window {
    TUFAST_STRINGS: TufastContentStrings
  }
}

export {}
