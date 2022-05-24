import type { CookieSettings, UserData, Login, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
  portalName: 'videocampus',
  domain: 'videocampus.sachsen.de',
  usesIdp: true
};

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

  // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
  class VideocampusLogin extends common.Login {
    constructor () {
      super(platform, cookieSettings)
    }

    async additionalFunctionsPreCheck (): Promise<void> { }

    async additionalFunctionsPostCheck (): Promise<void> {
      this.selectIdpAndClick()
    }

    selectIdpAndClick () {
      const [select] = document.getElementsByName('idp')
      if (!select) return

      // Get all options and find TU Dresden
      const optionsArr = Array.from((select as HTMLSelectElement).options)
      const idpValue = optionsArr.find((option) => option.innerText === 'TU Dresden' || option.innerText === 'Technische Universität Dresden').value;
      (select as HTMLSelectElement).value = idpValue;

      // We need to trigger the onchange event manually
      (select as HTMLSelectElement).dispatchEvent(new Event('change'))

      // Click the submit button
      document.getElementById('samlLogin')?.click()
    }

    // Login fields are never available
    async loginFieldsAvailable (): Promise<boolean | LoginFields> {
      return false
    }

    async findLogoutButtons (): Promise<HTMLElement[]> {
      return [document.querySelector('a.dropdown-item[href="/logout"]')]
    }

    // We never login but forward to the idp
    async login (_userData: UserData, _loginFields?: LoginFields): Promise<void> { }
  }

  await (new VideocampusLogin()).start()
})()
