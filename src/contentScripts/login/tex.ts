// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'tex',
  domain: 'tex.zih.tu-dresden.de',
  usesIdp: true
};

(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class TexLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {
      this.clickLogin()
    }

    clickLogin () {
      (document.querySelector('a[href="/saml/login/go"]') as HTMLAnchorElement | null)?.click()
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return false
    }

    async findLogoutButtons (): Promise<(HTMLElement|Element|null)[] | NodeList | null> {
      return [document.querySelector('form[action="/logout"] button')]
    }

    async login (_userData: UserData, _loginFields?: LoginFields): Promise<void> { }
  }

  await (new TexLogin()).start()
})()
