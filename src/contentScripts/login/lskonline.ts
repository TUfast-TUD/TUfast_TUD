// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'lskonline',
  domain: 'lskonline.tu-dresden.de'
}

;(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class LSKLogin extends common.Login {
    constructor() {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck(): Promise<void> {}

    async additionalFunctionsPostCheck(): Promise<void> {
      this.clickLogin()
    }

    clickLogin() {
      const link = Array.from(document.getElementsByTagName('a')).find((link) => link?.innerText === 'Login')
      if (link && !link.id.includes('selected')) link.click()
    }

    // We don't need this check for wrong credentials here as it's a nother page where "Login" is selected
    // but no input fields are available.

    async loginFieldsAvailable(): Promise<boolean | LoginFields> {
      return {
        usernameField: document.querySelector('input[name="j_username"]') as HTMLInputElement,
        passwordField: document.querySelector('input[name="j_password"]') as HTMLInputElement,
        submitButton: document.querySelector('input[type="submit"]') as HTMLInputElement
      }
    }

    async findLogoutButtons(): Promise<(HTMLElement | Element | null)[] | NodeList | null> {
      // There should only be one button but let's be safe
      return Array.from(document.getElementsByTagName('a')).filter((link) => link?.innerText === 'Logout')
    }
  }

  await new LSKLogin().start()
})()
