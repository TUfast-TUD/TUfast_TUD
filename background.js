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
  switch (request.cmd) {
    case 'show_ok_badge':
      show_badge('Login', '#4cb749', request.timeout)
      break
    case 'no_login_data':
      alert("Bitte gib deinen Nutzernamen und Passwort in der TU Dresden Auto Login Extension an! Klicke dafür auf das Erweiterungssymbol oben rechts.")
      show_badge("Error", '#ff0000', 10000)
      break
    case 'clear_badge':
      show_badge("", "#ffffff", 0)
      break
    default:
      console.log('Cmd not found!')
      break
 }
})

function show_badge(Text, Color, timeout) {
  chrome.browserAction.setBadgeText({text: Text});
  chrome.browserAction.setBadgeBackgroundColor({color: Color});
  setTimeout(function() {
    chrome.browserAction.setBadgeText({text: ""});
  }, timeout);
}

