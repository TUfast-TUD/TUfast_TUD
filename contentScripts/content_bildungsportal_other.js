document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0]) {
        document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0].addEventListener('click', function () {
            chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOpal' })
        })
    }
})

chrome.storage.local.get(['isEnabled', "availableRockets", "removedUnlockRocketsBanner", "showedOpalCustomizeBanner", "unlockRocketsFirstPrompt", "saved_click_counter", "showedUnreadMailCounterBanner", "showedFirefoxBanner", "mostLiklySubmittedReview", "removedReviewBanner", "neverShowedReviewBanner", "showedKeyboardBanner2", "nameIsTUfast"], function (result) {
    //decide whether to show review banner
    let showReviewBanner = false
    let showKeyboardUpdate = false
    //let showImplementationForFirefox = false
    let showUnreadMailCounter = false
    let showUnlockRocketsFirstPrompt = false
    let showOpalCustomize = false
    let showUnlockRockets = false

    let mod200Clicks = result.saved_click_counter % 200
    let mod100Clicks = result.saved_click_counter % 100
    let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection

    //not shown right now
    //reviews only required in FF
    //if (isFirefox && !result.mostLiklySubmittedReview && mod200Clicks < 15 && !result.removedReviewBanner && result.saved_click_counter > 200) {
    //    showReviewBanner = true
    //}
    //if (mod200Clicks > 15) {
    //    chrome.storage.local.set({ removedReviewBanner: false }, function () { })
    //}
    //if (isFirefox && result.neverShowedReviewBanner && result.saved_click_counter > 300) {
    //    showReviewBanner = true
    //}


    //show implementationForFirefox not longer required
    //if (!showKeyboardUpdate && !showReviewBanner && !result.showedFirefoxBanner && result.saved_click_counter > 50) { 
    //    let isChrome = navigator.userAgent.includes("Chrome/")  //attention: no failsave browser detection | also for new edge!
    //    if(isChrome) showImplementationForFirefox = true
    //}

    if (result.saved_click_counter > 50 && !result.showedUnreadMailCounterBanner) {
        showUnreadMailCounter = true
    }
    else if (result.saved_click_counter > 100 && !result.showedKeyboardBanner2 ) {
        showKeyboardUpdate = true
    }
    else if (result.saved_click_counter > 150 && !result.showedOpalCustomizeBanner){
        showOpalCustomize = true
    }
    else if (result.saved_click_counter > 250 && !result.unlockRocketsFirstPrompt){
        showUnlockRocketsFirstPrompt = true
    }
    else if (result.saved_click_counter > 300 && result.unlockRocketsFirstPrompt && mod100Clicks < 7 && !result.removedUnlockRocketsBanner) {
        //dont show banner, if all rockets are already unlocked
        if(!result.availableRockets.includes("RI1") || !result.availableRockets.includes("RI2")) {
            showUnlockRockets = true
        }
    }

    //reset unlock rockets banner
    if (mod100Clicks > 7) {chrome.storage.local.set({ removedUnlockRocketsBanner: false }, function () { })}

    window.addEventListener("load", async function (e) {
        if (showReviewBanner) { showLeaveReviewBanner() }
        if (showKeyboardUpdate) { showKeyboardShortcutUpdate() }
        //if (showImplementationForFirefox) { showImplementationForFirefoxBanner() }
        if (showUnreadMailCounter) { showUnreadMailCounterBanner() }
        if (showUnlockRocketsFirstPrompt) { showUnlockRocketsFirstBanner() }
        if (showOpalCustomize) {showOpalCustomizeBanner()}
        if (showUnlockRockets) {showUnlockRocketsBanner()}

        if (this.document.getElementById("removeReviewBanner")) {
            this.document.getElementById("removeReviewBanner").onclick = removeReviewBanner
        }
        if (this.document.getElementById("webstoreLink")) {
            this.document.getElementById("webstoreLink").onclick = clickedWebstoreLink
        }
        if (this.document.getElementById("openKeyboardShortcutSettings")) {
            this.document.getElementById("openKeyboardShortcutSettings").onclick = openKeyboardShortcutSettings
        }
        if (this.document.getElementById("OpenOpalCustomizeSettings")) {
            this.document.getElementById("OpenOpalCustomizeSettings").onclick = openOpalCustomizeSettings
        }
        if (this.document.getElementById("removeKeyboardShortcutSettings")) {
            this.document.getElementById("removeKeyboardShortcutSettings").onclick = removeKeyboardShortcutSettings
        }
        if (this.document.getElementById("RemoveShowOpalCustomizeBanner")) {
            this.document.getElementById("RemoveShowOpalCustomizeBanner").onclick = removeOpenOpalCustomizeSettings
        }
        if (this.document.getElementById("removeNameBanner")) {
            this.document.getElementById("removeNameBanner").onclick = removeNameBanner
        }
        if (this.document.getElementById("RemoveShowImplementationForFirefoxBanner")) {
            this.document.getElementById("RemoveShowImplementationForFirefoxBanner").onclick = RemoveShowImplementationForFirefoxBanner
            this.document.getElementById("LinkShowImplementationForFirefoxBanner").onclick = RemoveShowImplementationForFirefoxBanner
        }
        if (this.document.getElementById("showUnreadMailCounterBanner")) {
            this.document.getElementById("OpenUnreadMailCounterSettings").onclick = openSettingsUnreadMail
            this.document.getElementById("RemoveShowUnreadMailCounterBanner").onclick = RemoveShowUnreadMailCounterBanner
        }
        if (this.document.getElementById("unlockRocketsFirstPrompt")) {
            this.document.getElementById("openMoreRocketIcons").onclick = openMoreRocketIconsSettingsFirstPrompt
        }
        if (this.document.getElementById("unlockRocketsPrompt")) {
            this.document.getElementById("openMoreRocketIcons").onclick = openMoreRocketIconsSettings
            this.document.getElementById("removeMoreRocketIcons").onclick = RemoveMoreRocketIcons
        }
    })
})

