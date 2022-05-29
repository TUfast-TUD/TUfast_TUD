// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, Login, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'selma',
  domain: 'selma.tu-dresden.de'
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class SelmaLogin extends common.Login {
    constructor() {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck(): Promise<void> { }

    async additionalFunctionsPostCheck(): Promise<void> { }

    async findCredentialsError(): Promise<boolean | HTMLElement | Element> {
      const header = document.getElementsByTagName('h1')[0]
      if(!header) return false
      
      const ger = header.innerText === 'Benutzername oder Passwort falsch'
      // Currently the error message is not localized.
      // But here's a blindport to the German error message.
      const eng = header.innerText === 'Username or password is wrong' 
      return ger || eng
    }

    async loginFieldsAvailable(): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('field_user') as HTMLInputElement,
        passwordField: document.getElementById('field_pass') as HTMLInputElement,
        submitButton: document.getElementById('logIn_btn') as HTMLInputElement
      }
    }

    async findLogoutButtons(): Promise<HTMLElement[]> {
      return [document.getElementById('logOut_btn')]
    }
  }

  await (new SelmaLogin()).start()
})()
