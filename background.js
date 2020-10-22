'use strict';

////////Code to run when extension is loaded
console.log('Loaded TUfast')
chrome.storage.local.set({loggedOutSelma: false}, function() {})
chrome.storage.local.set({loggedOutQis: false}, function() {})
chrome.storage.local.set({loggedOutOpal: false}, function() {})
chrome.storage.local.set({loggedOutOwa: false}, function() {})
chrome.storage.local.set({loggedOutMagma: false}, function() {})
chrome.storage.local.set({loggedOutJexam: false}, function() {})
chrome.storage.local.set({loggedOutCloudstore: false}, function() {})
chrome.storage.local.set({openSettingsPageParam: false}, function() {})

chrome.runtime.onInstalled.addListener(async(details) => {
  const reason = details.reason
  switch (reason) {
     case 'install':
        //Show page on install
        console.log('TUfast installed.')
        openSettingsPage("first_visit")
        chrome.storage.local.set({showed_50_clicks: false}, function() {});
        chrome.storage.local.set({showed_100_clicks: false}, function() {});
        chrome.storage.local.set({isEnabled: false}, function() {})
        chrome.storage.local.set({fwdEnabled: true}, function() {})
        chrome.storage.local.set({mostLiklySubmittedReview: false}, function() {})
        chrome.storage.local.set({removedReviewBanner: false}, function() {})
        chrome.storage.local.set({neverShowedReviewBanner: true}, function() {})
        chrome.storage.local.set({encryption_level: 2}, function() {})
        chrome.storage.local.set({meine_kurse: false}, function() {})
        chrome.storage.local.set({favoriten: false}, function() {})
        //chrome.storage.local.set({openSettingsPageParam: false}, function() {})
        chrome.storage.local.set({seenInOpalAfterDashbaordUpdate: 0}, function() {})
        chrome.storage.local.set({dashboardDisplay: "favoriten"}, function() {})
        chrome.storage.local.set({removedOpalBanner: false}, function() {})
        chrome.storage.local.set({nameIsTUfast: true}, function() {})
        break;
     case 'update':
        //Show page on update
        //chrome.storage.local.set({isEnabled: true}, function() {})
        //chrome.storage.local.set({fwdEnabled: true}, function() {})
        //check if encryption is already on level 2
        chrome.storage.local.get(['encryption_level'], (resp) => {
          if(!(resp.encryption_level === 2)){
            console.log('Upgrading encryption standard to level 2...')
            chrome.storage.local.get(['asdf', 'fdsa'], function(result) {
              setUserData({asdf: atob(result.asdf), fdsa: atob(result.fdsa)})
              chrome.storage.local.set({encryption_level: 2}, function() {})
            })
          }
        })
        //check if dashboard display is selected
        chrome.storage.local.get(['dashboardDisplay'], (resp) => {
          if(resp.dashboardDisplay === null || resp.dashboardDisplay === undefined || resp.dashboardDisplay === ""){
            chrome.storage.local.set({dashboardDisplay: "favoriten"}, function() {})
          }
        })
        //check if mostLiklySubmittedReview
        chrome.storage.local.get(['mostLiklySubmittedReview'], (resp) => {
          if(resp.mostLiklySubmittedReview === null || resp.mostLiklySubmittedReview === undefined || resp.mostLiklySubmittedReview === ""){
            chrome.storage.local.set({mostLiklySubmittedReview: false}, function() {})
          }
        })
        //check if removedReviewBanner
        chrome.storage.local.get(['removedReviewBanner'], (resp) => {
          if(resp.removedReviewBanner === null || resp.removedReviewBanner === undefined || resp.removedReviewBanner === ""){
            chrome.storage.local.set({removedReviewBanner: false}, function() {})
          }
        })
        //check if neverShowedReviewBanner
        chrome.storage.local.get(['neverShowedReviewBanner'], (resp) => {
          if(resp.neverShowedReviewBanner === null || resp.neverShowedReviewBanner === undefined || resp.neverShowedReviewBanner === ""){
            chrome.storage.local.set({neverShowedReviewBanner: true}, function() {})
          }
        })
        //check if seenInOpalAfterDashbaordUpdate exists
        chrome.storage.local.get(['seenInOpalAfterDashbaordUpdate'], (resp) => {
          if(resp.seenInOpalAfterDashbaordUpdate === null || resp.seenInOpalAfterDashbaordUpdate === undefined || resp.seenInOpalAfterDashbaordUpdate === ""){
            chrome.storage.local.set({seenInOpalAfterDashbaordUpdate: 0}, function() {})
          }
        })
        fetchOWA("username", "password")
        break;
     default:
        console.log('Other install events within the browser for TUfast.')
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
      //alert("Bitte gib deinen Nutzernamen und Passwort in der TUfast Erweiterung an! Klicke dafür auf das Erweiterungssymbol oben rechts.")
      //show_badge("Error", '#ff0000', 10000)
      break
    case 'perform_login':
      break
    case 'clear_badge':
      show_badge("", "#ffffff", 0)
      break
    case 'save_clicks':
      save_clicks(request.click_count)
      break
    case 'get_user_data':
      getUserData().then((userData) => sendResponse(userData))
      break
    case 'set_user_data':
      setUserData(request.userData)
      break
    case 'logged_out':
      loggedOut(request.portal)
      break
    case 'save_courses':
      saveCourses(request.course_list)
      break
    case 'open_settings_page':
      openSettingsPage(request.params)
      break
    case 'open_shortcut_settings':
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
    default:
      console.log('Cmd not found!')
      break
  }
  return true //required for async sendResponse

})

