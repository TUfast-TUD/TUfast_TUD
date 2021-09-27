chrome.storage.local.get(['fwdEnabled', 'isEnabled'], function (result) {
  if (result.fwdEnabled) {
    console.log('register fwds in startpage')
    const searchForm = document.getElementById('search')
    const searchInput = document.getElementById('q')
    searchForm.addEventListener('submit', event => fwdOnSearch(event, searchInput.value, result.isEnabled))
  }
})

function fwdOnSearch (event, value, isEnabled) {
  console.log(value)
  console.log(isEnabled)
  let link = ''
  let fwd = true
  switch (value) {
    case 'opal':
      link = 'https://bildungsportal.sachsen.de/opal/shiblogin?0'
      break
    case 'jexam':
      link = 'https://jexam.inf.tu-dresden.de/de.jexam.web.v4.5/spring/welcome'
      break
    case 'tustore':
    case 'tucloud':
      link = 'https://cloudstore.zih.tu-dresden.de/index.php/login'
      break
    case 'tumail':
    case 'tudmail':
      link = 'https://msx.tu-dresden.de/owa/#path=/mail'
      break
    case 'hisqis':
      link = 'https://qis.dez.tu-dresden.de/qisserver/servlet/de.his.servlet.RequestDispatcherServlet?state=template&template=user/news'
      break
    case 'tumed':
      link = 'https://eportal.med.tu-dresden.de/login'
      break
    case 'selma':
      link = 'https://selma.tu-dresden.de/APP/EXTERNALPAGES/-N000000000000001,-N000155,-AEXT_willkommen'
      break
    case 'tumatrix':
      link = isEnabled ? 'https://matrix.tu-dresden.de/#/login' : 'https://matrix.tu-dresden.de/#/'
      break
    case 'magma':
      link = 'https://bildungsportal.sachsen.de/magma/'
      break
    default:
      fwd = false
  }
  if (fwd) {
    event.preventDefault()
    console.log(`fwd to ${link}`)
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
    window.location.replace(link)
  }
}
