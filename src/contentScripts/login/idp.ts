// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, Login, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'idp',
  domain: 'idp.tu-dresden.de'
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class IdpLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> { 
      this.confirmData()
      this.outdatedRequest()
    }

    confirmData() {
      // Check if this is the consense page
      if(!document.getElementById('generalConsentDiv')) return

      // Click the button
      const button = document.querySelector('input[type="submit"][name="_eventId_proceed"]')
      if (button) (button as HTMLInputElement).click()
    }

    outdatedRequest() {
      // Check if this is the outdated request page
      // TODO: Decide whether we should really do this?
      // This hint isn't there for no reason can can be reached by "wrong" user choices.
      // We don't know where the user tried to login, so we can't jsut redirect to Opal/etc
    }

    async findCredentialsError(): Promise<boolean | HTMLElement | Element> {
        return document.querySelector('.content p font[color="red"]')
    }

    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return {
        usernameField: document.getElementById('username') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        submitButton: document.querySelector('button[name="_eventId_proceed"][value="Login"]') as HTMLButtonElement
      }
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      return null
    }

    async login (userData: UserData, loginFields?: LoginFields): Promise<void> {
      if (!loginFields) return
      loginFields.usernameField.value = userData.user
      loginFields.passwordField.value = userData.pass
      loginFields.submitButton.click()
    }
  }

  await (new IdpLogin()).start()
})()
