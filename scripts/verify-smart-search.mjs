import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildDir = path.join(rootDir, 'build')
const indexerSource = readFileSync(path.join(rootDir, 'src/contentScripts/other/opal/smartSearch/indexer.ts'), 'utf8')
const backgroundSource = readFileSync(path.join(rootDir, 'src/background.ts'), 'utf8')
const mainSource = readFileSync(path.join(rootDir, 'src/contentScripts/other/opal/smartSearch/main.ts'), 'utf8')
const parseCoursesSource = readFileSync(path.join(rootDir, 'src/contentScripts/other/opal/parseCourses.ts'), 'utf8')
const settingsSource = readFileSync(path.join(rootDir, 'src/modules/opalSmartSearch/settings.ts'), 'utf8')

// Guard the storage-key literal mirrored by the classic parseCourses.ts content script.
const favoritesDetectedKey = settingsSource.match(/favoritesDetectedAt:\s*'([^']+)'/)?.[1]
assert.ok(favoritesDetectedKey, 'settings.ts must define SmartSearchKey.favoritesDetectedAt as a string literal.')
assert.ok(
  parseCoursesSource.includes(`favoritesDetectedKey = '${favoritesDetectedKey}'`),
  'parseCourses.ts must mirror SmartSearchKey.favoritesDetectedAt exactly (classic scripts cannot import it).'
)

