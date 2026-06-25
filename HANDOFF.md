# Handoff: Centralized Strings PR

Workspace: `C:\Users\jugri\Documents\Programieren\TUfast-centralized-strings`

Branch: `centralized-strings`
Branch URL: https://github.com/Just8it/TUfast_TUD-additions/tree/centralized-strings
PR URL: https://github.com/Just8it/TUfast_TUD-additions/pull/new/centralized-strings

Base: `upstream/main` from https://github.com/TUfast-TUD/TUfast_TUD.git
Fork/origin: https://github.com/Just8it/TUfast_TUD-additions.git

Goal: create a second PR that centralizes UI/user-facing strings.

Do:
- Keep this branch independent from `feature/opal-smart-search`.
- Only move repeated or user-facing strings into a centralized place.
- Keep the diff small and boring.
- Run the smallest relevant check before handing back.

Avoid:
- Do not include Opal smart search changes.
- Do not refactor unrelated code.
- Do not add an i18n framework unless the repo already has one and it is clearly the shortest path.
