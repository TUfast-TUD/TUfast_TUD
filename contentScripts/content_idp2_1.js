document.addEventListener('DOMContentLoaded', function() {  
  if (document.getElementById("username")) {
    chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
      if (!(result.fdsa === undefined || result.asdf === undefined)) {
        document.getElementById('username').value = atob(result.asdf)
        document.getElementById('password').value = atob(result.fdsa)
        console.log(atob(result.asdf))
        document.getElementsByName("_eventId_proceed")[0].click()
      } else { alert('Bitte gib deinen Nutzernamen und Passwort für die TU Dresden in der AutoPlugin Extension an!')}
    });
  } else {
    document.getElementsByName("_eventId_proceed")[0].click()
  }
})





