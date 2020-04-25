chrome.storage.local.get(['isEnabled'], function(result) {
  if(result.isEnabled) {
    document.addEventListener('DOMContentLoaded', function() {
        if(document.getElementsByTagName('a')[4].innerText === "Ich habe die Nutzungsbedingungen gelesen, verstanden und akzeptiert. >>>"){ 
          document.getElementsByTagName('a')[4].click()
          chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
        } else if (document.getElementById("asdf")){
          chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
            if(!(result.asdf === undefined || result.fdsa === undefined)) {
                chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                chrome.runtime.sendMessage({cmd: "perform_login"})    
                document.getElementById('asdf').value = result.asdf
                document.getElementById('fdsa').value = result.fdsa
                document.getElementsByName('submit')[0].click()
              } else {
                chrome.runtime.sendMessage({cmd: "no_login_data"});
            }
          });
        }
    })
    console.log('Auto Login to hisqis.')
  }
})
