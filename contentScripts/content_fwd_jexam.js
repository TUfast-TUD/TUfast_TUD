chrome.storage.local.get(['fwdEnabled'], function(result) {
    if(result.fwdEnabled) {
        console.log("fwd to jexam")
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})    
        window.location.replace("https://jexam.inf.tu-dresden.de/de.jexam.web.v4.5/spring/welcome")
    }
})