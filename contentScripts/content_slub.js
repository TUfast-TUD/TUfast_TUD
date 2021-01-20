chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        document.addEventListener('DOMContentLoaded', function() {
            if(document.getElementById('username')){
                chrome.runtime.sendMessage({cmd: 'get_user_data', slubData: true}, function(response) {
                    if (!(response.asdf === undefined  || response.fdsa === undefined)) { 
                        chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                        chrome.runtime.sendMessage({cmd: "perform_login"})    
                        document.getElementById('username').value = response.asdf
                        document.getElementById('password').value = response.fdsa
                        document.querySelector("input[type=submit]").click()
                    } else {
                        chrome.runtime.sendMessage({cmd: "no_login_data"});
                    }
                })
            }
        })
        console.log('Auto Login to SLUB.')
    //page is reloaded two times
    }
})
