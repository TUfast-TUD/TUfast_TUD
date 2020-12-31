chrome.storage.local.get(['isEnabled', 'loggedOutOwa'], function(result) {
    if(result.isEnabled && !result.loggedOutOwa) {       
        if (document.readyState !== 'loading') {
            loginOWA(result.loggedOutOwa)
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                loginOWA(result.loggedOutOwa)
            })
        } 
        console.log('Auto Login to OWA.')
    }
    //sometimes it reloades the page, sometimes it doesnt...
    //else if(result.loggedOutOwa) {
    //    chrome.storage.local.set({loggedOutOwa: undefined}, function() {})
    //   setTimeout(() => {  chrome.storage.local.set({loggedOutOwa: false}, function() {}) }, 2000);
    //} else if(result.loggedOutOwa === undefined) {
    //    chrome.storage.local.set({loggedOutOwa: false}, function() {})
    //}
})

//detecting logout
document.addEventListener("DOMNodeInserted", function(e) {
    if(document.querySelectorAll('[aria-label="Abmelden"]')[0]) {
        document.querySelectorAll('[aria-label="Abmelden"]')[0].addEventListener('click', function() {
            chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutOwa'})
        })
    }
}, false);

function loginOWA(loggedOutOwa){
    if (document.getElementById('username') && document.getElementById('password') && !loggedOutOwa) {
        chrome.runtime.sendMessage({ cmd: 'get_user_data' }, function (result) {
            if (!(result.asdf === undefined || result.fdsa === undefined)) {
                chrome.runtime.sendMessage({ cmd: "show_ok_badge", timeout: 2000 })
                chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
                chrome.runtime.sendMessage({ cmd: "perform_login" })
                document.getElementById('username').value = (result.asdf) + "@msx.tu-dresden.de"
                document.getElementById('password').value = (result.fdsa)
                document.getElementsByClassName('signinbutton')[0].click()
                chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
            } else {
                chrome.runtime.sendMessage({ cmd: "no_login_data" });
            }
        });
    }
    //detecting logout
    if (document.querySelectorAll('[aria-label="Abmelden"]')[0]) {
        document.querySelectorAll('[aria-label="Abmelden"]')[0].addEventListener('click', function () {
            chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
        })
    }
}