function RemoveMoreRocketIcons() {
    if (document.getElementById("unlockRocketsPrompt")) {
        document.getElementById("unlockRocketsPrompt").remove()
        chrome.storage.local.set({ removedUnlockRocketsBanner: true }, function () { })
    }
}

function showUnlockRocketsBanner(){
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "unlockRocketsPrompt"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<b>Empfehle <img src=' + imgUrl + ' style="position:relative; right: 2px;height: 33px;">TUfast</b> deinen Freunden und schalte <a id="openMoreRocketIcons" href="javascript:void(0)">coole neue Raketen</a> frei! 🔥🔥🔥 <a id="removeMoreRocketIcons" href="javascript:void(0)" style="position:absolute; right:10px; font-size:30; color: #888">Später</a>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function RemoveShowUnreadMailCounterBanner() {
    if (document.getElementById("showUnreadMailCounterBanner")) {
        document.getElementById("showUnreadMailCounterBanner").remove()
        chrome.storage.local.set({ showedUnreadMailCounterBanner: true }, function () { })
    }
}

function openSettingsUnreadMail() {
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: "mailFetchSettings" }, function (result) { })
    if (document.getElementById("showUnreadMailCounterBanner")) {
        document.getElementById("showUnreadMailCounterBanner").remove()
        chrome.storage.local.set({ showedUnreadMailCounterBanner: true }, function () { })
    }
}

function removeReviewBanner() {
    if (document.getElementById("reviewBanner")) {
        document.getElementById("reviewBanner").remove()
        chrome.storage.local.set({ removedReviewBanner: true }, function () { })
        chrome.storage.local.set({ neverShowedReviewBanner: false }, function () { })
    }
}

function RemoveShowImplementationForFirefoxBanner() {
    chrome.storage.local.set({ showedFirefoxBanner: true }, function () { })
    if (document.getElementById("showImplementationForFirefoxBanner")) {
        document.getElementById("showImplementationForFirefoxBanner").remove()
    }
}

function openKeyboardShortcutSettings() {
    if (document.getElementById("keyboardBanner")) {
        chrome.runtime.sendMessage({ cmd: 'open_shortcut_settings' }, function (result) { })
    }
}

function openMoreRocketIconsSettingsFirstPrompt() {
    if (document.getElementById("unlockRocketsFirstPrompt")) {
        chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: "rocket_icons_settings" }, function (result) { })
        document.getElementById("unlockRocketsFirstPrompt").remove()
        chrome.storage.local.set({ unlockRocketsFirstPrompt: true }, function () { })
    }
}

function openMoreRocketIconsSettings() {
    if (document.getElementById("unlockRocketsPrompt")) {
        chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: "rocket_icons_settings" }, function (result) { })
        document.getElementById("unlockRocketsPrompt").remove()
        chrome.storage.local.set({ removedUnlockRocketsBanner: true }, function () { })
    }
}

function openOpalCustomizeSettings() {
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: "opalCustomize" }, function (result) { })
    if (document.getElementById("showOpalCustomizeBanner")) {
        document.getElementById("showOpalCustomizeBanner").remove()
        chrome.storage.local.set({ showedOpalCustomizeBanner: true }, function () { })
    }
}

