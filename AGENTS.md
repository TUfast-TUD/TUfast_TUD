# AGENTS.md

Guidance for AI agents. Read `CONTRIBUTING.md` for the full workflow and `README.md` for product scope. If either contradicts this file or the code, tell the user and suggest updating `AGENTS.md` first instead of silently working around it. Keep changes small. Scan the closest existing files before editing and match their imports, naming, comments, error handling, storage access, and whether logic lives locally or in a shared module — prefer local patterns over new abstractions. Write in-code comments very sparsely: one-liners only, reserved for important, non-obvious decisions or behaviors the code cannot express. Align impactful framework decisions (build system, i18n design, major new dependencies) with the maintainers before implementing.

Read `AGENTS_DOCS.md` alongside this file — it holds gotchas, design decisions, and improvement ideas, organized by topic. When you discover something durable, record it there under the right heading; edit or delete entries that are no longer true.

A line earns a place in `AGENTS.md` only if it applies to most tasks and either its violation fails silently — no test or error message would catch it — or it prevents a wasted setup/build cycle on nearly every task. Keep this file under ~70 lines.

## Fast Start

1. Node 22 (pinned in `.nvmrc`), npm 10. `package-lock.json` uses the older lockfileVersion-2 format — never let another npm major regenerate it.
2. `npm ci`, then `npm run useChrome` or `npm run useFF` to copy the browser-specific manifest to `src/manifest.json`.
3. `npm run dev` to build and watch; load `build/` as an unpacked extension to test. Never edit `build/`.
4. Before handoff on code changes: `npm run test` (see Testing) and `git diff --check`. Fix formatting with `npm run prettier:fix`. Known warnings: `vue/no-v-html` in onboarding pages.
5. Release-bound changes need a SemVer bump in `package.json`; the build copies the version into the manifests.

## Project Map

- `src/manifest.chrome.json` / `src/manifest.firefox.json` — keep in sync when changing permissions, content scripts, commands, or locales; use the narrowest useful `matches`.
- `src/background.ts` — MV3 service worker: install/update defaults, migrations, hotkeys, and `chrome.runtime.onMessage` commands (one `cmd` branch per command, simple request/response shapes).
- `src/contentScripts/` — `login` (auto-login), `other` (OPAL/HisQis/SELMA/OWA enhancements), `forward` (search-engine forwarders). `vite.config.mjs` keeps most of these as classic manifest-loaded scripts — be careful adding imports to them.
- `src/freshContent/` — `popup` (classic JS) and `settings` (Vue 3 app, onboarding, composables).
- `src/modules/` — shared modules for background and login/content scripts.
- `src/i18n/` — custom localization runtime and locale JSONs.
- `docs/` — user-facing documentation, not code docs. `scripts/` — build/verify helpers.

## Localization

- Use the custom `src/i18n` runtime; do not add `vue-i18n`. User-facing copy belongs in `src/i18n/locales/*.json` (never inline); `de.json` is the structure reference.
- Locale setting lives in `chrome.storage.local.locale`, default `auto` (browser language, else English). `await initLocale()` before rendering translated UI.
- Never call `t()` at module top level — export a factory (see `getSettings()`, `getOnboardingSteps()`) so translation happens after locale init.
- Content scripts don't use `t()`: their strings live under the locale JSON `content` block and arrive via `globalThis.TUFAST_STRINGS`. The wiring (manifest ordering, awaiting `TUFAST_STRINGS_READY`) is test-enforced — follow the error messages.

## Extension API Gotchas

- Return `true` from a `chrome.runtime.onMessage` branch that responds async. Do not promisify `sendMessage` with a callback unless the receiver definitely responds — fire-and-forget must not wait.
- `chrome.storage.local` is the single source of truth for settings; never mirror into `localStorage`.
- A new setting needs all of: install default, migration default, UI wiring, and status-tile behavior in the settings dashboard.
- Both manifests are MV3, but Firefox runs the background as an event page (`background.scripts`) while Chrome uses a service worker (`service_worker`) — avoid semantics only one of them has. CI builds only the Chrome variant; verify Firefox manually when touching background or manifest behavior.

## Testing

- `npm run test` is the whole suite: typecheck, ESLint, Prettier, Vite build, and the `scripts/verify-*.mjs` checks. There is no unit-test framework; do not introduce one, or any test dependency, without maintainer alignment.
- Add a check when a change creates an invariant that future PRs could silently break and that is verifiable from source or build output alone (existing examples: locale-structure parity, manifest/content-script coupling, version bump). Pattern: a dependency-free Node script in `scripts/` that throws a specific, actionable error, wired into `npm run test` so CI runs it.
- Non-trivial pure logic with no `chrome.*` or DOM dependency (parsing, encoding — e.g. the TOTP code in `src/modules/otp.ts`) is also worth a check.
- Do not write tests for content scripts that read or manipulate university pages (HTML fixtures rot when the sites change — verify manually against the live site), Vue components and UI wiring, or thin `chrome.*` wrappers. For these, verification is a manual browser pass (`npm run dev`, load `build/` unpacked); state in the PR what you exercised.
- Inline user-facing strings fail ESLint only in Vue templates (`@intlify/vue-i18n/no-raw-text`); everywhere else the never-inline rule is convention — check it yourself.

## Review Bias

Keep PRs narrow. Prefer deletion and existing patterns over new helpers or dependencies. Project style beats general best practice when they conflict — follow project style, but if the conflict is consequential (correctness, security, recurring friction), say so in the PR and record it under improvement ideas in `AGENTS_DOCS.md`. Any text an agent drafts that addresses humans directly — PR descriptions, issues, discussion posts, comments — must be explicitly flagged as AI-generated by starting it with `🤖 AI-generated`; see `CONTRIBUTING.md` → "Coding agents".
