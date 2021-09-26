chrome.storage.local.get(['fwdEnabled'], function (result) {
    if (result.fwdEnabled) {
        console.log("fwd to https://eportal.med.tu-dresden.de/login")
        chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
        window.location.replace("https://eportal.med.tu-dresden.de/login")
    }
})