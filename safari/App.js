/* global translations */
const locale = navigator.language.startsWith('de') ? 'de' : 'en'
document.documentElement.lang = locale
for (const element of document.querySelectorAll('[data-text]')) {
  element.textContent = translations[locale][element.dataset.text]
}
function show(platform, enabled) {
  document.body.classList.add(`platform-${platform}`)
  document.body.classList.toggle('state-on', enabled === true)
  document.body.classList.toggle('state-off', enabled === false)
}
document.querySelector('.open-preferences').addEventListener('click', () => {
  window.webkit.messageHandlers.controller.postMessage('open-preferences')
})
