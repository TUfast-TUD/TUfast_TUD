// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, Login, LoginFields } from './common'

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

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('username') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        // Currently there is no english login page but if that changes, this should also catch the english button
        submitButton: (document.querySelector('input[type="submit"][value="Anmelden"].submit') || document.querySelector('input[type="submit"][value="Login"].submit')) as HTMLInputElement
      }
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      // There should only be one button but let's be safe
      return Array.from(document.querySelectorAll('a[href$="/logout"]'))
    }

    async login (userData: UserData, loginFields?: LoginFields): Promise<void> {
      if (!loginFields) return
      loginFields.usernameField.value = userData.user
      loginFields.passwordField.value = userData.pass
      loginFields.submitButton.click()
    }
  }

  await (new JExamLogin()).start()
})()
