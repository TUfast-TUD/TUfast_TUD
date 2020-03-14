//NOT SAVED ENCRYPTED
function saveUserData() {
    var username = document.getElementById('username_field').value
    var password = document.getElementById('password_field').value
    if (username === '' || password === '') {
        document.getElementById('status_msg').innerHTML = "Die Felder duerfen nicht leer sein!"
    } else {
        chrome.storage.local.set({'username': username, 'password': password}, function() {
            document.getElementById('status_msg').innerHTML = "Speichern erfolgreich."
        });
    }
}

//this need to be done here since manifest v2
window.onload = function(){
    document.getElementById('save_data').onclick=saveUserData;
}
