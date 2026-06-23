/* eslint-disable no-var, no-unused-vars */

type TufastContentStrings = typeof import('./i18n/de').de.content
type TufastContentScriptStrings = {
  opal: TufastContentStrings['opal']
  hisqis: TufastContentStrings['hisqis']
  selma: TufastContentStrings['selma']
  otp: TufastContentStrings['otp']
}

declare global {
  var TUFAST_STRINGS: TufastContentScriptStrings

  interface Window {
    TUFAST_STRINGS: TufastContentScriptStrings
  }
}

export {}
