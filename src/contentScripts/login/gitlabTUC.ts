// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'gitlabTUC',
  domain: 'gitlab.hrz.tu-chemnitz.de'
};

(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class GlTUC extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {
      (document.getElementById('remember_me') as HTMLInputElement).checked = true;
      (document.getElementById('oauth-login-shibboleth') as HTMLButtonElement).click()
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return false
    }

    async findLogoutButtons (): Promise<(HTMLElement|Element|null)[] | NodeList | null> {
      return document.querySelectorAll('a.sign-out-link')
    }
  }

  await (new GlTUC()).start()
})()
