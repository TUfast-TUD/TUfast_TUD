# Contributing

- before implementing a feature communicate with us via [Matrix](https://matrix.to/#/#tu-fast:tu-dresden.de) or GitHub
- commit any feature containing pull requests against the develop-branch
- commit any hot-fixes against main-branch

## Getting started with browser extensions

If you never worked with browser extensions before, you should read this very [nice tutorial](https://developer.chrome.com/docs/extensions/get-started). Alternatively you can use the instructions from [mozilla](https://developer.mozilla.org/de/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension). Make sure you understand the difference between content- and background-scripts, their scopes and how they can exchange information with messaging.

## Working with this repo

Everything related to the browser extension can be found in `/src`: `manifest.json`, background-script (`background.js`) and so on. Content scripts are in `/src/contentScripts`. In `/src/freshContent` you can find newly created content that is used in TUfast, e.g. the popup or settings-page. `/docs` does _not_ contain documentation for the code, but further instructions for users of TUfast. 

Steps to contribute (that's standard [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)):

1. Create a local clone of this repo `git clone <url-of-your-repo>`.
2. Checkout develop branch `git checkout develop`.
3. Create new feature branch from develop `git checkout -b <my_new_feature_branch>`.
4. Install dependencies `npm ci`. (You need node package manager `npm` installed.)
5. Run `npm run useChrome` or `npm run useFF` to select the browser you are developing for - this will copy the corresponding manifest.json.
6. Run `npm run dev` while developing. This is will compile `.sass` and `.ts` files and watch for changes in your working tree.
7. Load the `./build` directory as an unpacked extension in your browser to test the extension.
8. Run tests locally before committing code: `npm run test`.
9. **Increase the version number of the package according to [SemVer](https://semver.org/).**
10. Create a pull request against `develop`.
11. Await our review.

**Note:** as a member of TUfast you can work in this repo directly, e.g. you can create branches and push to them, making the contribution process easier.

## Used frameworks
- Build tool: [Snowpack](https://www.snowpack.dev/). Run `npm run dev` to compile sass and ts files.
- CSS-Preprocessor: We are using [SASS](https://sass-lang.com/).
- ESlint: We are following standard styling with minor additions. Run `npm run lint` or `npm run test` to check your code style before committing code.

### Known peculiarities with browser extensions
**Error:** `Unchecked runtime.lastError: The message port closed before a response was received.` Promisifying chrome.runtime.sendMessage({...}) doesnt work, because when you define a callback (Promise.resolve) sendMessage will wait until sendResponse is called in the message handler. It just stalls execution and then dies if it's never called. **Solutions:** 1) Unpromisify sendMessage. 2) Always return a value (return true is fine).

## Have fun developing! 🔥
