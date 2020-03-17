document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementsByTagName('a')[4].innerText === "Ich habe die Nutzungsbedingungen gelesen, verstanden und akzeptiert. >>>"){ 
      document.getElementsByTagName('a')[4].click()
      chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
    } else if (document.getElementById("asdf")){
      chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
        if(!(result.asdf === undefined || result.fdsa === undefined)) {
          chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
          chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
          document.getElementById('asdf').value = atob(result.asdf)
          document.getElementById('fdsa').value = atob(result.fdsa)
          document.getElementsByName('submit')[0].click()
        } else {
          chrome.runtime.sendMessage({cmd: "no_login_data"});
        }
      });
    }
})
console.log('Auto Login to hisqis.')

