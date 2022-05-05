chrome.storage.local.get(['fwdEnabled'], async (result) => {
  if (result.fwdEnabled) {
    console.log('fwd to magma')
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 }, resolve))
    window.location.replace('https://bildungsportal.sachsen.de/magma/')
  }
})
