chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        //detect logout
        document.addEventListener('DOMContentLoaded', function() {
            if(document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0]) {
                document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0].addEventListener('click', function() {
                    chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutOpal'})
                })
            }
        })
    }
})
