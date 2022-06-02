// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'jexam',
  domain: 'jexam.inf.tu-dresden.de'
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class JExamLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> { }

    async findCredentialsError (): Promise<boolean | HTMLElement | Element> {
      const params = new URLSearchParams(window.location.search)
      return params.get('error') === 'badcredentials'
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('username') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        // Currently there is no english login page but if that changes, this should also catch the english button
        submitButton: document.querySelector('input[type="submit"]') as HTMLInputElement
      }
    }

    async findLogoutButtons (): Promise<NodeList> {
      // There should only be one button but let's be safe
      return document.querySelectorAll('a[href$="/logout"]')
    }
  }

  await (new JExamLogin()).start()
})()
