chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        console.log("fwd to jexam")
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})    
        window.location.replace("https://jexam.inf.tu-dresden.de/de.jexam.web.v4.5/spring/welcome")
    }
})