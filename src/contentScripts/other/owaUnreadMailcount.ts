function findUnreadCount(): HTMLDivElement | null {
  const treeItems = document.querySelectorAll('div[role="treeitem"]')
  for (const treeItem of treeItems) {
    const nameSpan = treeItem.querySelector('span[title]')
    if (!nameSpan) continue
    const title = nameSpan.getAttribute('title')

    if (title === 'Inbox' || title === 'Posteingang') {
      return nameSpan.nextElementSibling as HTMLDivElement
    }
  }
  return null
}

const checkInterval = setInterval(() => {
  const unreadCountNode = findUnreadCount()
  if (!unreadCountNode) return

  clearInterval(checkInterval)
  new MutationObserver((mutationRecord) => {
    const count = Number.parseInt(mutationRecord[0]?.target?.textContent || '') || 0
    chrome.runtime.sendMessage({ cmd: 'read_mail_owa', nrOfUnreadMail: count })
  }).observe(unreadCountNode, { subtree: true, characterData: true })
}, 100)
