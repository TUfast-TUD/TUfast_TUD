document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('field_user')){
        chrome.runtime.sendMessage({cmd: "show_badge"});
        chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
            if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                document.getElementById('field_user').value = atob(result.asdf)
                document.getElementById('field_pass').value = atob(result.fdsa)
                document.getElementById('logIn_btn').click()
            } else {alert("Bitte gib deinen Nutzernamen und Passwort für die TU Dresden in der AutoPlugin Extension an!")}
        });
    }
})