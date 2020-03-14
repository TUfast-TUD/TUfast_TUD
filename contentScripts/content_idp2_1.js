//login with username and password
//wait a few milli-secs until input is auto-filled by browser
document.addEventListener('DOMContentLoaded', function() {  
  if (document.getElementById("username")) {
    chrome.storage.local.get(['username', 'password'], function(result) {
      if (!(result.password === undefined || result.username === undefined)) {
        document.getElementById('username').value = result.username
        document.getElementById('password').value = result.password
        document.getElementsByName("_eventId_proceed")[0].click()
      } else { alert('Bitte gib deinen Nutzernamen und Password für die TU Dresden in der AutoPlugin Extension an!')}
    });
  } else {
    document.getElementsByName("_eventId_proceed")[0].click()
  }
})





