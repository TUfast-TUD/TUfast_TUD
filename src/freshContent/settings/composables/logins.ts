import type { Login, Login2FA } from '../types/Login'
import { strings } from '../../../i18n'

export const useLogins = () => ({
  logins
})

const logins: Login[] = [
  {
    id: 'zih',
    title: strings.settings.logins.zih.title,
    name: strings.settings.logins.zih.name,
    state: false,
    usernamePlaceholder: strings.settings.logins.zih.usernamePlaceholder,
    usernamePattern: /^(s{1}\d{7}|[a-z]{4}\d{3}[a-z])$/,
    usernameError: strings.settings.logins.zih.usernameError,
    passwordPlaceholder: strings.settings.logins.zih.passwordPlaceholder,
    passwordPattern: /.{5,}/,
    passwordError: strings.settings.logins.zih.passwordError,
    totpSecretPlaceholder: strings.settings.logins.zih.totpSecretPlaceholder,
    totpSecretPattern: /^[A-Z2-7]{32}$/, // Base32 encoded
    totpSecretError: strings.settings.logins.zih.totpSecretError
  } as Login2FA,
  {
    id: 'slub',
    title: strings.settings.logins.slub.title,
    name: strings.settings.logins.slub.name,
    state: false,
    usernamePlaceholder: strings.settings.logins.slub.usernamePlaceholder,
    usernamePattern: /^[0-9]{7}$/,
    usernameError: strings.settings.logins.slub.usernameError,
    passwordPlaceholder: strings.settings.logins.slub.passwordPlaceholder,
    passwordPattern: /.{5,}/,
    passwordError: strings.settings.logins.slub.passwordError
  }
]
