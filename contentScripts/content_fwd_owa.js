chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        console.log("fwd to owa")
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})    
        window.location.replace("https://msx.tu-dresden.de/owa/auth/logon.aspx")
    }
})