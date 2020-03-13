//login with username and password
//wait a few milli-secs until input is auto-filled by browser
document.addEventListener('DOMContentLoaded', function() {  
  if (document.getElementsByName("j_password")[0]) {
    chrome.storage.local.get(['username', 'password'], function(result) {
      document.getElementById('j_username').value = result.username
      document.getElementById('j_password').value = result.password
      document.getElementsByName("_eventId_proceed")[0].click()
    });
  } else {
    document.getElementsByName("_eventId_proceed")[0].click()
  }
})





