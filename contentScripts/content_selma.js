chrome.storage.local.get(['isEnabled', 'loggedOutSelma'], function(result) {
    console.log('GOT: '+ result.loggedOutSelma)
    if(result.isEnabled && !result.loggedOutSelma) {
        document.addEventListener('DOMContentLoaded', function() {
            if(document.getElementById('field_user')){
                chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(response) {
                    if (!(response.asdf === undefined  || response.fdsa === undefined)) { 
                        chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                        chrome.runtime.sendMessage({cmd: "perform_login"})    
                        document.getElementById('field_user').value = response.asdf
                        document.getElementById('field_pass').value = response.fdsa
                        document.getElementById('logIn_btn').click()
                    } else {
                        chrome.runtime.sendMessage({cmd: "no_login_data"});
                    }
                })
            }
            //abmelden button
            if(document.getElementById('logOut_btn')){
                document.getElementById('logOut_btn').addEventListener('click', function() {
                    chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutSelma'})
                })
            }
        })
        console.log('Auto Login to Selma.')
    //page is reloaded two times
    } else if(result.loggedOutSelma) {
        chrome.storage.local.set({loggedOutSelma: undefined}, function() {})
    } else if(result.loggedOutSelma === undefined) {
        chrome.storage.local.set({loggedOutSelma: false}, function() {})
    }
})