chrome.storage.local.get(['PDFViewerIsEnabled'], function (result) {
    if (result.PDFViewerIsEnabled) {
        //on load
        document.addEventListener("DOMNodeInserted", function (e) {
           modifyPdfLinks()
        })
        //on document changes
        window.addEventListener("load", function () {
            modifyPdfLinks()
        }, true)
    }
})

function modifyPdfLinks() {
//Problem: cannot open link in new tab :/
    /*let links = document.getElementsByTagName("a")
for (let idx=0;idx<links.length;idx++){
  if(links[idx].href.includes(".pdf")){
    links[idx].setAttribute("target", "_new")
}
}*/
    
}

