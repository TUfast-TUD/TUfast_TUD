document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementsByTagName('a')[4].innerText === "Ich habe die Nutzungsbedingungen gelesen, verstanden und akzeptiert. >>>"){
        document.getElementsByTagName('a')[4].click()
    } else if (document.getElementById("asdf")){
      chrome.storage.local.get(['username', 'password'], function(result) {
        document.getElementById('asdf').value = result.username
        document.getElementById('fdsa').value = result.password
        document.getElementsByName('submit')[0].click()
      });
    }
})

