//NOT SAVED ENCRYPTED
function saveUserData() {
    var asdf = document.getElementById('username_field').value
    var fdsa = document.getElementById('password_field').value
    if (asdf === '' || fdsa === '') {
        document.getElementById('status_msg').innerHTML = "<font color='red'>Die Felder d&uuml;rfen nicht leer sein!</font>"
    } else {
        chrome.runtime.sendMessage({cmd: "clear_badge"});
        chrome.runtime.sendMessage({cmd: "set_user_data", userData: {asdf: asdf, fdsa: fdsa}})
        document.getElementById('status_msg').innerHTML = ""
        document.getElementById("save_data").innerHTML='<font color="green">Gespeichert!</font>';
        document.getElementById("save_data").disabled=true;
        document.getElementById("username_field").value = ""
        document.getElementById("password_field").value = ""
        setTimeout(()=>{
            document.getElementById("save_data").innerHTML='Speichern';
            document.getElementById("save_data").disabled=false;
        }, 2000)
    }
}

//this need to be done here since manifest v2
window.onload = function(){
    //assign onclick function
    document.getElementById('save_data').onclick=saveUserData;
}
