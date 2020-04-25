        
chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {        
        document.addEventListener('DOMContentLoaded', function() {
            if(document.getElementById('user') && document.getElementById('password')){
                chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
                    if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                        chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                        chrome.runtime.sendMessage({cmd: "perform_login"})    
                        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                        document.getElementById('user').value = (result.asdf)
                        document.getElementById('password').value = (result.fdsa)
                        document.getElementById('submit').click()
                    } else {
                        chrome.runtime.sendMessage({cmd: "no_login_data"});
                    }
                });
            }
        })
        console.log('Auto Login to Cloudstore.')
    }
})