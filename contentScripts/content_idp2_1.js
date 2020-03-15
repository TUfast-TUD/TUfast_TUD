document.addEventListener('DOMContentLoaded', function() {  
  if (document.getElementById("asdf")) {
    chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
      if (!(result.fdsa === undefined || result.asdf === undefined)) {
        document.getElementById('asdf').value = atob(result.asdf)
        document.getElementById('fdsa').value = atob(result.fdsa)
        document.getElementsByName("_eventId_proceed")[0].click()
      } else { alert('Bitte gib deinen Nutzernamen und Passwort für die TU Dresden in der AutoPlugin Extension an!')}
    });
  } else {
    document.getElementsByName("_eventId_proceed")[0].click()
  }
})





