export interface Login {
  id: string,
  title: string,
  name: string, // Selma, Slub, ...
  state: boolean,
  usernamePlaceholder: string,
  usernamePattern: RegExp,
  usernameError: string,
  passwordPlaceholder: string,
  passwordPattern: RegExp,
  passwordError: string,
}