function removeKeyboardShortcutSettings() {
    chrome.storage.local.set({ showedKeyboardBanner2: true }, function () { })
    if (document.getElementById("keyboardBanner")) {
        document.getElementById("keyboardBanner").remove()
    }
}

function removeOpenOpalCustomizeSettings(){
    chrome.storage.local.set({ showedOpalCustomizeBanner: true }, function () { })
    if (document.getElementById("showOpalCustomizeBanner")) {
        document.getElementById("showOpalCustomizeBanner").remove()
    }
}

function removeNameBanner() {
    chrome.storage.local.set({ nameIsTUfast: true }, function () { })
    if (document.getElementById("nameBanner")) {
        document.getElementById("nameBanner").remove()
    }
}


function clickedWebstoreLink() {
    if (document.getElementById("reviewBanner")) {
        document.getElementById("reviewBanner").remove()
        chrome.storage.local.set({ mostLiklySubmittedReview: true }, function () { })
        chrome.storage.local.set({ neverShowedReviewBanner: false }, function () { })
    }
}

function showKeyboardShortcutUpdate() {
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "keyboardBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src=' + imgUrl + ' style="position:relative; right: 15px;height: 35px;"> <b>Supergeil: TUfast Shortcuts!</b> Öffne z.B. das Dashboard mit <strong>Alt+Q</strong><a id="openKeyboardShortcutSettings" href="javascript:void(0)" style="position:absolute; right:45px; font-size:22; color: #FF5252">Alle Shortcuts ansehen</a><a id="removeKeyboardShortcutSettings" href="javascript:void(0)" style="position:absolute; right:10px; font-size:30; color: #888">X</a>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function showUnlockRocketsFirstBanner() {
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "unlockRocketsFirstPrompt"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<b>Du findest <img src=' + imgUrl + ' style="position:relative; right: 2px;height: 33px;">TUfast cool?</b> Nimm dir kurz 1 Minute Zeit, unterstütze das TUfast-Projekt und schalte <a id="openMoreRocketIcons" href="javascript:void(0)">coole neue Raketen</a> frei! 🔥🔥🔥'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function showImplementationForFirefoxBanner() {
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "showImplementationForFirefoxBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src=' + imgUrl + ' style="position:relative; right: 15px;height: 35px;">Supergeil und Brandneu: <b>TUfast für <a href="https://addons.mozilla.org/de/firefox/addon/tufast/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search" id="LinkShowImplementationForFirefoxBanner" target="_blank">Firefox</a>! 🔥🔥🔥<a id="RemoveShowImplementationForFirefoxBanner" href="javascript:void(0)" style="position:absolute; right:10px; font-size:30; color: #888">Close X</a>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function showOpalCustomizeBanner(){
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "showOpalCustomizeBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = 'Mit <img src=' + imgUrl + ' style="position:relative; right: 4px;height: 33px;"><b>TUfast</b> kannst du OPAL <a id="OpenOpalCustomizeSettings" href="javascript:void(0)">Personalisieren und Verbessern.</a> Gleich ausprobieren! 🔥🔥🔥<a id="RemoveShowOpalCustomizeBanner" href="javascript:void(0)" style="position:absolute; right:10px; font-size:30; color: #888">Schließen X</a>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function showUnreadMailCounterBanner() {
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "showUnreadMailCounterBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src=' + imgUrl + ' style="position:relative; right: 15px;height: 35px;">Neu: mit TUfast verpasst du keine Mails aus deinem TU Dresden Postfach. <a id="OpenUnreadMailCounterSettings" href="javascript:void(0)">Jetzt probieren.<a id="RemoveShowUnreadMailCounterBanner" href="javascript:void(0)" style="position:absolute; right:10px; font-size:30; color: #888">Später</a>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function showLeaveReviewBanner() {
    //webstore link depends on browser!
    let isChrome = navigator.userAgent.includes("Chrome/")  //attention: no failsave browser detection | also for new edge!
    let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
    let webstoreLink = ""
    if (isChrome) { webstoreLink = "https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk?hl=de" }
    else if (isFirefox) { webstoreLink = "https://addons.mozilla.org/de/firefox/addon/tufast/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search" }
    else { webstoreLink = "https://www.tu-fast.de" }

    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id = "reviewBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src=' + imgUrl + ' style="position:absolute; top:8px;left: 25px;height: 40px;"> Dir gefällt <b>TUfast</b> &#11088;&#11088;&#11088;&#11088;&#11088; ? Hinterlasse uns eine Bewertung im <a id="webstoreLink" style="text-decoration-line:underline" target="_blank" href=' + webstoreLink + '>Webstore</a>!<a id="removeReviewBanner" href="javascript:void(0)" style="position:absolute; right:45px; font-size:22; color: #888">Nein, danke :(</span>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}