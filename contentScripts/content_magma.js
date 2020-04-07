document.addEventListener("DOMContentLoaded", function() {
    if(document.getElementsByName("loginButton") && document.getElementsByName("wayfSelect")){
        console.log("Found")
        chrome.storage.local.get(["asdf", "fdsa"], function(result) {
            if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                document.getElementsByName("wayfSelect")[0].value = "11"
                document.getElementsByName("loginButton")[0].click()
            } else {
              
            }
        });
    }
})
console.log("Auto Login to magma.")