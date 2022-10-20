# Contributing

Wir sammeln Aufgaben im [Project-Board](https://github.com/orgs/TUfast-TUD/projects/1). Alternativ kannst du auch eigene Features Vorschlagen - wir freuen uns über kreative Ideen! **Achtung**: Das Project-board ist nicht immer aktuell.

**Bitte sprich mit uns ab, bevor du neue Features implementierst**. Wir kommunizieren über einen [Matrix-Space](https://matrix.to/#/#tu-fast:tu-dresden.de). Dort kannst du dich über dein TU-Login anmelden.

## Getting started

#### Developing browser extensions

If you never worked with browser extensions before, you should read this very [nice tutorial](https://developer.chrome.com/docs/extensions/mv2/getstarted/). Currently we are still using manifest v2, but we plan to switch to v3 in proximate future. Alternatively you can use the instructions from [mozilla](https://developer.mozilla.org/de/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension). Make sure you understand the difference between content- and background-scripts, their scopes and how they can exchange information with messaging.

#### Working with this repo

Everything related to the browser extension can be found in `/src`: `manifest.json`, background-script (`background.js`) and so on. Content scripts are in `/src/contentScripts`. In `/src/freshContent` you can find newly created webcontent that is used in TUfast, e.g. the popup or settings-page.

#### Used frameworks

- Build tool: [Snowpack](https://www.snowpack.dev/) - You need to run `npm run dev` while developing to compile sass and ts files.
- CSS-Preprocessor: We are using [SASS](https://sass-lang.com/).
- ESlint: We are following standard styling with minor additions. Run `npm run lint` to check your code style before committing code.

#### Known peculiarities with browser extensions

**Error:** `Unchecked runtime.lastError: The message port closed before a response was received.` Promisifying chrome.runtime.sendMessage({...}) doesnt work, because when you define a callback (Promise.resolve) sendMessage will wait until sendResponse is called in the message handler. It just stalls execution and then dies if it's never called. **Solutions:** 1) Unpromisify sendMessage. 2) Always return a value (return true is fine).

## How to contribute code (as a non-TUfastTeam-member)

We are using the standard gitflow-workflow (simple [Tutorial](https://www.atlassian.com/de/git/tutorials/comparing-workflows/gitflow-workflow)).

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

**Note:** as a member of the TUfast-Team you can work in this repo directly, e.g. you can create branches and push to them, making the contribution process easier.

#### Have fun developing! 🔥
