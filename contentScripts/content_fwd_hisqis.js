chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        console.log("fwd to hisqis")
        chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})    
        window.location.replace("https://qis.dez.tu-dresden.de/qisserver/servlet/de.his.servlet.RequestDispatcherServlet?state=template&template=user/news")
    }
})