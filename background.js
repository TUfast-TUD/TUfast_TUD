'use strict';

chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason

  switch (reason) {
     case 'install':
        //Show page on install
        console.log('TU Dresden Auto Login installed.')
        chrome.tabs.create({url : "register_user.html"});
        chrome.storage.local.set({showed_50_clicks: false}, function() {});
        chrome.storage.local.set({showed_100_clicks: false}, function() {});
        chrome.storage.local.set({submitted_review: false}, function() {})
        break;
     case 'update':
        //Show page on update
        //chrome.tabs.create({ url: "update.html" });
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
    case 'perform_login':
      show_window()
      break
    case 'clear_badge':
      show_badge("", "#ffffff", 0)
      break
    case 'save_clicks':
      save_clicks(request.click_count)
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

function show_window(){
  //check whether feedback screen should be shown!
  var saved_clicks = 0
  chrome.storage.local.get(['saved_click_counter'], (result) => {
    saved_clicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter 
    if(saved_clicks > 50) {show_feedback_50_screen()}
    if(saved_clicks > 100) {show_feedback_100_screen()}
  })

}

function save_clicks(counter){
  //load number of saved clicks and add counter!
  var saved_clicks = 0;
  chrome.storage.local.get(['saved_click_counter'], (result) => {
    saved_clicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter 
    chrome.storage.local.set({saved_click_counter: saved_clicks + counter}, function() {
      console.log('You just saved yourself ' + counter + " clicks!")
    });
  })
}

function show_feedback_50_screen(){
  chrome.storage.local.get(['showed_50_clicks'], (result) => {
    if(!result.showed_50_clicks) {
      console.log('50 shown')
      chrome.tabs.create({ url: "reached_50_clicks.html" });
      chrome.storage.local.set({showed_50_clicks: true}, function() {});
    }
  })
  
}


function show_feedback_100_screen(){
  chrome.storage.local.get(['submitted_review', 'showed_100_clicks'], (result) => {
    //console.log(!result.showed_100_clicks)
    if(!result.showed_100_clicks || !result.submitted_review) {
      console.log('100 shown')
      chrome.tabs.create({ url: "reached_100_clicks.html" });
      chrome.storage.local.set({showed_100_clicks: true}, function() {});

    }
  })
}

