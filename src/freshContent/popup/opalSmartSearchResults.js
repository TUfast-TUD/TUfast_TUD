import { t } from '../../i18n'

const GROUP_ID = 'popup-opal-smart-search-results'
const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 3

// Popup SmartSearch bridge only. Ranking, storage, and opening rules stay in the
// background/SmartSearch modules so this can be removed without duplicating logic.
export function bindOpalSmartSearchResults(searchInput, listElement) {
  if (!searchInput || !listElement) return

  let enabled = false
  let debounce
  let requestId = 0

  chrome.runtime
    .sendMessage({ cmd: 'check_opal_smart_search_status' })
    .then((settings) => {
      enabled = Boolean(settings?.enabled)
      searchInput.placeholder = t(enabled ? 'popup.searchPlaceholderSmartSearch' : 'popup.searchPlaceholder')
      update()
    })
    .catch(() => undefined)

  searchInput.addEventListener('input', update)

  function update() {
    const currentRequest = ++requestId
    window.clearTimeout(debounce)
    clearGroup()
    debounce = window.setTimeout(() => renderCurrentQuery(currentRequest), 120)
  }

  async function renderCurrentQuery(currentRequest) {
    const query = searchInput.value.trim()

    if (!enabled || query.length < MIN_QUERY_LENGTH) return

    const results = await chrome.runtime
      .sendMessage({ cmd: 'opal_smart_search_query', rawQuery: query, limit: MAX_RESULTS })
      .catch(() => [])
    if (currentRequest !== requestId || !Array.isArray(results) || results.length === 0) return

    const group = document.createElement('div')
    group.id = GROUP_ID
    group.className = 'popup-smart-search'
    listElement.classList.add('is-smart-searching')

    const label = document.createElement('div')
    label.className = 'popup-smart-search-label'
    label.textContent = t('popup.opalSmartSearchResults')
    group.appendChild(label)

    for (const result of results.slice(0, MAX_RESULTS)) {
      group.appendChild(renderResult(result.node))
    }

    group.appendChild(renderSeeMore(query))
    insertGroup(group)
  }

  function renderResult(node) {
    const wrapper = document.createElement('div')
    wrapper.className = 'list-entry-wrapper popup-smart-search-result'

    const entry = document.createElement('a')
    entry.className = 'list-entry'
    entry.href = '#'
    entry.onclick = (event) => {
      event.preventDefault()
      chrome.runtime
        .sendMessage({ cmd: 'open_opal_smart_search_result', nodeId: node.id })
        .finally(() => window.close())
      return false
    }

    const icon = renderTypeIcon(node.type)

    const text = document.createElement('div')
    text.className = 'list-entry-text popup-smart-search-copy'
    const title = document.createElement('strong')
    title.textContent = node.title
    const context = document.createElement('small')
    context.textContent = renderContext(node)
    text.appendChild(title)
    text.appendChild(context)

    entry.appendChild(icon)
    entry.appendChild(text)
    wrapper.appendChild(entry)
    return wrapper
  }

  function renderSeeMore(query) {
    const wrapper = document.createElement('div')
    wrapper.className = 'list-entry-wrapper popup-smart-search-more'

    const entry = document.createElement('a')
    entry.className = 'list-entry'
    entry.href = '#'
    entry.onclick = (event) => {
      event.preventDefault()
      chrome.runtime.sendMessage({ cmd: 'open_opal_smart_search_query', rawQuery: query }).finally(() => window.close())
      return false
    }
    entry.textContent = t('popup.opalSmartSearchMore')

    wrapper.appendChild(entry)
    return wrapper
  }

  function insertGroup(group) {
    const banana = listElement.querySelector('#banana')
    if (banana?.nextSibling) {
      listElement.insertBefore(group, banana.nextSibling)
      return
    }
    listElement.prepend(group)
  }

  function clearGroup() {
    document.getElementById(GROUP_ID)?.remove()
    listElement.classList.remove('is-smart-searching')
  }
}

function renderTypeIcon(type) {
  const icon = document.createElement('span')
  icon.className = `popup-smart-search-icon popup-smart-search-icon--${type}`
  const paths = {
    course: '<path d="M4 5a3 3 0 0 1 3-2h13v16H7a3 3 0 0 0-3 2zM4 5v16"/>',
    folder: '<path d="M3 6h7l2 2h9v10H3z"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v5h5"/>'
  }
  icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type] || paths.file}</svg>`
  return icon
}

function renderContext(node) {
  const parents = Array.isArray(node.pathTitles) ? node.pathTitles.filter(Boolean).slice(0, -1) : []
  const path = parents.length > 3 ? [parents[0], '…', parents[parents.length - 1]] : parents
  const type = node.fileExtension ? node.fileExtension.toUpperCase() : typeLabel(node.type)
  return [type, path.join(' › ')].filter(Boolean).join(' · ')
}

function typeLabel(type) {
  if (type === 'course') return t('popup.opalSmartSearchTypeCourse')
  if (type === 'folder') return t('popup.opalSmartSearchTypeFolder')
  return t('popup.opalSmartSearchTypeFile')
}
