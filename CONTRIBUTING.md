# Becoming a TUfast Developer

Wir Organisieren das Projekt im [Project-Board](https://github.com/orgs/TUfast-TUD/projects/1). Dort findest du ToDos - erhalten durch eigene Ziele und Nutzerfeedback. Alternativ kannst du auch eigene Features Vorschlagen - wir freuen uns über kreative Ideen! **Achtung**: Das Project-board ist nicht immer aktuell.

**Bitte sprich mit uns ab, bevor du neue Features implementierst**. Wir kommunizieren über einen [Matrix-Space](https://matrix.to/#/#tu-fast:tu-dresden.de). Dort kannst du dich über dein TU-Login anmelden. Ansonsten auch gerne Issues nutzen.

## Getting started

#### Developing browser extensions

If you never worked with browser extensions before, you should read this very [nice tutorial](https://developer.chrome.com/docs/extensions/mv2/getstarted/) by google (note that we are using manifest-version v2!). Alternatively you can use the instructions from [mozilla](https://developer.mozilla.org/de/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension). You should read most chapters in this tutorial. Espacially make sure you understand the difference between content- and background-scripts, their scopes and how they can exchange information with messaging. If you go through this tutorial, you should understand how TUfast works.

#### Working with this repo

Everything related to the browser extension can be found in `/src`. There you will find the `manifest.json` and background-script (`background.js`) directly. Content scripts are in `/src/contentScripts`. In `/src/freshContent` you can find newly created webcontent that is used in TUfast, e.g. the popup or settings-page.

#### Used frameworks

- Build tool: [Snowpack](https://www.snowpack.dev/) - You need to run `npm run dev` while developing to compile sass and ts files.
- CSS-Preprocessor: We are using [SASS](https://sass-lang.com/).
- ESlint: We are following standard styling with minor additions. Run `npm run lint` to check your code style before committing code.

#### Known peculiarities with browser extensions

**Error:** `Unchecked runtime.lastError: The message port closed before a response was received.` Promisifying chrome.runtime.sendMessage({...}) doesnt work, because when you define a callback (Promise.resolve) sendMessage will wait until sendResponse is called in the message handler. It just stalls execution and then dies if it's never called. **Solutions:** 1) Unpromisify sendMessage. 2) Always return a value (return true is fine).

## How to contribute code (as a non-TUfastTeam-member)

We are using gitflow-workflow (simple [Tutorial](https://www.atlassian.com/de/git/tutorials/comparing-workflows/gitflow-workflow)). In short: Create a fork. In your fork, create a feature-branch from the develop-branch. Implement your code there. If you are done, create a PR on the develop-branch of this upstream repository. Hotfixes should be committed to main-branch directly.

You can use [GitHub CodeSpaces](https://github.com/features/codespaces) for easy contribution.

Steps to contribute a feature (as a non-TUfast-teammember):

1. Create a fork from this repo.
2. Create a local clone of your fork `git clone <url-of-your-repo>`
3. Checkout develop branch `git checkout develop`
4. Create new feature branch `git checkout -b <my_new_feature_branch>`
5. Install dependencies `npm ci` (you need node package manager = npm installed)
6. Run `npm run dev` while developing. This is will compile sass and ts files and watch for changes in your working tree.
7. Load the ./build directory as an unpacked extension in your browser and --> Implement your Code <--
8. **run tests locally** before contributing code: `npm run test`
9. Create a PR on develop branch

**One common issue** is, that the upstreams develop-branch gets updated while you implemented you feature. In this case, you need to update your feature branch with the latest changes from develop-branch. See this [guide](https://akrabat.com/the-beginners-guide-to-rebasing-your-pr/). (Upstream repo is the parent/original repo. So in this case, it is the one located at https://github.com/TUfast-TUD/TUfast_TUD.)

**Note:** as a member of the TUfast-Team you can work in this repo directly, e.g. you can create branches and push to them, making the contribution process easier.

#### Have fun developing! 🔥
