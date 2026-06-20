import { OPAL_SMART_SEARCH_HIGHLIGHT_KEY } from '../../../../modules/opalSmartSearch/settings'
import { normalizeAllowedOpalUrl } from '../../../../modules/opalSmartSearch/urlPolicy'

export async function checkAndHighlightIndexedFile(): Promise<void> {
  const data = await chrome.storage.local.get([OPAL_SMART_SEARCH_HIGHLIGHT_KEY])
  const intent = data[OPAL_SMART_SEARCH_HIGHLIGHT_KEY] as { title: string; url: string } | undefined
  const targetUrl = intent ? normalizeAllowedOpalUrl(intent.url) : null
  if (!intent || !targetUrl) return

  await chrome.storage.local.remove([OPAL_SMART_SEARCH_HIGHLIGHT_KEY])
  if (!tryHighlightFile(intent, targetUrl)) window.setTimeout(() => tryHighlightFile(intent, targetUrl), 800)
}

function tryHighlightFile(intent: { title: string; url: string }, targetUrl: string): boolean {
  const escapedTitle = CSS.escape ? CSS.escape(intent.title) : intent.title.replace(/"/g, '\\"')
  const byName = document.querySelector<HTMLAnchorElement>(`a[data-file-name="${escapedTitle}"]`)
  if (byName && applyHighlight(byName)) return true

  try {
    const targetPath = new URL(targetUrl).pathname
    for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
      try {
        if (new URL(anchor.href).pathname === targetPath && applyHighlight(anchor)) return true
      } catch {
        // Ignore malformed links.
      }
    }
  } catch {
    return false
  }

  return false
}

function applyHighlight(anchor: HTMLAnchorElement): boolean {
  const target = anchor.closest('tr') || anchor.parentElement
  if (!target) return false

  target.classList.add('tufast-smart-search-highlight')
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  window.setTimeout(() => target.classList.remove('tufast-smart-search-highlight'), 3500)
  return true
}
