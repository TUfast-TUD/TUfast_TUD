import type { Login, Login2FA } from '../types/Login'
import { t } from '../../../i18n'

export const useLogins = () => ({
  logins
})

const logins: Login[] = [
  {
    id: 'zih',
    title: t('settings.logins.zih.title'),
    name: t('settings.logins.zih.name'),
    state: false,
    usernamePlaceholder: t('settings.logins.zih.usernamePlaceholder'),
    usernamePattern: /^(s{1}\d{7}|[a-z]{4}\d{3}[a-z])$/,
    usernameError: t('settings.logins.zih.usernameError'),
    passwordPlaceholder: t('settings.logins.zih.passwordPlaceholder'),
    passwordPattern: /.{5,}/,
    passwordError: t('settings.logins.zih.passwordError'),
    totpSecretPlaceholder: t('settings.logins.zih.totpSecretPlaceholder'),
    totpSecretPattern: /^[A-Z2-7]{32}$/, // Base32 encoded
    totpSecretError: t('settings.logins.zih.totpSecretError')
  } as Login2FA,
  {
    id: 'slub',
    title: t('settings.logins.slub.title'),
    name: t('settings.logins.slub.name'),
    state: false,
    usernamePlaceholder: t('settings.logins.slub.usernamePlaceholder'),
    usernamePattern: /^[0-9]{7}$/,
    usernameError: t('settings.logins.slub.usernameError'),
    passwordPlaceholder: t('settings.logins.slub.passwordPlaceholder'),
    passwordPattern: /.{5,}/,
    passwordError: t('settings.logins.slub.passwordError')
  }
]
