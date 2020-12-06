document.addEventListener('DOMContentLoaded', function() {
    if(document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0]) {
        document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0].addEventListener('click', function() {
            chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutOpal'})
        })
    }
})

chrome.storage.local.get(['isEnabled', "saved_click_counter", "mostLiklySubmittedReview", "removedReviewBanner", "neverShowedReviewBanner", "showedKeyboardBanner2", "nameIsTUfast"], function(result) {
    //decide whether to show review banner
    let showReviewBanner = false
    let showKeyboardUpdate = false
    let mod200Clicks = result.saved_click_counter%200
    if(!result.mostLiklySubmittedReview && mod200Clicks<15 && !result.removedReviewBanner && result.saved_click_counter > 200){
        showReviewBanner = true
    }
    if(mod200Clicks > 15){
        chrome.storage.local.set({removedReviewBanner: false}, function() {})
    }
    if(result.neverShowedReviewBanner && result.saved_click_counter > 200){
        showReviewBanner = true
    }

    if(result.saved_click_counter > 100 && !showReviewBanner && (result.showedKeyboardBanner2 === false || result.showedKeyboardBanner2 === undefined || result.showedKeyboardBanner2 === null || result.showedKeyboardBanner2 === "")){
        showKeyboardUpdate = true
    }

    window.addEventListener("load", async function(e) {
        if(showReviewBanner) {showLeaveReviewBanner()}
        if(showKeyboardUpdate) {showKeyboardShortcutUpdate()}

        if (this.document.getElementById("removeReviewBanner")){
            this.document.getElementById("removeReviewBanner").onclick = removeReviewBanner
        }
        if (this.document.getElementById("webstoreLink")){
            this.document.getElementById("webstoreLink").onclick = clickedWebstoreLink
        }
        if(this.document.getElementById("openKeyboardShortcutSettings")){
            this.document.getElementById("openKeyboardShortcutSettings").onclick = openKeyboardShortcutSettings
        }
        if(this.document.getElementById("removeKeyboardShortcutSettings")){
            this.document.getElementById("removeKeyboardShortcutSettings").onclick = removeKeyboardShortcutSettings
        }
        if(this.document.getElementById("removeNameBanner")){
            this.document.getElementById("removeNameBanner").onclick = removeNameBanner
        }
    })
})

function removeReviewBanner() {
    if(document.getElementById("reviewBanner")){
        document.getElementById("reviewBanner").remove()
        chrome.storage.local.set({removedReviewBanner: true}, function() {})
        chrome.storage.local.set({neverShowedReviewBanner: false}, function() {})
    }
}

function openKeyboardShortcutSettings() {
    if(document.getElementById("keyboardBanner")){
        chrome.runtime.sendMessage({cmd: 'open_shortcut_settings'}, function(result) {})
    }
}

function removeKeyboardShortcutSettings() {
    chrome.storage.local.set({showedKeyboardBanner2: true}, function() {})
    if(document.getElementById("keyboardBanner")){
        document.getElementById("keyboardBanner").remove()
    }
}

function removeNameBanner() {
    chrome.storage.local.set({nameIsTUfast: true}, function() {})
    if(document.getElementById("nameBanner")){
        document.getElementById("nameBanner").remove()
    }
}


function clickedWebstoreLink() {
    if(document.getElementById("reviewBanner")){
        document.getElementById("reviewBanner").remove()
        chrome.storage.local.set({mostLiklySubmittedReview: true}, function() {})
        chrome.storage.local.set({neverShowedReviewBanner: false}, function() {})
    }
}

function showKeyboardShortcutUpdate(){
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id ="keyboardBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src='+imgUrl+' style="position:relative; right: 15px;height: 35px;"> <b>Neu von TUfast: Shortcuts.</b> Öffne das Dashboard mit <strong>Alt+Q</strong><a id="openKeyboardShortcutSettings" href="javascript:void(0)" style="position:absolute; right:45px; font-size:22; color: #FF5252">Hier Shortcuts aktivieren</a><a id="removeKeyboardShortcutSettings" href="javascript:void(0)" style="position:absolute; right:10px; font-size:30; color: #888">X</a>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function showLeaveReviewBanner(){
    let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
    let banner = this.document.createElement("div")
    banner.id ="reviewBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src=' + imgUrl +' style="position:absolute; top:8px;left: 25px;height: 40px;"> Dir gefällt <b>TUfast</b> &#11088;&#11088;&#11088;&#11088;&#11088; ? Hinterlasse mir eine Bewertung im <a id="webstoreLink" style="text-decoration-line:underline" target="_blank" href="https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk?hl=de">Webstore</a>!<a id="removeReviewBanner" href="javascript:void(0)" style="position:absolute; right:45px; font-size:22; color: #888">Nein, danke :(</span>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}