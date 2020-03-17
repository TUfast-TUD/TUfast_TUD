'use strict';

chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason

  switch (reason) {
     case 'install':
        //Show page on install
        console.log('TU Dresden Auto Login installed.')
        chrome.tabs.create({url : "popup.html"});
        break;
     case 'update':
        console.log('TU Dresden Auto Login updated.')
        break;
     default:
        console.log('Other install events within the browser for TU Dresden Auto Login.')
        break;
  }
})

//show badge when extension is triggered
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.cmd === 'show_badge'){
    chrome.browserAction.setBadgeText({text: "Login"});
    chrome.browserAction.setBadgeBackgroundColor({color: "#4cb749"});
    setTimeout(function() {
    	chrome.browserAction.setBadgeText({text: ""});
    }, request.timeout);
  }
  if(request.cmd === 'no_login_data'){
    alert("Bitte gib deinen Nutzernamen und Passwort in der TU Dresden Auto Login Extension an! Klicke dafür auf das Erweiterungssymbol oben rechts.")
  }
})

