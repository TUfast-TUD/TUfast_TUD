document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('field_user')){
        chrome.storage.local.get(['username', 'password'], function(result) {
            if (!(result.username === undefined  || result.password === undefined)) { 
                document.getElementById('field_user').value = result.username
                document.getElementById('field_pass').value = result.password
                document.getElementById('logIn_btn').click()
            } else {alert("Bitte gib deinen Nutzernamen und Password für die TU Dresden in der AutoPlugin Extension an!")}
        });
    }
})