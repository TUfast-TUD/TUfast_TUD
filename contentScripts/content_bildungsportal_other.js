document.addEventListener('DOMContentLoaded', function() {
    if(document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0]) {
        document.querySelectorAll('.btn.btn-sm[title="Abmelden"]')[0].addEventListener('click', function() {
            chrome.runtime.sendMessage({cmd:'logged_out', portal: 'loggedOutOpal'})
        })
    }
})

chrome.storage.local.get(['isEnabled', "saved_click_counter", "mostLiklySubmittedReview", "removedReviewBanner", "neverShowedReviewBanner"], function(result) {
    //decide whether to show review banner
    let showReviewBanner = false
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
    window.addEventListener("load", async function(e) {
        if(showReviewBanner) {showLeaveReviewBanner()}
        if (this.document.getElementById("removeReviewBanner")){
            this.document.getElementById("removeReviewBanner").onclick = removeReviewBanner
        }
        if (this.document.getElementById("webstoreLink")){
            this.document.getElementById("webstoreLink").onclick = clickedWebstoreLink
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

function clickedWebstoreLink() {
    if(document.getElementById("reviewBanner")){
        document.getElementById("reviewBanner").remove()
        chrome.storage.local.set({mostLiklySubmittedReview: true}, function() {})
        chrome.storage.local.set({neverShowedReviewBanner: false}, function() {})
    }
}

function showLeaveReviewBanner(){
    let imgUrl = chrome.runtime.getURL("../images/autologin48.png")
    let banner = this.document.createElement("div")
    banner.id ="reviewBanner"
    banner.style = "font-size:22px; height:55px; line-height:55px;text-align:center"
    banner.innerHTML = '<img src='+imgUrl+' style="position:absolute; top:8px;left: 25px;height: 40px;"> Dir gefällt TUDresdenAutoLogin &#11088;&#11088;&#11088;&#11088;&#11088; ? Hinterlasse mir eine Bewertung im <a id="webstoreLink" style="text-decoration-line:underline" target="_blank" href="https://chrome.google.com/webstore/detail/tu-dresden-auto-login/aheogihliekaafikeepfjngfegbnimbk?hl=de">Webstore</a>!<a id="removeReviewBanner" href="javascript:void(0)" style="position:absolute; right:45px; font-size:22; color: #888">Nein, danke :(</span>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}
