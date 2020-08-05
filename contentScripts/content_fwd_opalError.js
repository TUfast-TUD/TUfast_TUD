chrome.storage.local.get(['fwdEnabled'], function(result) {
    if(result.fwdEnabled) {
        console.log("fwd to opal from opal error")
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
        //click on forward to opal, which should be first element in list
        if(document.querySelectorAll("li>a")[0].text.includes("OPAL")){
            document.querySelectorAll("li>a")[0].click()
        }
        
    }
})