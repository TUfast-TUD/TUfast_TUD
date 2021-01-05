chrome.storage.local.get(['isEnabled', 'loggedOutOpal'], function(result) {
    if(/*result.isEnabled &&*/ !(result.loggedOutOpal)) {
        document.addEventListener('DOMContentLoaded', function() {
            //select TU Dresden from selector
            if(document.getElementsByName("wayfselection")[0]) {
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                document.getElementsByName("wayfselection")[0].value = "19"
            }
            chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 4000});
            chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
            document.getElementsByClassName("btn-highlight")[0].click()
        })
        console.log('Auto Login to Opal.')
    } else if(result.loggedOutOpal) {
        chrome.storage.local.set({loggedOutOpal: false}, function() {})
    }
})
