chrome.storage.local.get(['fwdEnabled'], function (result) {
    if (result.fwdEnabled & !(location.href.includes("exam"))) { //dont fwd if user wants to get to exam.zih.tu-dresden.de
        console.log("fwd to opal")
        chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
        window.location.replace("https://bildungsportal.sachsen.de/opal/shiblogin?0")
    }
})