// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, LoginFields, LoginNamespace } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'idp',
  domain: 'idp.tu-dresden.de'
}

;(async () => {
  const common: LoginNamespace = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class IdpLogin extends common.Login {
    constructor() {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck(): Promise<void> {}

    async additionalFunctionsPostCheck(): Promise<void> {
      this.confirmData()
      this.outdatedRequest()
      this.selectOTPType()
    }

    confirmData() {
      // Check if this is the consense page
      if (!document.getElementById('generalConsentDiv')) return

      // Click the button
      const button = document.querySelector('input[type="submit"][name="_eventId_proceed"]') as HTMLInputElement | null
      button?.click()
    }

    outdatedRequest() {
      // Check if this is the outdated request page
      // TODO: Decide whether we should really do this?
      // This hint isn't there for no reason can can be reached by "wrong" user choices.
      // We don't know where the user tried to login, so we can't jsut redirect to Opal/etc
    }

    selectOTPType() {
      if (!document.getElementById('fudis_selected_token_ids_input')) return

      const button = document.querySelector(
        'button[type="submit"][name="_eventId_proceed"]'
      ) as HTMLButtonElement | null
      button?.click()
    }

    async findCredentialsError(): Promise<boolean | HTMLElement | Element | null> {
      return document.querySelector('.output--error') ?? document.querySelector('.content p font[color="red"]')
    }

    async loginFieldsAvailable(): Promise<boolean | LoginFields> {
      const fields: LoginFields = {
        usernameField: document.getElementById('username') as HTMLInputElement,
        passwordField: document.getElementById('password') as HTMLInputElement,
        submitButton: document.querySelector('button[name="_eventId_proceed"][type="submit"]') as HTMLButtonElement
      }

      const otpInput = document.getElementById('fudis_otp_input') as HTMLInputElement | null
      if (otpInput) {
        const indexesText = otpInput.parentElement?.parentElement?.parentElement
          ?.querySelector('div:first-of-type')
          ?.textContent?.trim()
        //                            find number & number | remove whole match | to numbers | to zero based (first index is 0)
        const indexes = indexesText
          ?.match(/(\d+) & (\d+)/)
          ?.slice(1, 3)
          .map((x) => Number.parseInt(x, 10) - 1)

        fields.otpSettings = {
          input: otpInput,
          submitButton: document.querySelector(
            'button[name="_eventId_proceed"][type="submit"]'
          ) as HTMLButtonElement | null,
          type: indexesText?.toLocaleLowerCase().includes('totp') ? 'totp' : 'iotp',
          indexes: indexes && indexes.length > 0 ? indexes : undefined
        }
        console.log(fields)
      }

      return fields
    }

    async findLogoutButtons(): Promise<(HTMLElement | Element | null)[] | NodeList | null> {
      return null
    }
  }

  await new IdpLogin().start()
})()
