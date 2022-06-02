// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'opal',
  domain: 'bildungsportal.sachsen.de',
  usesIdp: true
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class OpalLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {
      const observer = new MutationObserver(this.selectTU.bind(this))
      observer.observe(document.body, { subtree: true, childList: true })
      this.clickLogin()
    }

    selectTU (_records: MutationRecord[], observer: MutationObserver) {
      // "id4b" seems to be random generated, so we should probably not use it
      const select = document.querySelector('select[name="content:container:login:shibAuthForm:wayfselection"]') as HTMLSelectElement
      if (!select) return
      const value = Array.from(select.options).find(option => option.innerText === 'TU Dresden' || option.innerText === 'Technische Universität Dresden')?.value
      if (value) {
        observer.disconnect()
        select.value = value;
        // same here for "id51"
        (document.querySelector('button[name="content:container:login:shibAuthForm:shibLogin"]') as HTMLButtonElement | null)?.click()
      }
    }

    clickLogin () {
      (document.querySelector('a[title="Login"]') as HTMLAnchorElement|null)?.click()
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return false
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      // The title actually isn't translated when using Opal in Englisch. But for the future it's here.
      return [document.querySelector('a[title="Abmelden"]'), document.querySelector('a[title="Logout"]')]
    }

    async login (_userData: UserData, _loginFields?: LoginFields): Promise<void> { }
  }

  await (new OpalLogin()).start()
})()
