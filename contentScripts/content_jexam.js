chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        document.addEventListener('DOMContentLoaded', function() {
            if(document.getElementById('username') && document.getElementById("password")){
                chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
                    if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                        chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                        chrome.runtime.sendMessage({cmd: "perform_login"})    
                        document.getElementById('username').value = atob(result.asdf)
                        document.getElementById('password').value = atob(result.fdsa)
                        document.getElementsByTagName('input')[2].click()
                    } else {
                        chrome.runtime.sendMessage({cmd: "no_login_data"});
                    }
                });
            }
        })
        console.log('Auto Login to jexam.')
    }
})