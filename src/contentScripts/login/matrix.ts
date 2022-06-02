// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'matrix',
  domain: 'matrix.tu-dresden.de'
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class MatrixLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {
      this.clickLogin()
    }

    clickLogin () {
      (document.querySelector('a[href="#/login"]') as HTMLAnchorElement|null)?.click()
    }

    async findCredentialsError (): Promise<boolean | HTMLElement | Element> {
      return document.getElementsByClassName('mx_Login_error')[0]
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      const hash = window.location.hash
      if (hash !== '#/login') return false

      return {
        usernameField: document.getElementById('mx_LoginForm_username') as HTMLInputElement,
        passwordField: document.getElementById('mx_LoginForm_password') as HTMLInputElement,
        submitButton: document.querySelector('input.mx_Login_submit[type="submit"]') as HTMLInputElement
      }
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      return [document.getElementsByClassName('mx_UserMenu_iconSignOut')[0]?.parentElement]
    }

    async login (userData: UserData, loginFields?: LoginFields): Promise<void> {
      if (!loginFields || !loginFields.submitButton) return

      // Fake the input on fields
      this.fakeInput(loginFields.usernameField, userData.user)
      this.fakeInput(loginFields.passwordField, userData.pass)
      loginFields.submitButton.click()
    }
  }

  const login = new MatrixLogin()

  // As the logout button is injected dynmically we need to wait for it to be available
  const oberserver = new MutationObserver(async (_records, _observer) => {
    await login.start()
  })

  oberserver.observe(document.body, { subtree: true, childList: true })
})()
