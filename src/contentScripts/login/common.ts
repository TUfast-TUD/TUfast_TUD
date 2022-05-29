// This is the brain for all login activities.
// It is designed to remove redundand behavior in the login scripts
// while maintaining individuality.

// Typescript interfaces and types
export interface UserData {
  user: string;
  pass: string;
}

export type LoginCheckResponse = UserData | false;

export interface CookieSettings {
  portalName: string;
  domain?: string;
  logoutDuration?: number;
  usesIdp?: boolean;
}

export interface LoginFields {
  usernameField: HTMLInputElement;
  passwordField: HTMLInputElement;
  submitButton?: HTMLElement;
}

// This is the default lifetime for the logout cookie in minutes.
const defaultLogoutDuration = 5

// Abstract Loginclass
// This should be extended by the login scripts.
export abstract class Login {
  platform: string;
  cookieSettings: CookieSettings;
  savedClickCount: number;

  // Constructor
  // Nothing fancy here
  constructor(platform: string, cookieSettings: CookieSettings, savedClickCount: number = 1) {
    this.platform = platform || 'zih'
    this.cookieSettings = cookieSettings
    this.savedClickCount = savedClickCount
  }

  // Abstract methods
  // All these need to be implemented by the login scripts.
  // This function is called on every page load no matter if userdata is available etc
  abstract additionalFunctionsPreCheck(): Promise<void>
  // This function is called after cheking if we even have valid data and should act.
  abstract additionalFunctionsPostCheck(userData: UserData): Promise<void>
  // This function should be used if login fields are loaded. It can return a simple boolean (no login will happen on "false") or an LoginFields object.
  // If user- or pass- input are null no login try will happen.
  abstract loginFieldsAvailable(): Promise<boolean | LoginFields>
  // This function should return all candidates for logout buttons.
  // An onClick listener will be added to set a "loggedOut" cookie
  abstract findLogoutButtons(): Promise<HTMLElement[] | NodeList | null>

  // The following methods should be implemented where necessery or possible.
  // The actual login function. It has access to credentials and - if the function above returns them - the input fields.
  async login(userData: UserData, loginFields?: LoginFields): Promise<void> {
    if (!loginFields || !loginFields.usernameField || !loginFields.passwordField) return

    this.fakeInput(loginFields.usernameField, userData.user)
    this.fakeInput(loginFields.passwordField, userData.pass)
    loginFields.submitButton?.click()
  }
  // This function should be used to find if an error dialog is shown for invalid credentaials.
  // When the return value is not null it means that the error dialog is shown.
  // There is a default implementation here but it should be used where possible.
  async findCredentialsError(): Promise<boolean | HTMLElement | Element | null> { return false }

  // The main function the only only one that should be actually called from outside.
  async start() {
    // .catch(() => { }) because we don't care about user implemented errors.
    await this.additionalFunctionsPreCheck().catch(() => { })

    const userData = await this.loginCheckAndData()
    if (!userData) return

    await this.additionalFunctionsPostCheck(userData).catch(() => { })

    await this.tryLogin(userData)

    const buttons = await this.findLogoutButtons()
    this.registerLogoutButtonsListener(buttons)
  }

  registerLogoutButtonsListener(buttons: (HTMLElement | Element)[] | NodeList) {
    if (buttons) {
      for (const button of buttons) {
        if (button) button.addEventListener('click', this.setLoggedOutCookie.bind(this))
      }
    }
  }

  async loginCheckAndData(): Promise<LoginCheckResponse> {
    // The fastest and first check is for loggedOutCookie
    if (this.isLoggedOutCookie()) return false

    // Check if auto login is enabled
    // Promisified until usage of Manifest V3
    const { isEnabled } = await new Promise<any>((resolve) => chrome.storage.local.get('isEnabled', resolve))
    if (!isEnabled) return false

    // Promissified fetch of userdata
    // Chances are this also has to be used in Manifest V3
    const userData: UserData = await new Promise<UserData>((resolve) => chrome.runtime.sendMessage({ cmd: 'get_user_data', platform: this.platform }, resolve))

    if (!userData || !userData.user || !userData.pass) return false
    else return userData
  }

  // The if the platformLoggedOut cookie is set
  isLoggedOutCookie(): boolean {
    return document.cookie.includes(`${this.cookieSettings.portalName}LoggedOut`)
  }

  // Function to set the platformLoggedOut cookie
  setLoggedOutCookie(): void {
    if (!this.cookieSettings.domain) return

    // The next line could be confusing
    // Either we use the duration set in the cookieSettings object or we read it from local storage (if there is a default) or we set it to 5 minutes.
    const logoutDuration: number = this.cookieSettings.logoutDuration || defaultLogoutDuration || 5

    const date = new Date()
    date.setMinutes(date.getMinutes() + logoutDuration)
    const domain = this.cookieSettings.domain.startsWith('.') ? this.cookieSettings.domain : `.${this.cookieSettings.domain}`
    document.cookie = `${this.cookieSettings.portalName}LoggedOut=true; expires=${date.toUTCString()}; path=/; domain=${domain}; secure`

    // If we use IDP we need to logout we can ask the backgroundscript to log us out of there too
    if (this.cookieSettings.usesIdp) chrome.runtime.sendMessage({ cmd: 'logout_idp', logoutDuration })
  }

  // This function is for additional triggers that should happen on login.
  // For example we need to add a click to the savedClickCounter.
  // In future this can be used to add more functions.
  async onLogin(): Promise<void> {
    // I don't know if await even works but there is no reason to await any response anyway
    await chrome.runtime.sendMessage({ cmd: 'save_clicks', clickCount: this.savedClickCount })
  }

  // This method finds the login fields, checks for the error dialog and tries to login.
  async tryLogin(userData: UserData) {
    const errorDialog = await this.findCredentialsError()
    if (!!errorDialog) return

    let loginFields: LoginFields | undefined

    const avail = await this.loginFieldsAvailable().catch(() => { })
    if (typeof avail === 'boolean' && !avail) return
    if (typeof avail === 'object') {
      if (!avail.usernameField || !avail.passwordField) return
      else loginFields = avail
    }

    await this.onLogin()
    await this.login(userData, loginFields)
  }

  fakeInput(input: HTMLInputElement, value: string) {
    // Inspired by how the Bitwarden extension does it
    // https://github.com/bitwarden/clients/blob/master/apps/browser/src/content/autofill.js#L346
    input.getBoundingClientRect()

    // Click it
    input.click()

    // Focus it
    input.focus()

    // Sending empty keypresses
    // Making it a local function so we can use it again later
    const sendEmptyPresses = () => {
      input.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: false,
        charCode: 0,
        keyCode: 0,
        which: 0
      }))
      input.dispatchEvent(new KeyboardEvent('keypress', {
        bubbles: true,
        cancelable: false,
        charCode: 0,
        keyCode: 0,
        which: 0
      }))
      input.dispatchEvent(new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: false,
        charCode: 0,
        keyCode: 0,
        which: 0
      }))
    }
    sendEmptyPresses()

    // Set value
    input.value = value

    // Click again
    input.click()

    // Send empty keypresses again
    sendEmptyPresses()

    // Other events
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

    // Blur it
    input.blur()

    // Set value again
    input.value = value
  }
}
