# Contributing

## TL;DR
- Before implementing a feature communicate with us via GitHub-Issues or Pull Requests. Code maintainers often have good suggestions regarding the implementation.
- Commit any changes (new features or hot-fixes) directly against the main branch.

## Getting started with browser extensions

If you never worked with browser extensions before, you should read this very [nice tutorial](https://developer.chrome.com/docs/extensions/get-started). Alternatively you can use the instructions from [mozilla](https://developer.mozilla.org/de/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension). Make sure you understand the difference between content- and background-scripts, their scopes, and how they exchange information using messages.

## Working with this repo

Everything related to the browser extension can be found in `/src`: the `manifest.json`, the `background.js`, and so on. Content scripts are in `/src/contentScripts`. In `/src/freshContent` you can find newly created content that is used in TUfast, e.g. the popup or settings-page. `/docs` does _not_ contain documentation for the code, but further instructions for users of TUfast. 

Steps to contribute:

1. Create your local clone of this repo `git clone <url-of-your-repo>`.
3. Create a new feature branch directly from the main branch `git checkout -b <my_new_feature_branch>`.
4. Install dependencies `npm ci`. (You need node package manager `npm` installed.)
5. Run `npm run useChrome` or `npm run useFF` to select the browser you are developing for - this will copy the corresponding manifest.json.
6. Run `npm run dev` while developing. This is will compile `.sass` and `.ts` files and watch for changes in your working tree.
7. Load the `./build` directory as an unpacked extension in your browser to test the extension.
8. Run `npm run test` locally before pushing code. This will also check if your code is formatted correctly. You can use [this extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to automatically format your code or `npm run prettier:fix`. (See also below.) Wrong formatting will result in failing CI on GitHub!
9. **Increase the version number in the `manifest*.json` files according to [SemVer](https://semver.org/). An increase in version number is strictly required beforere releasing a new version!**
10. Create a pull request against `main`.
11. Await our review.

**Note:** as a member of the TUfast organization you can also work in this repo directly, e.g. you can create branches and push to them, making the contribution process easier.

## Used frameworks
- **Build tool**: [Snowpack](https://www.snowpack.dev/). Run `npm run dev` to compile sass and ts files.
- **CSS-Preprocessor**: We are using [SASS](https://sass-lang.com/).
- **Code style and linting**: We are using ESlint and prettier. Run `npm run test` to check your code style and linting before pushing code. Wrong formatting will result in a failing CI. You should configure your editor to automatically format on save with prettier for which VSCode provides [this extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

### Known peculiarities with browser extensions
**Error:** `Unchecked runtime.lastError: The message port closed before a response was received.` Promisifying chrome.runtime.sendMessage({...}) doesnt work, because when you define a callback (Promise.resolve) sendMessage will wait until sendResponse is called in the message handler. It just stalls execution and then dies if it's never called. **Solutions:** 1) Unpromisify sendMessage. 2) Always return a value (return true is fine).

## Have fun developing! 🔥
