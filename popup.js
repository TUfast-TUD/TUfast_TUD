//NOT SAVED ENCRYPTED
function saveUserData() {
    var asdf = btoa(document.getElementById('username_field').value)
    var fdsa = btoa(document.getElementById('password_field').value)
    if (asdf === '' || fdsa === '') {
        document.getElementById('status_msg').innerHTML = "Die Felder duerfen nicht leer sein!"
    } else {
        chrome.storage.local.set({'asdf': asdf, 'fdsa': fdsa}, function() {
            document.getElementById('status_msg').innerHTML = "Speichern erfolgreich."
        });
    }
}

//this need to be done here since manifest v2
window.onload = function(){
    document.getElementById('save_data').onclick=saveUserData;
}