//register hotkeys
chrome.commands.onCommand.addListener(function(command) {
  console.log('Detected command: ' + command )
  switch(command) {
    case 'open_opal_hotkey':
      chrome.tabs.update({ url: "https://bildungsportal.sachsen.de/opal/home/" })
      save_clicks(2)
      break
    case 'open_owa_hotkey':
      save_clicks(2)
      chrome.tabs.update({ url: "https://msx.tu-dresden.de/owa/" })
      break
    case 'open_jexam_hotkey':
      chrome.tabs.update({url: "https://jexam.inf.tu-dresden.de/"})
      save_clicks(2)
    default:
      break
  }
})

//open settings (=options) page, if required set params
function openSettingsPage(params){
  if(params){
    chrome.storage.local.set({openSettingsPageParam: params}, function() {
      chrome.runtime.openOptionsPage()
    })
  } else {
    chrome.runtime.openOptionsPage()
  } 
  return
}

//timeout is 2000 default
function loggedOut(portal) {
  let timeout = 2000
  if(portal === "loggedOutCloudstore") {timeout = 7000}
  let loggedOutPortal = {}
  loggedOutPortal[portal] = true
  chrome.storage.local.set(loggedOutPortal, function() {});
  setTimeout(function() {
    loggedOutPortal[portal] = false
    chrome.storage.local.set(loggedOutPortal, function() {});
  }, timeout);
}

function show_badge(Text, Color, timeout) {
  chrome.browserAction.setBadgeText({text: Text});
  chrome.browserAction.setBadgeBackgroundColor({color: Color});
  setTimeout(function() {
    chrome.browserAction.setBadgeText({text: ""});
  }, timeout);
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

function hashDigest(string) {
  return new Promise (async (resolve, reject) => {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(string))
    resolve(hashBuffer)
  })
} 

function getKeyBuffer(){
  return new Promise((resolve, reject) => {
    let sysInfo = ""
    chrome.system.cpu.getInfo(info => {
      //TROUBLE if api changes!
      delete info['processors']
      delete info['temperatures']
      sysInfo = sysInfo + JSON.stringify(info)
      chrome.runtime.getPlatformInfo(async (info) => {
        sysInfo = sysInfo + JSON.stringify(info)
        let keyBuffer = await crypto.subtle.importKey('raw' , await hashDigest(sysInfo), 
                                                      {name: "AES-CBC",}, 
                                                      false, 
                                                      ['encrypt', 'decrypt']) 
        resolve(keyBuffer)       
      })
    })
  })
}

async function setUserData(userData) {
  let userDataConcat = userData.asdf + '@@@@@' + userData.fdsa
  let encoder = new TextEncoder()
  let userDataEncoded =  encoder.encode(userDataConcat)
  let keyBuffer = await getKeyBuffer()
  let iv = crypto.getRandomValues(new Uint8Array(16))
  let userDataEncrypted =  await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv
    },
    keyBuffer,
    userDataEncoded
  )
  userDataEncrypted = Array.from(new Uint8Array(userDataEncrypted))                             
  userDataEncrypted = userDataEncrypted.map(byte => String.fromCharCode(byte)).join('')           
  userDataEncrypted = btoa(userDataEncrypted)
  iv = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
  chrome.storage.local.set({Data: iv + userDataEncrypted}, function() {})
}

