chrome.storage.local.get(['isEnabled' , 'loggedOutMagma'], function(result) {
    if(result.isEnabled && !result.loggedOutMagma) {
        document.addEventListener("DOMContentLoaded", function() {
            if(document.getElementsByName("loginButton")[0] && document.getElementsByName("wayfSelect")[0]){
                chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                document.getElementsByName("wayfSelect")[0].value = "11"
                document.getElementsByName("loginButton")[0].click()
            }
            if(document.querySelectorAll('#page > div:nth-child(3) > section > div:nth-child(3) > form > button')[0]){
                document.querySelectorAll('#page > div:nth-child(3) > section > div:nth-child(3) > form > button')[0].click()
            }
            //logout
            if(document.querySelectorAll('#page > header > div:nth-child(2) > div > a')[0]) {
                document.querySelectorAll('#page > header > div:nth-child(2) > div > a')[0].addEventListener('click', function() {
                    chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutMagma'})
                })
            }
    })
    console.log("Auto Login to magma.")
    } 
    else if(result.loggedOutMagma) {
        chrome.storage.local.set({loggedOutMagma: false}, function() {})
    }
})