assert.doesNotMatch(
  indexerSource,
  /navigator\.locks\.request/,
  'Firefox content scripts must not use async Web Lock callbacks; the browser rejects their promises.'
)
assert.match(
  backgroundSource,
  /previous\.startedAt !== update\.startedAt/,
  'Background progress writes must reject stale SmartSearch jobs.'
)
assert.match(
  backgroundSource,
  /queueOpalSmartSearchControl\(\(\) => prepareOpalSmartSearchPreload\(preferredTab\)\)/,
  'SmartSearch startup must serialize its initial state transition.'
)
assert.match(
  backgroundSource,
  /queueOpalSmartSearchControl\(\(\) => activateOpalSmartSearchPreload\(start\)\)/,
  'SmartSearch startup must serialize the transition from starting to running.'
)
assert.doesNotMatch(
  backgroundSource,
  /queueOpalSmartSearchControl\(\(\) => startOpalSmartSearchPreload/,
  'Favorites polling and launch retries must stay outside the control queue so Stop, Clear, and Disable remain responsive.'
)
assert.match(
  backgroundSource,
  /status: 'starting'/,
  'SmartSearch must publish a globally visible, cancellable startup state before navigating to favorites.'
)
assert.match(
  backgroundSource,
  /progress\.status !== 'starting' && progress\.status !== 'running'/,
  'Cancellation must stop both startup and active indexing.'
)
assert.match(
  indexerSource,
  /return claimActiveIndexJob\(jobStartedAt\)/,
  'Active indexing must claim the exact background-owned job before continuing.'
)
assert.match(
  indexerSource,
  /commitActiveIndexedCourse\(course\.url, startedAt, result\.complete\)/,
  'Only complete rendered crawls may be committed as successful.'
)
assert.doesNotMatch(
  indexerSource,
  /result\.complete \|\| result\.indexedItems/,
  'A useful partial crawl must remain failed so it cannot prune stale nodes or end Done.'
)
assert.match(
  indexerSource,
  /iframe\.setAttribute\('sandbox', 'allow-scripts allow-same-origin allow-forms'\)/,
  'Rendered indexing must sandbox OPAL so its scripts cannot navigate the user-facing page.'
)
assert.doesNotMatch(
  indexerSource,
  /allow-top-navigation/,
  'The rendered indexing sandbox must never receive top-navigation permission.'
)
assert.match(
  backgroundSource,
  /findOpalSmartSearchTab\(preferredTab\)/,
  'Active indexing must prefer the existing OPAL tab selected by the user.'
)
assert.match(
  backgroundSource,
  /await refreshStoredOpalFavorites\(start\)/,
  'Manual indexing must settle OPAL favorites before activating the crawl job.'
)
assert.match(
  backgroundSource,
  /typeof stored\.favoriten === 'string'/,
  'Manual indexing must reuse an already-stored favorites list.'
)
assert.match(
  parseCoursesSource,
  /empty-state[\s\S]*renderedEmptyFavorites[\s\S]*courses\.length === 0 && !renderedEmptyFavorites/,
  'The favorites parser must acknowledge only parsed courses, an explicit empty state, or a settled empty render.'
)
assert.match(
  parseCoursesSource,
  /setTimeout\(\(\) => runMainFunction\(true\), 800\)/,
  'Favorites parsing must wait for OPAL mutations to settle before acknowledging startup.'
)
assert.match(
  parseCoursesSource,
  /setTimeout\(\(\) => runMainFunction\(false\), 5000\)/,
  'A continuously mutating OPAL page must still parse via the max-wait fallback.'
)
assert.match(
  mainSource,
  /maybeRunActiveIndexing\(\)\.catch/,
  'An interrupted indexing job must resume after OPAL reloads the active page.'
)
assert.match(
  indexerSource,
  /if \(activeIndexPromise\) return activeIndexPromise/,
  'Repeated worker start messages must share the active attempt.'
)
assert.match(
  indexerSource,
  /runActiveIndexing\(\)[\s\S]*\.catch\(\(error\) => handleActiveIndexFailure\(error, activeJobStartedAt\)\)[\s\S]*\.finally/,
  'Active crawl failures must be published before the current job id is cleared.'
)
assert.match(
  indexerSource,
  /ACTIVE_COURSE_TIME_BUDGET_MS = 5 \* 60 \* 1000/,
  'Large OPAL courses need the five-minute per-course safety budget established by live testing.'
)
assert.match(
  indexerSource,
  /let truncated = !coursePager\.expanded/,
  'An unconfirmed Show All expansion must keep the course incomplete and prevent pruning.'
)
assert.match(
  indexerSource,
  /if \(!sectionPager\.expanded\) truncated = true/,
  'A failed section pager expansion must keep the course incomplete.'
)
assert.match(
  indexerSource,
  /!showAll\) return \{ doc, expanded: doc\.querySelectorAll\('li\.page'\)\.length <= 1 \}/,
  'Numbered pagination without a usable Show All control must keep the course incomplete.'
)
assert.match(
  indexerSource,
  /!isOpalLoginUrl\(finalUrl\)[\s\S]*isSameOpalRepository\(repositoryScope, finalUrl\)/,
  'Pager confirmation must reject login and foreign-course redirects before pruning.'
)
assert.match(
  backgroundSource,
  /!isOpalLoginUrl\(tab\.url\)/,
  'Login redirects must not retain the active indexing owner lease.'
)
assert.match(
  backgroundSource,
  /handoffOpalSmartSearch[\s\S]*for \(let attempt = 0; attempt < 6; attempt \+= 1\)/,
  'Owner handoff must retry already-open OPAL siblings while they finish loading.'
)
assert.match(
  indexerSource,
  /if \(link\.type === 'file'\) continue/,
  'Files already indexed from the page must not consume folder traversal slots.'
)
assert.match(
  indexerSource,
  /findMaterialSectionLinks\(doc, pageNode\.url\)[\s\S]*link\.type !== 'file'/,
  'File URLs found only in Wicket markup must still be stored before folder traversal skips them.'
)
assert.match(
  indexerSource,
  /hrefAttribute === '#' \|\| hrefAttribute\.toLowerCase\(\)\.startsWith\('javascript:'\)/,
  'Wicket placeholder hrefs must not overwrite their parent folder as a file.'
)
assert.match(
  indexerSource,
  /handleActiveIndexFailure\(error, progress\.startedAt\)/,
  'A bootstrap failure after prompt launch acknowledgement must terminate the current job.'
)
assert.match(
  indexerSource,
  /completedCourses = committed\.completedCourses[\s\S]*failedCourses = committed\.failedCourses/,
  'Course counters must come from the background commit so response retries stay idempotent.'
)
assert.match(
  backgroundSource,
  /Math\.max\(previous\.completedCourses[\s\S]*Math\.max\(previous\.failedCourses[\s\S]*Math\.max\(previous\.indexedItems/,
  'Published course and entry counters must never move backwards.'
)

const { rebuildGraphFields } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/searchEngine/graph.js')).href
)
const { parseOpalSearchQuery } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/searchEngine/query.js')).href
)
const { scoreCandidates } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/searchEngine/scorer.js')).href
)
const { searchOpalNodesFromGraph } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/search.js')).href
)
const { mergeOpalSearchNode } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/indexDb.js')).href
)
const { defaultSmartSearchSettings } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/settings.js')).href
)
const { readStoredCourses, uniqueStoredCourses } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/storedCourses.js')).href
)
const { shouldRecommendSmartSearchImprove } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/recommendation.js')).href
)
const { upsertOpalSearchNodes } = await import(
  pathToFileURL(path.join(buildDir, 'contentScripts/other/opal/smartSearch/messages.js')).href
)
const { tokenize } = await import(
  pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/searchEngine/tokenizer.js')).href
)
const { isOpalTargetInRepositoryScope, isOpalUiControlTarget, isSameOpalRepository, sanitizeOpalSearchNodes } =
  await import(pathToFileURL(path.join(buildDir, 'modules/opalSmartSearch/urlPolicy.js')).href)

