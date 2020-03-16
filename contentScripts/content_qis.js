document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementsByTagName('a')[4].innerText === "Ich habe die Nutzungsbedingungen gelesen, verstanden und akzeptiert. >>>"){
      chrome.runtime.sendMessage({cmd: "show_badge"});  
      document.getElementsByTagName('a')[4].click()
    } else if (document.getElementById("asdf")){
      chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
        if(!(result.asdf === undefined || result.fdsa === undefined)) {
          document.getElementById('asdf').value = atob(result.asdf)
          document.getElementById('fdsa').value = atob(result.fdsa)
          document.getElementsByName('submit')[0].click()
        } else {(alert("Bitte gib deinen Nutzernamen und Passwort für die TU Dresden in der AutoPlugin Extension an!"))}
      });
    }
})
console.log('Auto Login to hisqis.')

