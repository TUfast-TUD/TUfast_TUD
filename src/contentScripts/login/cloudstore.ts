// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'cloudstore',
  domain: 'cloudstore.zih.tu-dresden.de'
}

;(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class CloudstoreLogin extends common.Login {
    constructor() {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck(): Promise<void> {}

    async additionalFunctionsPostCheck(): Promise<void> {}

    async findCredentialsError(): Promise<boolean | HTMLElement | Element> {
      return document.getElementsByClassName('wrongPasswordMsg')[0]
    }

    async loginFieldsAvailable(): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('user') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        submitButton: document.getElementById('submit-form') as HTMLInputElement
      }
    }

    async findLogoutButtons(): Promise<(HTMLElement | Element | null)[] | NodeList | null> {
      return [document.querySelector('[data-id="logout"] > a')]
    }
  }

  await new CloudstoreLogin().start()
})()
