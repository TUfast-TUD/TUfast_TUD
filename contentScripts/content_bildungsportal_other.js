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
        //scrape favorites - always update if possible
            //on visiting favorites page: https://bildungsportal.sachsen.de/opal/auth/resource/favorites*
                //save to storage: [{subject: subject1, link: link1}, ...]
            //on visiting home page: https://bildungsportal.sachsen.de/opal/home*
                //save to storage: [{subject: subject1, link: link1}, ...]
    }
})
