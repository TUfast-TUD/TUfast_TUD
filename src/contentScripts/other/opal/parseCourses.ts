import type { NotificationNamespace } from '../notification'

let opalParseCoursesStrings: typeof globalThis.TUFAST_STRINGS.opal
// Classic content scripts can't import; mirrors SmartSearchKey.favoritesDetectedAt (verify-smart-search.mjs guards the match).
const favoritesDetectedKey = 'opalSmartSearchFavoritesDetectedAt'

interface Course {
  name: string
  link: string
}

interface ParseResult {
  courses: Course[]
  favorites: Course[]
}

function parseTable(tbody: HTMLTableSectionElement | undefined | null): ParseResult {
  if (!tbody) return { courses: [], favorites: [] }

  // Get the current courses
  const favorites: Course[] = []
  const courses: Course[] = []

  const tableRows: HTMLCollection = tbody.getElementsByTagName('tr')
  for (const row of tableRows) {
    const linkElement: HTMLAnchorElement = row.getElementsByTagName('a')[0] as HTMLAnchorElement

    if (!linkElement || !linkElement.href || !linkElement.textContent) continue
    if (linkElement.textContent.trim().endsWith('[beendet]') || linkElement.textContent.trim().endsWith('[finished]'))
      continue // Course is finished

    const c = {
      link: linkElement.href,
      name: linkElement.textContent
    }
    courses.push(c)

    if (row.getElementsByClassName('icon-star-filled').length > 0) favorites.push(c)
  }

  return { courses, favorites }
}

function parseList(previewContainer: HTMLDivElement | undefined | null): ParseResult {
  const courses: Course[] = []
  const favorites: Course[] = []

  if (!previewContainer) return { courses, favorites }

  const listItems: HTMLCollection = previewContainer.getElementsByClassName('content-preview')

  for (const item of listItems) {
    const linkElement: HTMLAnchorElement = item.querySelector('.content-preview > a') as HTMLAnchorElement
    const titleElement = item.querySelector('.content-preview-main .content-preview-title') as HTMLHeadingElement

    if (!linkElement || !linkElement.href || !titleElement || !titleElement.textContent) continue
    if (titleElement.textContent.trim().endsWith('[beendet]') || titleElement.textContent.trim().endsWith('[finished]'))
      continue // Course is finished

    const c = {
      link: linkElement.href,
      name: titleElement.textContent
    }
    courses.push(c)

    if (item.getElementsByClassName('icon-star-filled').length > 0) favorites.push(c)
  }

  return { courses, favorites }
}