//return {asdf: "", fdsa: ""}
async function getUserData(){
  return new Promise(async (resolve, reject) => {
      let keyBuffer = await getKeyBuffer()
      chrome.storage.local.get(['Data'], async (Data) => {
        //check if Data exists, else return
        if(Data.Data === undefined || Data.Data === "undefined" || Data.Data === null) {
          resolve({asdf: undefined, fdsa: undefined})
          return
        }
        let iv = await Data.Data.slice(0,32).match(/.{2}/g).map(byte => parseInt(byte, 16)) 
        iv = new Uint8Array(iv)
        let userDataEncrypted = atob(Data.Data.slice(32))                                       
        userDataEncrypted = new Uint8Array(userDataEncrypted.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))
        let UserData =  await crypto.subtle.decrypt(
          {
            name: "AES-CBC",
            iv: iv
          },
          keyBuffer,
          userDataEncrypted
        )
        UserData = new TextDecoder().decode(UserData)
        UserData = UserData.split("@@@@@")
        resolve({asdf: UserData[0], fdsa: UserData[1]})
      })  
    })
}
//course_list = {type:"", list:[{link:link, name: name}, ...]}
function saveCourses(course_list) {
  course_list.list.sort((a, b) => (a.name > b.name) ? 1 : -1)
  switch (course_list.type) {
    case 'favoriten':
      chrome.storage.local.set({favoriten: JSON.stringify(course_list.list)}, function() {})
      console.log('saved Favoriten in TUfast')
      break
    case 'meine_kurse':
      chrome.storage.local.set({meine_kurse: JSON.stringify(course_list.list)}, function() {})
      console.log('saved Meine Kurse in TUfast')
      break
    default:
      break
  }
}

//return course_list = [{link:link, name: name}, ...]
function loadCourses(type) {
  switch(type) {
      case "favoriten":
          chrome.storage.local.get(['favoriten'], function(result) {
              console.log(JSON.parse(result.favoriten))
          })
          break
      case "meine_kurse":
          chrome.storage.local.get(['meine_kurse'], function(result) {
              console.log(JSON.parse(result.meine_kurse))
          })
          break
      default:
          break
  }
}

//function to log msx.tu-dresden.de/owa/ and retrieve the .json containing information about EMails
function fetchOWA(username, password) {
  
  //TODO Decode username, password
  username=""
  password=encodeURI("")

  //login
  fetch("https://msx.tu-dresden.de/owa/auth.owa", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "referrer": "https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa%2f%23authRedirect%3dtrue",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "destination=https%3A%2F%2Fmsx.tu-dresden.de%2Fowa%2F%23authRedirect%3Dtrue&flags=4&forcedownlevel=0&username="+username+"%40msx.tu-dresden.de&password="+password+"&passwordText=&isUtf8=1",
    "method": "POST",
    "mode": "no-cors",
    "credentials": "include"
  })
  .then(()=>{
    //get clientID and correlationID
    fetch("https://msx.tu-dresden.de/owa/", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
        "cache-control": "max-age=0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      "referrer": "https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    })
    //extract x-owa-correlationid. correlation id is
    .then(resp => resp.text()).then(respText => {
      let temp = respText.split("window.clientId = '")[1]
      let clientId = temp.split("'")[0]
      let corrId = clientId + "_" + (new Date()).getTime()
      console.log("corrID: " + corrId)
    })
    //getConversations
    .then(corrId => {
      fetch("https://msx.tu-dresden.de/owa/sessiondata.ashx?appcacheclient=0", {
        "headers": {
          "accept": "*/*",
          "accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-owa-correlationid": corrId,
          "x-owa-smimeinstalled": "1"
        },
        "referrer": "https://msx.tu-dresden.de/owa/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      })
      .then(r => r.text()).then(z => console.log(z))
      //logout
      .then(()=>{
        fetch("https://msx.tu-dresden.de/owa/logoff.owa", {
          "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
          },
          "referrer": "https://msx.tu-dresden.de/owa/",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
        })
      })
    }) 
  })

}
