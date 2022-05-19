// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, Login, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'eportalMed',
  domain: 'eportal.med.tu-dresden.de'
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class MedLogin extends common.Login {
    constructor() {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck(): Promise<void> { }

    async additionalFunctionsPostCheck(): Promise<void> {
      this.clickLogin()
    }

    clickLogin() {
      (document.getElementById('personaltools-login') as HTMLAnchorElement | null)?.click()
    }

    async loginFieldsAvailable(): Promise<boolean | LoginFields> {
      return false
    }

    async findLogoutButtons(): Promise<HTMLElement[]> {
      return [document.getElementById('personaltools-logout')]
    }

    async login(_userData: UserData, _loginFields?: LoginFields): Promise<void> { }

  }

  await (new MedLogin()).start()
})()
