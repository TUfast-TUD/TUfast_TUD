// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'opal',
  domain: 'bildungsportal.sachsen.de'
};

(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class OpalLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {
      this.selectTU()
    }

    selectTU () {
      // "id2" seems to be random generated, so we should probably not use it
      const select = document.querySelector('select[name="wayfselection"]') as HTMLSelectElement | null
      if (!select) return
      const value = Array.from(select.options).find(option => option.innerText === 'TU Dresden' || option.innerText === 'Technische Universität Dresden')?.value
      if (value) {
        select.value = value;
        // same here for "id11"
        (document.querySelector('button[name="shibLogin"]') as HTMLButtonElement | null)?.click()
      }
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return false
    }

    async findLogoutButtons (): Promise<(HTMLElement|Element|null)[] | NodeList | null> {
      return [document.getElementById('logOut_btn')]
    }

    async login (_userData: UserData, _loginFields?: LoginFields): Promise<void> { }
  }

  await (new OpalLogin()).start()
})()
