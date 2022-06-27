# Becoming a TUfast Developer
Trage zu TUfast bei und verbessere den Alltag der Studierenden und Mitarbeiter der TU Dresden! 🌟

Wir Organisieren das Projekt im [Project-Board](https://github.com/orgs/TUfast-TUD/projects/1). Dort findest du ToDos - erhalten durch eigene Ziele und Nutzerfeedback. Alternativ kannst du auch eigene Features Vorschlagen - wir freuen uns über kreative Ideen!

## Kommunikation
**Bitte sprich mit uns ab, bevor du neue Features implementierst**. Wir kommunizieren über einen [Matrix-Raum](https://matrix.to/#/#tu-fast:tu-dresden.de). Dort kannst du dich über dein TU-Login anmelden. Ansonsten auch gerne Issues nutzen.


## How to contribute code (as a non-TUfast-member)
We are using gitflow-workflow (simple [Tutorial](
https://www.atlassian.com/de/git/tutorials/comparing-workflows/gitflow-workflow)). In short: Create a fork. In you fork, create a feature-branch from the develop-branch. Implement your code there. If you are done, create a PR on the develop-branch of this upstream repository. Hotfixes should be committed to main-branch directly.

You can use [GitHub CodeSpaces](https://github.com/features/codespaces) for easy contribution.

Steps to contribute a feature (as a non-TUfast-member):
1. Create a fork from this repo.
2. Create a local clone of your fork `git clone <url-of-your-repo>`
3. Checkout develop branch `git checkout develop`
4. Create new feature branch `git checkout -b my_new_feature_branch`
5. Install dependencies `npm ci` (you need node package manager npm installed)
6. --> Implement your Code <-- and run `npm run dev` to build all required files. This is required and can take a few minutes if you build first time! The completely build extension will be copied to `/build`.
7. Load the `build` folder in your browser (e.g. chrome://extensions or about:addons in developer mode).
8. **run tests locally** before contributing code: `npm run test`
9. Create a PR on develop branch

Note: as a member of the TUfast-Team you can work in this repo directly, e.g. you can create branches, making the contribution process easier.

## Guidelines, Frameworks, Hints
- CSS-Preprocessor: We are using [SASS](https://sass-lang.com/). You need to run `npm run dev` while developing to translate to css.
- ESlint: We are following standard styling with minor additions. Run `npm run lint` to check your code style before committing code.
- We decided against using prettier and didn't set a max-line-length in order to keep some large files compact

**One common issue** is, that the upstreams develop-branch gets updated while you implemented you feature. In this case,  you need to update your feature branch with the latest changes from develop-branch. See this [guide](https://akrabat.com/the-beginners-guide-to-rebasing-your-pr/)

**Upstream repo** is the parent/original repo. So in this case, it is the one located at https://github.com/TUfast-TUD/TUfast_TUD.

#### Have fun developing! 🔥