;(async () => {
  opalParseCoursesStrings = (await globalThis.TUFAST_STRINGS_READY).opal

  const notification: NotificationNamespace = await import(
    chrome.runtime.getURL('contentScripts/other/notification.js')
  )

  const mainFunction = async (settled = true) => {
    // We are only interested in these two pages
    if (
      window.location.pathname !== '/opal/auth/resource/courses' &&
      window.location.pathname !== '/opal/auth/resource/favorites'
    )
      return

    // We know one of the two pages is loaded so we only need to check which of those two
    const currentPage = window.location.pathname === '/opal/auth/resource/courses' ? 'meine_kurse' : 'favoriten'

    // Show all courses
    // If this is possible we don't need to do anything else because the MutationObserver will fire again
    const pages = document.querySelectorAll('li.page').length
    if (pages > 1) {
      const showAll = document.getElementsByClassName('pager-showall')[0]
      // OPAL pagers use `#`/`javascript:` hrefs with real click listeners — click unconditionally.
      if (showAll instanceof HTMLElement) {
        showAll.click()
        return
      }
    }

    const tablePanel = document.getElementsByClassName('table-panel')[0] as HTMLElement | undefined
    if (!tablePanel) return

    const previewContainer = tablePanel.getElementsByClassName('content-preview-container')[0] as
      | HTMLDivElement
      | undefined
    const tableBody = tablePanel.getElementsByTagName('tbody')[0]

    const { courses, favorites } = previewContainer ? parseList(previewContainer) : parseTable(tableBody)

    const emptyStateMarker = !!tablePanel.querySelector('.empty-state, [class*="empty-state"], [data-empty-state]')
    // OPAL can render zero favorites without any empty-state marker: also accept a settled
    // (debounced, not forced) parse of a rendered panel with no rows and no pager.
    const renderedEmptyFavorites =
      currentPage === 'favoriten' && courses.length === 0 && (emptyStateMarker || (settled && pages <= 1))

    // If the user has no courses - nothing to do here anymore (favorites can only be a subset of courses, so no check needed)
    if (courses.length === 0 && !renderedEmptyFavorites) return

    // Sort them by name
    courses.sort((a, b) => a.name.localeCompare(b.name))

    // Get the old data to check if something changed
    const { meine_kurse: currentCoursesStr, favoriten: currentFavouritesStr } = await chrome.storage.local.get([
      'meine_kurse',
      'favoriten'
    ])
    // Make an object out of it but in a scoped function so we can handle the error better
    const parseJson = (input: string) => {
      try {
        return JSON.parse(input)
      } catch {
        return undefined
      }
    }

    const currentCourses: Course[] = parseJson(currentCoursesStr)
    const currentFavourites: Course[] = parseJson(currentFavouritesStr)

    const firstTime = currentCourses === undefined

    // Compare those lists:
    // If they are the same we don't need to do anything
    const arraysAreSame = (array1: any[], array2: any[]) => {
      // When lengths are different we know something changed
      if (array1.length !== array2.length) return false

      // We need to match every course from one list to another
      // We only need one way because we know the lists are the same size.
      return array1.every((course) => {
        return !!array2.find((c) => c.name === course.name && c.link === course.link)
      })
    }

    // We don't want to update the course list on the favorites only page
    const coursesChanged = currentPage === 'meine_kurse' && !arraysAreSame(currentCourses || [], courses)
    const favouritesChanged = !arraysAreSame(currentFavourites || [], favorites)

    // eslint-disable-next-line camelcase
    const updateObj: Record<string, string | number> = {}
    if (coursesChanged) updateObj.meine_kurse = JSON.stringify(courses)
    // The zero-rows heuristic must not wipe a non-empty stored list — only the explicit marker may.
    const canConfirmEmptyFavorites = emptyStateMarker || !currentFavourites?.length
    if (courses.length > 0 ? favouritesChanged : canConfirmEmptyFavorites)
      updateObj.favoriten = JSON.stringify(favorites)
    if (currentPage === 'favoriten') updateObj[favoritesDetectedKey] = Date.now()

    if (Object.keys(updateObj).length > 0) {
      await chrome.storage.local.set(updateObj)
    }

    if (firstTime && updateObj.meine_kurse) {
      notification.notify(opalParseCoursesStrings.coursesSaved)
    } else if (coursesChanged || favouritesChanged) {
      notification.notify(opalParseCoursesStrings.coursesUpdated)
    }
  }

  // When the content changes we need to rerun as the tab is not getting reloaded
  const content = document.getElementsByClassName('content-container')[0]
  if (!content) return

  let parseTimeout = 0
  let maxWaitTimeout = 0
  const runMainFunction = (settled: boolean) => {
    window.clearTimeout(parseTimeout)
    window.clearTimeout(maxWaitTimeout)
    maxWaitTimeout = 0
    mainFunction(settled)
  }
  const scheduleMainFunction = () => {
    window.clearTimeout(parseTimeout)
    parseTimeout = window.setTimeout(() => runMainFunction(true), 800)
    // A page that never pauses mutating must still parse; forced runs skip the empty-favorites heuristic.
    if (!maxWaitTimeout) maxWaitTimeout = window.setTimeout(() => runMainFunction(false), 5000)
  }

  new MutationObserver(scheduleMainFunction).observe(content, { subtree: true, childList: true })

  // Let OPAL finish replacing its initially empty table before acknowledging favorites.
  scheduleMainFunction()
})()
