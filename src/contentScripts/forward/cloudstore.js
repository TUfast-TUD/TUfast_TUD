chrome.storage.local.get(['fwdEnabled'], async (result) => {
  if (result.fwdEnabled) {
    console.log('fwd to cloudstore')
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 }, resolve))
    window.location.replace('https://cloudstore.zih.tu-dresden.de/index.php/login')
  }
})
