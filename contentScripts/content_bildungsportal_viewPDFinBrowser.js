chrome.storage.local.get(["pdfInNewTab"], function (result) {
    if (result.pdfInNewTab) {
        //on load
        document.addEventListener("DOMNodeInserted", function (e) {
            modifyPdfLinks();
        });
        //on document changes
        window.addEventListener(
            "load",
            function () {
                modifyPdfLinks();
            },
            true
        );
    }
});

function modifyPdfLinks() {
    //Modify js so that link is opened in new tab
    let links = document.getElementsByTagName("a");
    for (let idx = 0; idx < links.length; idx++) {
        if (links[idx].href.includes(".pdf")) {
            links[idx].onclick = function (event) {
                event.stopImmediatePropagation(); //prevents OPAL to load in the same tab
                window.open(this.href, "_blank");
                return false;
            };
        }
    }
}
