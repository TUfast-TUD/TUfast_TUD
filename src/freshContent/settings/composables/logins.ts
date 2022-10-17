import type { Login } from "../types/Login";

export const useLogins = () => ({
  logins,
});

const logins: Login[] = [
  {
    id: "zih",
    title:
      "Werde in alle Online-Portale der TU Dresden automatisch angemeldet.",
    name: "Selma",
    state: false,
    usernamePlaceholder: "Nutzername (selma-Login)",
    usernamePattern: /^(s{1}\d{7}|[a-z]{4}\d{3}[a-z])$/,
    usernameError:
      "Der Nutzername hat die Form 's3276763' oder 'luka075d'. Speichere deine aktuelle Eingabe nur, wenn du dir sicher bist.",
    passwordPlaceholder: "Passwort (selma-Login)",
    passwordPattern: /.{5,}/,
    passwordError: "Das Passwort muss mindestens 5 Zeichen lang sein!",
  },
  {
    id: "slub",
    title: "Werde automatisch auf der SLUB-Seite angemeldet.",
    name: "Slub",
    state: false,
    usernamePlaceholder: "Benutzernummer (SLUB-Login)",
    usernamePattern: /^[0-9]{7}$/,
    usernameError: "die Nutzernummer findest du u.a. auf deiner SLUB-Karte",
    passwordPlaceholder: "Passwort (SLUB-Login)",
    passwordPattern: /.{5,}/,
    passwordError: "Das Passwort muss mindestens 5 Zeichen lang sein!",
  },
];
