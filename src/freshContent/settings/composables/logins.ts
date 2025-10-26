import type { Login, Login2FA } from '../types/Login'

export const useLogins = () => ({
  logins
})

const logins: Login[] = [
  {
    id: 'zih',
    title: 'Werde automatisch bei allen Online-Portalen der TU Dresden angemeldet',
    name: 'TU Dresden',
    state: false,
    usernamePlaceholder: 'Nutzername (ZIH-Login)',
    usernamePattern: /^(s{1}\d{7}|[a-z]{4}\d{3}[a-z])$/,
    usernameError:
      "Der Nutzername hat die Form 's3276763' oder 'luka075d'. Speichere deine aktuelle Eingabe nur, wenn du dir sicher bist.",
    passwordPlaceholder: 'Passwort (ZIH-Login)',
    passwordPattern: /.{5,}/,
    passwordError: 'Das Passwort muss mindestens 5 Zeichen lang sein.',
    totpSecretPlaceholder: 'TOTP Secret-Key',
    totpSecretPattern: /^[A-Z2-7]{32}$/, // Base32 encoded
    totpSecretError:
      'Der TOTP Secret-Key besteht aus Großbuchstaben (A bis Z) und Ziffern (2 bis 7) und ist 32 Zeichen lang.'
  } as Login2FA,
  {
    id: 'slub',
    title: 'Werde automatisch bei der SLUB-Website angemeldet',
    name: 'Slub',
    state: false,
    usernamePlaceholder: 'Benutzernummer (SLUB-Login)',
    usernamePattern: /^[0-9]{7}$/,
    usernameError: 'Die Nutzernummer findest du u.a. auf deiner SLUB-Karte',
    passwordPlaceholder: 'Passwort (SLUB-Login)',
    passwordPattern: /.{5,}/,
    passwordError: 'Das Passwort muss mindestens 5 Zeichen lang sein.'
  }
]
