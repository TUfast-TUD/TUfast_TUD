// Although we can't use the ESM import statements in content scripts we can import types.
import type { CookieSettings, UserData, Login, LoginFields } from './common'

// "Quicksettings"
const platform = 'zih'
const cookieSettings: CookieSettings = {
    portalName: 'hisqis',
    domain: 'qis.dez.tu-dresden.de'
};

(async () => {
    const common = await import(chrome.runtime.getURL('contentScripts/login/common.js'))

    // For better syntax highlighting import the "Login" type from the common module and change it to "common.Login" when you're done.
    class HisqisLogin extends common.Login {
        constructor() {
            super(platform, cookieSettings);
        }

        async additionalFunctionsPreCheck(): Promise<void> { }

        async additionalFunctionsPostCheck(): Promise<void> {
            this.acceptConditions()
        }

        acceptConditions() {
            const link = Array.from(document.querySelectorAll('a')).find(element => element.innerText.includes('>>>'))
            if (link) {
                (link as HTMLAnchorElement).click();
            }
        }

        async loginFieldsAvailable(): Promise<boolean | LoginFields> {
            return {
                usernameField: document.getElementById('asdf') as HTMLInputElement,
                passwordField: document.getElementById('fdsa') as HTMLInputElement,
                submitButton: document.getElementsByName('submit')[0] as HTMLInputElement
            }
        }

        async findLogoutButtons(): Promise<HTMLElement[]> {
            return [document.querySelector('a[title="Abmelden"]'), document.querySelector('a[title="Logout"]')]
        }

        async login(userData: UserData, loginFields?: LoginFields): Promise<void> {
            if (!loginFields) return
            loginFields.usernameField.value = userData.user
            loginFields.passwordField.value = userData.pass
            loginFields.submitButton.click()
        }
    }

    await (new HisqisLogin()).start()
})()