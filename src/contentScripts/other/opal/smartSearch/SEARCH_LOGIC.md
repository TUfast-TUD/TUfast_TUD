# OPAL Smart Search Logic

TUfast OPAL Smart Search stores OPAL as a local graph instead of a flat text index. Courses, folders, nested folders, and files are all graph nodes. Each node keeps its `parentId`, `courseId`, path, tokens, numbers, aliases, and children.

## Data Model

Each stored entry is an `OpalSearchNode`. The persisted fields describe the OPAL target itself: `id`, `title`, `url`, `type`, `courseId`, `parentId`, `fileExtension`, visit metadata, and source metadata. The graph fields are derived from those values: `pathIds`, `pathTitles`, `titleTokens`, `pathTokens`, `titleNumbers`, `pathNumbers`, `primaryTitleNumber`, `aliases`, and `childrenIds`.

The important idea is that the stored index is not just a bag of text. It remembers where a node is in OPAL. That lets a query match across the course, one or more parent folders, and the final file or folder title.

## Indexing

Passive indexing writes the current OPAL page and its breadcrumbs as a parent chain. Visible folders and files are attached below the current page node. Active indexing uses the same shape: the course is the root, visited CourseNode pages become folders, and files found inside them become children.

The OPAL content script does not open the search IndexedDB directly. It sends sanitized graph nodes to the extension background script, and the background script owns IndexedDB writes, reads, search requests, stats, and clearing. This keeps the local index in the extension origin, so the settings page and the OPAL page operate on the same database.

Before a node is written, TUfast validates the URL against a central OPAL allowlist. Indexed targets must be `https://bildungsportal.sachsen.de/opal/...`. The background script validates again before persisting or returning search results, and the command palette validates once more before navigation. External, `data:`, `blob:`, protocol-relative, and malformed URLs are not stored or opened by Smart Search.

This means deep OPAL structures work naturally:

```text
course -> folder -> folder -> folder -> file
```

A query can match across those levels. For example, `tm1 woche 3 loesung` can use `tm1` from the course, `woche 3` from a folder, and `loesung` from the file or parent folder.

When OPAL exposes a downloadable file through a folder-like URL, Smart Search trusts the visible title first. A title ending in `.pdf`, `.zip`, `.docx`, and similar extensions is indexed as a file so the command palette can navigate to the parent folder and highlight it.

## Candidate Search

MiniSearch is used only to find candidate node IDs. It indexes normalized title tokens, path tokens, generated aliases, and file extensions. TUfast does not accept MiniSearch's order as final ranking.

FlexSearch remains only in the standalone lab for comparison. Orama is not used in the extension.

## Ranking

TUfast reranks candidates with graph-aware scoring:

- title token matches score highest,
- generated aliases score below title matches,
- path/course/parent-folder matches score lower,
- partial matches are allowed for longer tokens,
- exact number matches are strongly boosted,
- missing exact numbers are penalized,
- file extensions and file results get small boosts,
- the currently open course gets a moderate boost,
- recent visits and repeated visits are minor tie breakers.

Numbers are normalized for scoring, so `2` matches `02`, but not `20` or `21`. The scorer also distinguishes structural numbers from date numbers. In a title like `20. Uebungsblatt (18. bis 22. Mai 2026)`, the first number is treated as the primary title number. In `1. Uebungsblatt (20. bis 24. Oktober 2025)`, the `20` is only a secondary title number. This makes `mathe uebung 20` prefer the twentieth sheet over the first sheet whose date range happens to start on the twentieth.

Recency and visit count are intentionally small tie breakers. They help when two entries are otherwise similar, but they should not push an obviously wrong text match above the right exercise, file, or folder.

## Aliases

Hardcoded aliases are intentionally generic academic/document terms only, such as `vl`, `ue`, `uebung`, `skript`, `folien`, `slides`, `klausur`, `exam`, and `pruefung`.

Subject-specific aliases are generated from real indexed names. For example, `Technische Mechanik 1` can produce `tm1`. This avoids baking one degree program's vocabulary into TUfast.

## Privacy

All indexed data stays in the extension-owned browser IndexedDB. There is no backend, no server-side search, and no OPAL write operation.
