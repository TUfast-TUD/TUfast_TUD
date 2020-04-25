chrome.storage.local.get(['isEnabled'], function(result) {
  if(result.isEnabled) {  
    document.addEventListener('DOMContentLoaded', function() {  
      if (document.getElementById("username")) {
        chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
          if (!(result.fdsa === undefined || result.asdf === undefined)) {
            chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
            document.getElementById('username').value = (result.asdf)
            document.getElementById('password').value = (result.fdsa)
            document.getElementsByName("_eventId_proceed")[0].click()
          } else {
            chrome.runtime.sendMessage({cmd: "no_login_data"});
          }
        });
      } else {
        if (document.getElementsByName("_eventId_proceed")[0]) {
          document.getElementsByName("_eventId_proceed")[0].click()
          chrome.runtime.sendMessage({cmd: "perform_login"})    
          chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
        
        }
      }
    })
    console.log('Auto Login to TU Dresden Auth.')
  }
})





