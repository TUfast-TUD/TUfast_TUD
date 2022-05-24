// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, Login, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'cloudstore',
  domain: 'cloudstore.zih.tu-dresden.de'
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class CloudstoreLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> { }

    async findCredentialsError(): Promise<boolean | HTMLElement | Element> {
        return document.getElementsByClassName('wrongPasswordMsg')[0]
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('user') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        submitButton: document.getElementById('submit-form') as HTMLInputElement
      }
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      return [document.querySelector('[data-id="logout"] > a')]
    }

    async login (userData: UserData, loginFields?: LoginFields): Promise<void> {
      if (!loginFields) return
      loginFields.usernameField.value = userData.user
      loginFields.passwordField.value = userData.pass
      loginFields.submitButton.click()
    }
  }

  await (new CloudstoreLogin()).start()
})()
