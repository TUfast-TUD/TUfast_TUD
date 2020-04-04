//not working

/*setInterval(function(){ 
    if(document.getElementById("mx_PasswordLogin_username") && document.getElementById('mx_PasswordLogin_password')) {
        chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
            if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                //document.getElementById("mx_PasswordLogin_type")[0].value = "1"
                console.log()
                document.getElementById('mx_PasswordLogin_username').value = atob(result.asdf)
                document.getElementById('mx_PasswordLogin_password').value = atob(result.fdsa)
                document.getElementsByClassName('mx_Login_submit')[0].click()
            } else {
                chrome.runtime.sendMessage({cmd: "no_login_data"});
            }
        });
    }
}, 3000);*/