const nodes = rebuildGraphFields([
  {
    id: 'course',
    title: 'Technische Mechanik 1',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/123',
    type: 'course',
    courseId: '/opal/auth/RepositoryEntry/123',
    parentId: null,
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: 'sheet-20',
    title: '20. Uebungsblatt.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/123/CourseNode/20/file.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/123',
    parentId: 'course',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: 'sheet-1',
    title: '1. Uebungsblatt 20. bis 24. Oktober.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/123/CourseNode/1/file.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/123',
    parentId: 'course',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: 'serie-9',
    title: 'Serie_9_Aufgaben.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/123/CourseNode/9/serie9.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/123',
    parentId: 'course',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: 'serie-0',
    title: 'Serie_0_Aufgaben.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/123/CourseNode/0/serie0.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/123',
    parentId: 'course',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: 'serie-9-compact',
    title: 'Serie9_Loesung.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/123/CourseNode/9/serie9-loesung.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/123',
    parentId: 'course',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  }
])

const parsed = parseOpalSearchQuery('uebung 20 pdf')
const ranked = scoreCandidates({
  candidates: nodes.map((node) => node.id),
  graphNodes: nodes,
  parsedQuery: parsed,
  activeCourseId: '/opal/auth/RepositoryEntry/123',
  limit: 3
})

assert.equal(ranked[0]?.node.id, 'sheet-20', 'primary exercise number should outrank date numbers')

const serieParsed = parseOpalSearchQuery('serie 9')
const serieRanked = scoreCandidates({
  candidates: nodes.map((node) => node.id),
  graphNodes: nodes,
  parsedQuery: serieParsed,
  activeCourseId: '/opal/auth/RepositoryEntry/123',
  limit: 5
})

assert.equal(serieRanked[0]?.node.id, 'serie-9', 'underscore filenames should match their explicit number')
assert.ok(
  !serieRanked.some((result) => result.node.id === 'serie-0'),
  'mismatched numbered filenames should not rank for an explicit number query'
)
assert.deepEqual(tokenize('Serie9_Loesung.pdf').slice(0, 3), ['serie', '9', 'loesung'])

const realDumpNodes = rebuildGraphFields([
  {
    id: '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895',
    title: 'Zum Kursmenü',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895#side-menu',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/10956963853',
    parentId: null,
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/10956963853/CourseNode/1712802691680954011',
    title: 'Unterlagen 1. Woche',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/1712802691680954011',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/10956963853',
    parentId: '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895',
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895/Serie_9_Aufgaben.pdf',
    title: 'Serie_9_Aufgaben.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895/Serie_9_Aufgaben.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/10956963853',
    parentId: '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895/Serie_10_Aufgaben.pdf',
    title: 'Serie_10_Aufgaben.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895/Serie_10_Aufgaben.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/10956963853',
    parentId: '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: '/opal/auth/RepositoryEntry/10956963853/CourseNode/1712802691680954011/Serie_0_Aufgaben.pdf',
    title: 'Serie_0_Aufgaben.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/1712802691680954011/Serie_0_Aufgaben.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/10956963853',
    parentId: '/opal/auth/RepositoryEntry/10956963853/CourseNode/1712802691680954011',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: '/opal/auth/RepositoryEntry/50435489792/CourseNode/1765251330416317008',
    title: '9. Übungsblatt (15. bis 19. Dezember 2025)',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/50435489792/CourseNode/1765251330416317008',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/50435489792',
    parentId: null,
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/1194721282/CourseNode/1648780362097390004',
    title: 'Vorlesungstermin 9',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/1194721282/CourseNode/1648780362097390004',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/1194721282',
    parentId: null,
    lastVisited: Date.now(),
    visitCount: 1
  }
])

const realSerieRanked = scoreCandidates({
  candidates: realDumpNodes.map((node) => node.id),
  graphNodes: realDumpNodes,
  parsedQuery: parseOpalSearchQuery('serie 9'),
  activeCourseId: '/opal/auth/RepositoryEntry/10956963853',
  limit: 5
})

