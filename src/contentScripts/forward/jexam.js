chrome.storage.local.get(['fwdEnabled'], async (result) => {
  if (result.fwdEnabled) {
    console.log('fwd to jexam')
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 }, resolve))
    window.location.replace('https://jexam.inf.tu-dresden.de/de.jexam.web.v4.5/spring/welcome')
  }
})
