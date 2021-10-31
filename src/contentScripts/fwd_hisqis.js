chrome.storage.local.get(['fwdEnabled'], async (result) => {
  if (result.fwdEnabled) {
    console.log('fwd to hisqis')
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 }, resolve))
    window.location.replace('https://qis.dez.tu-dresden.de/qisserver/servlet/de.his.servlet.RequestDispatcherServlet?state=template&template=user/news')
  }
})
