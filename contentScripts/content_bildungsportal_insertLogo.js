chrome.storage.local.get(['isEnabled', 'fwdEnabled', "saved_click_counter"], function (result) {
    if (result.isEnabled || result.fwdEnabled) {
        //if(result.saved_click_counter > 25) {
            //on load
            document.addEventListener("DOMNodeInserted", function(e) {
                if(!document.getElementById("TUFastLogo")) {insertLogo()} 
            })
            //on document changes
                window.addEventListener("load", function() {
                if(!document.getElementById("TUFastLogo")) {insertLogo()}
            }, true) 
        //}
    }
})

function insertLogo() {
    if(document.getElementsByClassName("page-header")[0] != undefined){
        let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
        let header = document.getElementsByClassName("page-header")[0]

        let logo_node = document.createElement("h1")
        let logo_link = document.createElement("a")
        let logo_img= document.createElement("img")

        logo_link.href = "https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk?hl=de"
        logo_link.title = "powered by TUFast. You're welcome."
        logo_img.style.display = "inline-block"
        logo_img.style.width = "35px"
        logo_img.src = imgUrl
        logo_node.id ="TUFastLogo"

        logo_link.appendChild(logo_img)
        logo_node.appendChild(logo_link)

        header.append(logo_node)
    }
}

