function denyHostPermission(){
    alert("Okay, das ist schade. Trotzdem wird TUfast bei dir weiterhin Funktionieren. Gib uns doch einmal Feedback unter frage@tu-fast.de! ")
    chrome.runtime.sendMessage({ cmd: 'reload_extension' }, function (result) { })
    window.close()
}
function requestHostPermission(){
    chrome.storage.local.set({ gotInteractionOnHostPermissionExtension1: true }, function () { })
    chrome.permissions.request({
        origins: ["*://*.tu-dresden.de/*" , "*://*.slub-dresden.de/*"]
    }, function (granted) {
        if (granted) {
            alert("Perfekt! Bald gibts die neuen Funktionen! Diese Seite schliesst sich jetzt.")
            chrome.runtime.sendMessage({ cmd: 'reload_extension' }, function (result) { })
            window.close()
        } else {
            alert("Okay, das ist schade. Trotzdem wird TUfast bei dir weiter Funktionieren. Gib uns doch einmal Feedback unter frage@tu-fast.de! ")
            chrome.runtime.sendMessage({ cmd: 'reload_extension' }, function (result) { })
            window.close()
        }
    });
}

//this need to be done here since manifest v2
window.onload = function () {
    document.getElementById("refuseDomains").onclick = denyHostPermission
    document.getElementById("acceptDomains").onclick = requestHostPermission
}

