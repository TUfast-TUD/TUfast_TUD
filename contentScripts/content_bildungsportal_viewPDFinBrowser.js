chrome.storage.local.get(['PDFViewerIsEnabled'], function (result) {
    //if (result.PDFViewerIsEnabled) {
        //on load
        document.addEventListener("DOMNodeInserted", function (e) {
           modifyPdfLinks()
        })
        //on document changes
        window.addEventListener("load", function () {
            modifyPdfLinks()
        }, true)
    //}
})

function modifyPdfLinks() {
    //Modify js so that link is opened in new tab
    let links = document.getElementsByTagName("a")
    for (let idx=0;idx<links.length;idx++){
        if(links[idx].href.includes(".pdf")){
            links[idx].setAttribute("onclick", "window.open(this.href, '_blank'); return false;")
        }
    }
    
}