assert.equal(
  realSerieRanked[0]?.node.id,
  '/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895/Serie_9_Aufgaben.pdf',
  'real OPAL serie 9 query should prefer the exact numbered serie file'
)
assert.ok(
  !realSerieRanked.some((result) => /Serie_(0|10)_Aufgaben\.pdf$/.test(result.node.title)),
  'real OPAL serie query should not keep neighboring numbered serie files'
)
assert.equal(
  isOpalUiControlTarget(
    'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895#side-menu',
    'Zum Kursmen\u00fc'
  ),
  true,
  'OPAL side-menu links should not enter the search graph'
)
assert.equal(
  isOpalUiControlTarget(
    'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/10956963853/CourseNode/93229901927895',
    'Link 001'
  ),
  true,
  'generic OPAL placeholder links should not enter the search graph'
)
assert.equal(
  isSameOpalRepository(
    '/opal/auth/RepositoryEntry/10956963853',
    'https://bildungsportal.sachsen.de/opal/FolderResource/10956963853/Serie_9_Aufgaben.pdf'
  ),
  true,
  'FolderResource files should stay in their owning course'
)
assert.equal(
  isSameOpalRepository(
    '/opal/auth/RepositoryEntry/10956963853',
    'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/37023252487/CourseNode/1'
  ),
  false,
  'foreign OPAL courses should not be treated as the same graph'
)
assert.equal(
  isOpalTargetInRepositoryScope(
    '/opal/auth/RepositoryEntry/23116349497',
    'https://bildungsportal.sachsen.de/opal/g/PEEK_VIEW_WRAPPER--46342209545--101435720877492--1627180496719968006_global/SA_Thermische-Auslegung-1.pdf'
  ),
  true,
  'opaque OPAL file URLs without repository ids should remain indexable inside the current course scope'
)
assert.deepEqual(
  sanitizeOpalSearchNodes([
    {
      id: 'same',
      title: 'Same course PDF',
      url: 'https://bildungsportal.sachsen.de/opal/FolderResource/10956963853/file.pdf',
      type: 'file',
      courseId: '/opal/auth/RepositoryEntry/10956963853',
      parentId: null,
      lastVisited: Date.now(),
      visitCount: 1
    },
    {
      id: 'foreign',
      title: 'Foreign course folder',
      url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/37023252487/CourseNode/1',
      type: 'folder',
      courseId: '/opal/auth/RepositoryEntry/10956963853',
      parentId: null,
      lastVisited: Date.now(),
      visitCount: 1
    }
  ]).map((node) => node.id),
  ['same'],
  'background sanitizing should reject nodes whose URL belongs to another course'
)

const folderFallbackGraph = rebuildGraphFields([
  {
    id: '/opal/auth/RepositoryEntry/42',
    title: 'Mathematik',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/42',
    type: 'course',
    courseId: '/opal/auth/RepositoryEntry/42',
    parentId: null,
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/42/CourseNode/lecture20.pdf',
    title: 'Vorlesung20.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/42/CourseNode/lecture20.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/42',
    parentId: '/opal/auth/RepositoryEntry/42',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  },
  {
    id: '/opal/auth/RepositoryEntry/42/CourseNode/20',
    title: 'Übung 20',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/42/CourseNode/20',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/42',
    parentId: '/opal/auth/RepositoryEntry/42',
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/42/CourseNode/20/ma_ue_2026_20.09.pdf',
    title: 'ma_ue_2026_20.09.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/42/CourseNode/20/ma_ue_2026_20.09.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/42',
    parentId: '/opal/auth/RepositoryEntry/42/CourseNode/20',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  }
])

assert.equal(
  searchOpalNodesFromGraph(folderFallbackGraph, 'mathe übung 20', '/opal/auth/RepositoryEntry/42', 3)[0]?.node.id,
  '/opal/auth/RepositoryEntry/42/CourseNode/20',
  'plain folder-topic queries should prefer the matching folder over its child files'
)

assert.equal(
  searchOpalNodesFromGraph(folderFallbackGraph, '/f mathe übung 20', '/opal/auth/RepositoryEntry/42', 3)[0]?.node.id,
  '/opal/auth/RepositoryEntry/42/CourseNode/20/ma_ue_2026_20.09.pdf',
  '/f should show files from a matching parent folder when filenames are cryptic'
)

