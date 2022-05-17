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
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> { }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('field_user') as HTMLInputElement,
        passwordField: document.getElementById('field_pass') as HTMLInputElement,
        submitButton: document.getElementById('logIn_btn') as HTMLInputElement
      }
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      return [document.getElementById('logOut_btn')]
    }

    async login (userData: UserData, loginFields?: LoginFields): Promise<void> {
      if (!loginFields) return
      loginFields.usernameField.value = userData.user
      loginFields.passwordField.value = userData.pass
      loginFields.submitButton.click()
    }
  }

  await (new SelmaLogin()).start()
})()
