chrome.storage.local.get(['fwdEnabled'], function (result) {
    if (result.fwdEnabled) {
        console.log("fwd to owa")
        chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
        window.location.replace("https://msx.tu-dresden.de/owa/#path=/mail")
    }
})