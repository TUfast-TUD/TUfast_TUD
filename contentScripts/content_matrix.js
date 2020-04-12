function loginMatrix(){
    chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
        if(localStorage.getItem("mx_access_token")) {
            return;        
        }

        if (!(result.asdf === undefined  || result.fdsa === undefined)) {
            var url = 'https://matrix.tu-dresden.de/_matrix/client/r0/login';
            var params = '{"type":"m.login.password","password":"'+atob(result.fdsa)+'","identifier":{"type":"m.id.user","user":"'+atob(result.asdf)+'"},"initial_device_display_name":"Chrome Autologin"}';

            var http = new XMLHttpRequest();
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            http.setRequestHeader('authority', 'matrix.tu-dresden.de');
            http.setRequestHeader('accept', 'application/json');
            http.setRequestHeader('content-type', 'application/json');

            http.onreadystatechange = function() {
                if(http.readyState == 4 && http.status == 200) {
                    chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                    chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                    console.log('Auto Login to matrix')
                    
                    response = JSON.parse(http.responseText);
                    localStorage.setItem("mx_hs_url", "https://matrix.tu-dresden.de/");
                    localStorage.setItem("mx_is_url", "https://matrix.tu-dresden.de/");
                    localStorage.setItem("mx_device_id", response.device_id);
                    localStorage.setItem("mx_user_id", response.user_id);
                    localStorage.setItem("mx_access_token", response.access_token);
                    localStorage.setItem("mx_is_guest", "false");
                    
                    window.location.replace("https://matrix.tu-dresden.de/")
                }
            }
            http.send(params); 
        }
    });
}

var ctx = document.getElementById("matrixchat")
ctx.addEventListener("DOMSubtreeModified", function(){
    this.removeEventListener("DOMSubtreeModified", arguments.callee);
    loginMatrix();
});