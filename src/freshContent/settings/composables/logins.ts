import type { Login } from '../types/Login'

export const useLogins = () => ({
  logins
})

const logins: Login[] = [
  {
    id: 'zih',
    title: 'Werde in alle Online-Portale der TU Dresden automatisch angemeldet.',
    name: 'Selma',
    state: false,
    usernamePlaceholder: 'Nutzername (selma-Login)',
    usernamePattern: /^(([s]{1}\d{7})|([a-z]{2,6}\d{3}[a-z]{1}))$/,
    usernameError: "Ohne @mailbox.tu-dresden.de, also z.B. 's3276763' oder 'luka075d'",
    passwordPlaceholder: 'Passwort (selma-Login)',
    passwordPattern: /.{5,}/,
    passwordError: 'Das Passwort muss mindestens 5 Zeichen lang sein!'
  },
  {
    id: 'slub',
    title: 'Werde automatisch auf der SLUB-Seite angemeldet.',
    name: 'Slub',
    state: false,
    usernamePlaceholder: 'Benutzernummer (SLUB-Login)',
    usernamePattern: /^[0-9]{7}$/,
    usernameError: 'die Nutzernummer findest du u.a. auf deiner SLUB-Karte',
    passwordPlaceholder: 'Passwort (SLUB-Login)',
    passwordPattern: /.{5,}/,
    passwordError: 'Das Passwort muss mindestens 5 Zeichen lang sein!'
  }
]