const realFolderPreferenceGraph = rebuildGraphFields([
  {
    id: '/opal/auth/RepositoryEntry/50435489792',
    title: 'Spezielle Kapitel der Mathematik im WiSe 2025/26 und SoSe 2026',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/50435489792',
    type: 'course',
    courseId: '/opal/auth/RepositoryEntry/50435489792',
    parentId: null,
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/50435489792/CourseNode/1778553577284117008',
    title: '20. Uebungsblatt (18. bis 22. Mai 2026)',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/50435489792/CourseNode/1778553577284117008',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/50435489792',
    parentId: '/opal/auth/RepositoryEntry/50435489792',
    lastVisited: Date.now(),
    visitCount: 1
  },
  {
    id: '/opal/auth/RepositoryEntry/50435489792/CourseNode/1778553577284117008/ue20_ma3_mw_ss26-Aufgabenstellung.pdf',
    title: 'ue20_ma3_mw_ss26-Aufgabenstellung.pdf',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/50435489792/CourseNode/1778553577284117008/ue20_ma3_mw_ss26-Aufgabenstellung.pdf',
    type: 'file',
    courseId: '/opal/auth/RepositoryEntry/50435489792',
    parentId: '/opal/auth/RepositoryEntry/50435489792/CourseNode/1778553577284117008',
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: 'pdf'
  }
])

assert.equal(
  searchOpalNodesFromGraph(realFolderPreferenceGraph, 'mathe uebung 20', '/opal/auth/RepositoryEntry/50435489792', 3)[0]
    ?.node.id,
  '/opal/auth/RepositoryEntry/50435489792/CourseNode/1778553577284117008',
  'plain OPAL topic queries should prefer the readable folder over cryptic child files'
)

const filtered = parseOpalSearchQuery('/f tm1 pdf')
assert.equal(filtered.typeFilter, 'file')
assert.equal(filtered.extensionFilter, 'pdf')

const partialNameGraph = rebuildGraphFields([
  {
    id: 'mechanics-course',
    title: 'Technische Mechanik 1',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/77',
    type: 'course',
    courseId: '/opal/auth/RepositoryEntry/77',
    parentId: null,
    lastVisited: 0,
    visitCount: 0
  },
  {
    id: 'lecture-slides',
    title: 'Vorlesungsfolien',
    url: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/77/CourseNode/1',
    type: 'folder',
    courseId: '/opal/auth/RepositoryEntry/77',
    parentId: 'mechanics-course',
    lastVisited: 0,
    visitCount: 0
  }
])

assert.equal(
  searchOpalNodesFromGraph(partialNameGraph, 'folien', undefined, 3)[0]?.node.id,
  'lecture-slides',
  'infix title searches should reach the custom partial-match scorer'
)
assert.equal(
  searchOpalNodesFromGraph(partialNameGraph, 'mechank', undefined, 3)[0]?.node.id,
  'mechanics-course',
  'MiniSearch fuzzy relevance should survive custom reranking'
)

const storedNode = {
  ...partialNameGraph[0],
  lastVisited: 100,
  visitCount: 3,
  indexedAt: 100
}
const crawledNode = mergeOpalSearchNode(
  storedNode,
  { ...storedNode, lastVisited: 0, visitCount: 0, source: 'active' },
  200
)
assert.equal(crawledNode.visitCount, 3, 'background indexing must not count as a user visit')
assert.equal(crawledNode.lastVisited, 100, 'background indexing must preserve the last real visit')

const visitedNode = mergeOpalSearchNode(storedNode, { ...storedNode, lastVisited: 250, visitCount: 1 }, 250)
assert.equal(visitedNode.visitCount, 4, 'a real page visit should increment visit count once')
assert.equal(visitedNode.lastVisited, 250, 'a real page visit should update recency')
assert.equal(await upsertOpalSearchNodes([]), true, 'an empty extracted node batch should be a successful no-op')
assert.deepEqual(
  defaultSmartSearchSettings,
  { enabled: true },
  'SmartSearch should expose one default-on preference'
)

const storedCourses = uniqueStoredCourses(
  readStoredCourses(
    JSON.stringify([
      { name: 'Mechanik', link: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/77' },
      { title: 'Mechanik duplicate', href: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/77' }
    ])
  )
)
assert.equal(storedCourses.length, 1, 'shared stored-course parsing should normalize and deduplicate favorites')

const courseUrl = 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/77'
assert.equal(
  shouldRecommendSmartSearchImprove([courseUrl], {}, new Date(2026, 6, 10)),
  true,
  'a favorite without a complete crawl should recommend improvement'
)
assert.equal(
  shouldRecommendSmartSearchImprove([courseUrl], { [courseUrl]: new Date(2026, 3, 2).getTime() }, new Date(2026, 3, 5)),
  false,
  'a crawl completed during the semester window should stop the recommendation'
)
assert.equal(
  shouldRecommendSmartSearchImprove(
    [courseUrl],
    { [courseUrl]: new Date(2026, 2, 31).getTime() },
    new Date(2026, 3, 5)
  ),
  true,
  'a crawl from before semester start should be recommended during the first week'
)

console.log('Smart Search check passed.')
