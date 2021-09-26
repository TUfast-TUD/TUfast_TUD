chrome.storage.local.get(['isEnabled', 'loggedOutOwa'], function (result) {
    if (result.isEnabled && !result.loggedOutOwa) {
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
document.addEventListener("DOMNodeInserted", function (e) {
    // old owa version
    if (document.querySelectorAll('[aria-label="Abmelden"]')[0]) {
        document.querySelectorAll('[aria-label="Abmelden"]')[0].addEventListener('click', function () {
            chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
        })
    }
    // new owa version
    if (document.querySelectorAll("[autoid='_ho2_2']")[1] && document.querySelectorAll("[autoid='_ho2_2']")[1].innerHTML == "Abmelden") {
        document.querySelectorAll('[aria-label="Abmelden"]')[1].addEventListener('click', function () {
            chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
        })
    }
}, false);

function loginOWA(loggedOutOwa) {
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

window.onload = function () {
    chrome.storage.local.get(['enabledOWAFetch'], (resp) => {
        if (resp.enabledOWAFetch) {
            //check if all mails are loaded | also check for new owa version
            let checkForNode = setInterval(() => {
                this.console.log("checking")
                if ((document.querySelectorAll("[autoid='_n_x1']")[1] && document.querySelectorAll("[autoid='_n_x1']")[1].textContent != "") ||
                    (document.querySelectorAll("[autoid='_n_41']")[1] && document.querySelectorAll("[autoid='_n_41']")[1].textContent != "")) {
                    readMailObserver()
                    clearInterval(checkForNode)
                }
            }, 100);
        }
    })
}

function readMailObserver() {
    //use mutation observer to detect page changes
    const config = { attributes: true, childList: true, subtree: true, characterData: true }
    const callback = function (mutationsList, observer) {

        //check again, if enabled
        chrome.storage.local.get(['enabledOWAFetch'], (resp) => {
            if (resp.enabledOWAFetch) {

                //get number of unread messages | also check for new owa version
                try {
                    var NrUnreadMails = parseInt(document.querySelectorAll("[autoid='_n_x1']")[1].textContent)
                } catch {
                    var NrUnreadMails = parseInt(document.querySelectorAll("[autoid='_n_41']")[1].textContent)
                }

                if (isNaN(NrUnreadMails)) NrUnreadMails = 0

                console.log("Number of unread mails: " + NrUnreadMails)

                chrome.runtime.sendMessage({ cmd: "read_mail_owa", NrUnreadMails: NrUnreadMails })
            }
        })

    }

    //node containing unreadCount | also check new owa version
    let unreadCountNode = document.querySelectorAll("[autoid='_n_41']")[1]
    if (unreadCountNode == undefined) unreadCountNode = document.querySelectorAll("[autoid='_n_c']")[0]

    const observer = new MutationObserver(callback);
    observer.observe(unreadCountNode, config);
}
