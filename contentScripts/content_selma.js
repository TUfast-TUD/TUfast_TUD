document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('field_user')){
        chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
            if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                chrome.runtime.sendMessage({cmd: "perform_login"})    
                document.getElementById('field_user').value = atob(result.asdf)
                document.getElementById('field_pass').value = atob(result.fdsa)
                document.getElementById('logIn_btn').click()
            } else {
                chrome.runtime.sendMessage({cmd: "no_login_data"});
            }
        });
    }
})
console.log('Auto Login to Selma.')