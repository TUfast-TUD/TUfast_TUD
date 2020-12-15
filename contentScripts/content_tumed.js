chrome.storage.local.get(['isEnabled', 'loggedOutTumed'], function(result) {
    if(result.isEnabled && !result.loggedOutTumed) {
      document.addEventListener('DOMContentLoaded', function() {
        if(document.querySelectorAll(`label[for=__ac_name]`)[0].textContent === "Benutzername" && document.querySelectorAll(`label[for=__ac_password]`)[0].textContent === "Passwort" && document.getElementById("__ac_name") && document.getElementById("__ac_password")) 
          chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
                if(!(result.asdf === undefined || result.fdsa === undefined)) {
                    chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                    chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                    chrome.runtime.sendMessage({cmd: "perform_login"})    
                    document.getElementById("__ac_name").value = result.asdf
                    document.getElementById("__ac_password").value = result.fdsa
                    document.querySelectorAll(`input[value=Anmelden]`)[0].click()
                } else {
                    chrome.runtime.sendMessage({cmd: "no_login_data"});
                }
            })

        //abmelden button
        /*if(document.querySelectorAll('#visual-footer-wrapper :nth-child(5)')[0]){
          document.querySelectorAll('#visual-footer-wrapper :nth-child(5)')[0].addEventListener('click', function() {
            chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutTumed'})
          })
        }*/
      })
      console.log('Auto Login to eportal med.')
    } else if(result.loggedOutTumed) {
      chrome.storage.local.set({loggedOutTumed: false}, function() {})
    }
  
  })
  