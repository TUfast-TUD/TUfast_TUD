chrome.storage.local.get(['isEnabled'], function(result) {
  console.log('-1')
  if(result.isEnabled) {  
    console.log('0')
    document.addEventListener('DOMContentLoaded', function() {  
      if (document.getElementById("username")) {
        console.log('1')
        chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
          if (!(result.fdsa === undefined || result.asdf === undefined)) {
            console.log('2')
            chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
            document.getElementById('username').value = (result.asdf)
            document.getElementById('password').value = (result.fdsa)
            document.getElementsByName("_eventId_proceed")[0].click()
          } else {
            chrome.runtime.sendMessage({cmd: "no_login_data"});
          }
        });
      } else if (document.getElementsByName("_eventId_proceed")[0]){
            console.log('3')
            document.getElementsByName("_eventId_proceed")[0].click()
          chrome.runtime.sendMessage({cmd: "perform_login"})    
          chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
      } else if (document.querySelectorAll('body > div:nth-child(2) > div:nth-child(1) > b')[0]) {
        if(document.querySelectorAll('body > div:nth-child(2) > div:nth-child(1) > b')[0].innerHTML === "TUD - TU Dresden - Single Sign On - Veraltete Anfrage" ||
           document.querySelectorAll('body > div:nth-child(2) > div:nth-child(1) > b')[0].innerHTML === "TUD - TU Dresden - Single Sign On - Stale Request"){
          window.location.replace("https://bildungsportal.sachsen.de/opal/login")
        }
      }
    })
    console.log('Auto Login to TU Dresden Auth.')
  }
})
console.log('-2')






