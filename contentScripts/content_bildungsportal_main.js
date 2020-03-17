document.addEventListener('DOMContentLoaded', function() {
    //select TU Dresden from selector
    if(document.getElementsByName("wayfselection")[0]) {
        document.getElementsByName("wayfselection")[0].value = "18"
    }
    chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 4000});
    $('.btn-highlight').click()
})
console.log('Auto Login to Opal.')
