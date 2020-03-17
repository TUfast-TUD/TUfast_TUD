document.addEventListener('DOMContentLoaded', function() {  
  if (document.getElementById("username")) {
    chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
      if (!(result.fdsa === undefined || result.asdf === undefined)) {
        document.getElementById('username').value = atob(result.asdf)
        document.getElementById('password').value = atob(result.fdsa)
        document.getElementsByName("_eventId_proceed")[0].click()
      } else {
        chrome.runtime.sendMessage({cmd: "no_login_data"});
      }
    });
  } else {
    document.getElementsByName("_eventId_proceed")[0].click()
  }
})
console.log('Auto Login to TU Dresden Auth.')





