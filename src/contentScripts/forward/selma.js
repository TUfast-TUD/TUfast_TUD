chrome.storage.local.get(['fwdEnabled'], async (result) => {
  if (result.fwdEnabled) {
    console.log('fwd to selma')
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 }, resolve))
    // There is a unique session url. That is why user always has to be fwd to login page :/
    window.location.replace('https://selma.tu-dresden.de/APP/EXTERNALPAGES/-N000000000000001,-N000155,-AEXT_willkommen')
  }
})
