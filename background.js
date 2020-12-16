'use strict';

////////Code to run when extension is loaded
console.log('Loaded TUfast')
chrome.storage.local.set({loggedOutSelma: false}, function() {})
chrome.storage.local.set({loggedOutTumed: false}, function() {})
chrome.storage.local.set({loggedOutQis: false}, function() {})
chrome.storage.local.set({loggedOutOpal: false}, function() {})
chrome.storage.local.set({loggedOutOwa: false}, function() {})
chrome.storage.local.set({loggedOutMagma: false}, function() {})
chrome.storage.local.set({loggedOutJexam: false}, function() {})
chrome.storage.local.set({loggedOutCloudstore: false}, function() {})
chrome.storage.local.set({openSettingsPageParam: false}, function() {})


//additional content script injection CHROME
try {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    // create rule
    var ruleTUMED = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'eportal.med.tu-dresden.de', schemes: ['https'] }
        })
      ],
      actions: [new chrome.declarativeContent.RequestContentScript({ js: ["contentScripts/content_tumed.js"] })]
    }
    // register rule
    chrome.declarativeContent.onPageChanged.addRules([ruleTUMED]);
  })
} catch(e) {console.log("Error requesting additional content script for Chrome: " + e)}

//additional content script injection FF
try {
  browser.contentScripts.register({
    "js": [{file: "contentScripts/content_tumed.js"}],
    "matches": ["https://eportal.med.tu-dresden.de/*"],
    "runAt": "document_start"
  })
} catch (e) { console.log("Error requesting additional content script for FF: " + e) }

//check whether to ask for additional host permission
chrome.storage.local.get(['gotInteractionOnHostPermissionExtension1', "installed", "saved_click_counter"], function (result) {
  if (!result.gotInteractionOnHostPermissionExtension1 && result.installed && result.saved_click_counter > 10) {
    chrome.tabs.create(({ url: "updatePermissions.html" }))
  }
})

chrome.runtime.onInstalled.addListener(async(details) => {
  const reason = details.reason
  switch (reason) {
     case 'install':
        //Show page on install
        console.log('TUfast installed.')
        openSettingsPage("first_visit")
        chrome.storage.local.set({installed: true }, function () { });
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
        chrome.storage.local.set({ colorfulRocket: "black" }, function () { })
        chrome.storage.local.set({ PRObadge: false }, function () { })
        chrome.storage.local.set({flakeState: false}, function() {})
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
        //flakeState
        chrome.storage.local.get(['flakeState'], function (result) {
          if (result.flakeState === undefined || result.flakeState === null) { //set to true, so that state will be false!
            chrome.storage.local.set({ flakeState: false }, function () { })
          }
        })
        //firefox banner
        chrome.storage.local.get(['showedFirefoxBanner'], function (result) {
          if (result.showedFirefoxBanner === undefined || result.showedFirefoxBanner === null) {
            chrome.storage.local.set({ showedFirefoxBanner: false }, function () { })
          }
        })
        break;
     default:
        console.log('Other install events within the browser for TUfast.')
        break;
  }
})

//show badge when extension is triggered
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
    case 'reload_extension':
      chrome.runtime.reload()
      break
    case 'save_courses':
      saveCourses(request.course_list)
      break
    case 'open_settings_page':
      openSettingsPage(request.params)
      break
    case 'open_shortcut_settings':
      let isChrome = navigator.userAgent.includes("Chrome/")  //attention: no failsave browser detection | also for new edge!
      let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
      if (isFirefox) {chrome.tabs.create({ url: "https://support.mozilla.org/de/kb/tastenkombinationen-fur-erweiterungen-verwalten" })}
      else {chrome.tabs.create({ url: "chrome://extensions/shortcuts" })} //for chrome and everything else
      
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

//create hash from input-string (can also be json ofcourse)
//output hash is always of same length and is of type buffer
function hashDigest(string) {
  return new Promise (async (resolve, reject) => {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(string))
    resolve(hashBuffer)
  })
} 

//get key for encryption (format: buffer)
function getKeyBuffer(){
  return new Promise((resolve, reject) => {
    let sysInfo = ""
    let isChrome = navigator.userAgent.includes("Chrome/")  //attention: no failsave browser detection | also for new edge!
    let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
    
    //key differs between browsers, because different APIs
    if (isFirefox) {
      sysInfo = sysInfo + window.navigator.hardwareConcurrency
      chrome.runtime.getPlatformInfo(async (info) => {
        sysInfo = sysInfo + JSON.stringify(info)
        //create key
        let keyBuffer = await crypto.subtle.importKey('raw' , await hashDigest(sysInfo), 
                                                      {name: "AES-CBC",}, 
                                                      false, 
                                                      ['encrypt', 'decrypt']) 
        resolve(keyBuffer)       
      })
    //chrome, edge and everything else
    } else {
      chrome.system.cpu.getInfo(info => {
        delete info['processors']
        delete info['temperatures']
        sysInfo = sysInfo + JSON.stringify(info)
        chrome.runtime.getPlatformInfo(async (info) => {
          sysInfo = sysInfo + JSON.stringify(info)
          //create key
          let keyBuffer = await crypto.subtle.importKey('raw' , await hashDigest(sysInfo), 
                                                        {name: "AES-CBC",}, 
                                                        false, 
                                                        ['encrypt', 'decrypt']) 
          resolve(keyBuffer)       
        })
      })
    }
  })
}

//this functions saved user login-data locally. 
//user data is encrypted using the crpyto-js library (aes-cbc). The encryption key is created from pc-information with system.cpu
//a lot of encoding and transforming needs to be done, in order to provide all values in the right format.
async function setUserData(userData) {
  //collect all required information for encryption in the right format
  let userDataConcat = userData.asdf + '@@@@@' + userData.fdsa
  let encoder = new TextEncoder()
  let userDataEncoded =  encoder.encode(userDataConcat)
  let keyBuffer = await getKeyBuffer()
  let iv = crypto.getRandomValues(new Uint8Array(16))
  
  //encrypt
  let userDataEncrypted =  await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv
    },
    keyBuffer,
    userDataEncoded
  )
  
  //adjust format to save encrypted data in lokal storage
  userDataEncrypted = Array.from(new Uint8Array(userDataEncrypted))                             
  userDataEncrypted = userDataEncrypted.map(byte => String.fromCharCode(byte)).join('')           
  userDataEncrypted = btoa(userDataEncrypted)
  iv = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
  chrome.storage.local.set({Data: iv + userDataEncrypted}, function() {})
}

//return {asdf: "", fdsa: ""}
//decrypt and return user data
//a lot of encoding and transforming needs to be done, in order to provide all values in the right format
async function getUserData(){
  return new Promise(async (resolve, reject) => {
      //get required data for decryption
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
        
        //decrypt
        let UserData =  await crypto.subtle.decrypt(
          {
            name: "AES-CBC",
            iv: iv
          },
          keyBuffer,
          userDataEncrypted
        )
        
        //adjust to useable format
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
