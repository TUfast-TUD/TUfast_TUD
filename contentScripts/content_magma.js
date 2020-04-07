document.addEventListener('DOMContentLoaded', function() {
    if($('button[name="loginButton"]') && $('select[name="wayfSelect"]')){
        console.log('Found')
        chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
            if (!(result.asdf === undefined  || result.fdsa === undefined)) { 
                chrome.runtime.sendMessage({cmd: "show_ok_badge", timeout: 2000})
                chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
                document.getElementsByName("wayfSelect")[0].value = "11"
                $('button[name="loginButton"]').click()
            } else {
              
            }
        });
    }
})
console.log('Auto Login to magma.')