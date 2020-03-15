document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({cmd: "show_badge"});
    $('.btn-highlight').click()
})
