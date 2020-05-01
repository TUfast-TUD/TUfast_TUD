chrome.storage.local.get(['fwdEnabled'], function(result) {
    if(result.fwdEnabled) {
        console.log("fwd to matrix")
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
        window.location.replace("https://matrix.tu-dresden.de/#/login")
    }
})
