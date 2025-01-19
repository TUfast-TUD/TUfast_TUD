export interface Login {
  id: string
  title: string
  name: string // Selma, Slub, ...
  state: boolean
  usernamePlaceholder: string
  usernamePattern: RegExp
  usernameError: string
  passwordPlaceholder: string
  passwordPattern: RegExp
  passwordError: string
}

export interface Login2FA extends Login {
  totpSecretPlaceholder: string
  totpSecretPattern: RegExp
  totpSecretError: string
}
