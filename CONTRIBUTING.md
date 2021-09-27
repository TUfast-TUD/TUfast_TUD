# Becoming a TUfast Developer
Trage zu TUfast bei und verbessere den Alltag der Studierenden und Mitarbeiter der TU Dresden! 🌟

Wir Organisieren das Projekt im [Project-Board](https://github.com/orgs/TUfast-TUD/projects/1). Dort findest du ToDos - erhalten durch eigene Ziele und Nutzerfeedback. Alternativ kannst du auch eigene Features Vorschlagen - wir freuen uns über kreative Ideen!

## Kommunikation
**Bitte sprich mit uns ab, bevor du neue Features implementierst**. Wir kommunizieren über einen [Matrix-Raum](https://matrix.to/#/#tu-fast:tu-dresden.de). Dort kannst du dich über dein TU-Login anmelden. Ansonsten auch gerne Issues nutzen.


## How to contribute code
We are using gitflow-workflow (simple [Tutorial](
https://www.atlassian.com/de/git/tutorials/comparing-workflows/gitflow-workflow)). In short: In you fork, create a feature-branch from the develop-branch. Implement your code there. If you are done, create a PR on the develop-branch of the upstream repository. Hotfixes should be committed to main-branch directly

Steps to contribute a feature:
1. Fork the repo
2. Create a local clone of your fork
3. Checkout develop branch `git checkout develop`
4. Create new feature branch `git checkout -b BRANCHNAME`
5. Install dependencies `npm install`
6. --> Implement your Code <-- and run `npm run dev`. This is required and will translate sass into css. See below for details.
7. **run tests locally** before contributing code: `npm run test`
8. Create a PR on develop branch

## Used Frameworks
- CSS-Preprocessor: We are using [SASS](https://sass-lang.com/). You need to run `npm run dev` while developing to translate to css.
- ESlint: We are following standard styling. Run `npm run lint` to check your code style before committing code.