//NOT SAVED ENCRYPTED
function saveUserData() {
    var asdf = btoa(document.getElementById('username_field').value)
    var fdsa = btoa(document.getElementById('password_field').value)
    if (asdf === '' || fdsa === '') {
        document.getElementById('status_msg').innerHTML = "<font color='red'>Die Felder duerfen nicht leer sein!</font>"
    } else {
        chrome.runtime.sendMessage({cmd: "clear_badge"});
        document.getElementById('status_msg').innerHTML = ""
        chrome.storage.local.set({'asdf': asdf, 'fdsa': fdsa}, function() {
            document.getElementById("save_data").innerHTML='<font color="green">Gespeichert!</font>';
            document.getElementById("save_data").disabled=true;
        });
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

    //update saved clicks
    chrome.storage.local.get(['saved_click_counter'], (result) => {
        if (result.saved_click_counter === undefined) {result.saved_click_counter = 0}
        document.getElementById("saved_clicks").innerHTML = "<font color='green'>Du hast bisher <u>" + result.saved_click_counter + "</u> Klicks gespart!</font>"
    })
}
