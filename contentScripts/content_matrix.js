//Mainly contributed by Daniel: https://github.com/C0ntroller

function loginMatrix(){
    //check if already loked in.
    if(localStorage.getItem("mx_access_token")) {
        var hash = window.location.hash;
        //forward to home page, if already logged in
        if(hash === '#/login') {
            console.log("Already logged into matrix. Fwd to home page")
            chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
            //window.location.replace("https://matrix.tu-dresden.de/")
            window.location.hash = "#/home";
            location.reload()
        }
        return;        
    }
    chrome.runtime.sendMessage({cmd: 'get_user_data'}, function(result) {
        if (!(result.asdf === undefined  || result.fdsa === undefined)) {
            var url = 'https://matrix.tu-dresden.de/_matrix/client/r0/login';
            var params = '{"type":"m.login.password","password":"'+(result.fdsa)+'","identifier":{"type":"m.id.user","user":"'+(result.asdf)+'"},"initial_device_display_name":"Chrome Autologin"}';

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
        } else {
            chrome.runtime.sendMessage({cmd: "no_login_data"});
        }
    });
}

chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {var ctx = document.getElementById("matrixchat")
        ctx.addEventListener("DOMSubtreeModified", function(){
            this.removeEventListener("DOMSubtreeModified", arguments.callee);
            loginMatrix();
        });
    }
})