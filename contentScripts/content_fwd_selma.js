chrome.storage.local.get(['fwdEnabled'], function(result) {
    if(result.fwdEnabled) {
        console.log('fwd to selma')
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
        window.location.replace("https://selma.tu-dresden.de/APP/MLSSTART/-N982027801258054,-N000090,")
    }
})