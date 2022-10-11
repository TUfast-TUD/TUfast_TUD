// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'slub'
const cookieSettings: CookieSettings = {
  portalName: 'slub',
  domain: 'slub-dresden.de'
};

(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class SlubLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {}

    async findCredentialsError (): Promise<boolean | HTMLElement | Element> {
      return document.getElementsByClassName('form-error')[0]
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('username') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        submitButton: document.querySelector('input[type="submit"]') as HTMLInputElement
      }
    }

    async findLogoutButtons (): Promise<(HTMLElement|Element|null)[] | NodeList | null> {
      return document.querySelectorAll('a[href^="https://www.slub-dresden.de/Shibboleth.sso/Logout"]')
    }
  }

  await (new SlubLogin()).start()
})()
