chrome.storage.local.get(['isEnabled',], function(result) {
    if(result.isEnabled) {
        document.addEventListener("DOMContentLoaded", async function(e) {
            loadAllCourses()

            let oldId = document.getElementsByClassName("pager-showall")[0].getAttribute("id")
            let oldPath = location.pathname

            //listen for new ID with mutation observer and urlPath-change --> course list was reloaded
            const config = { attributes: true, childList: true, subtree: true };
            const callback = function(mutationsList, observer) {
                if (oldPath != location.pathname) {
                    oldPath = location.pathname
                    location.pathname = oldPath
                } 
                if(document.getElementsByClassName("pager-showall")[0].getAttribute("id") != oldId) {
                    oldId = document.getElementsByClassName("pager-showall")[0].getAttribute("id")
                    loadAllCourses()
                }   
            }
            const observer = new MutationObserver(callback);
            observer.observe(document.body, config);
        })
        /*document.addEventListener("click", async function(){
            //Path needs to be updated - dont know why - but else it doesnt work
            //on new path --> page is reloaded
            let oldPath = location.pathname
            setInterval(async function(){ 
                if (oldPath != location.pathname) {
                    oldPath = location.pathname
                    location.pathname = oldPath
                    await new Promise(r => setTimeout(r, 10)) //to be sure
                    loadAllCourses()
                    return
                } 
            }, 10);
        })*/
    }
})

//Not working yet - but also not necessary
/*function parseCoursesFromXMLRequest(XMLString){
    //Directly parse courses from xmlHttpRequest
    
    //Need to remove CDATA-Tag
    XMLString = XMLString.replace("<![CDATA[", "").replace("]]>", "")
    let parser = new DOMParser()
    let XML = parser.parseFromString(XMLString,"text/xml")

    //for favorites: XML starts before <tbody> but after class="table-panel"
    //for courses: XML starts at class="list-unstyled"
    try {
        //most likely for favorits
        let tableEntries = XML.getElementsByTagName("tbody")[0].children
        for (let item of tableEntries) {
            let title = item.children[2].children[0].getAttribute("title")
            let link = item.children[2].children[0].getAttribute("href")
            console.log( title + " " + link)
        }
    } catch {
        //most likely for courses
        let tableEntries = XML.getElementsByClassName("list-unstyled")[0].getElementsByClassName("content-preview content-preview-horizontal")
        for (let item of tableEntries) {
            let title = item.getElementsByClassName("content-preview-title")[0].innerHTML
            let link = item.children[3].getAttribute("href")
            console.log(title + " " +link)
        }
    }
}*/

function parseCoursesFromWebPage(){
    //there are two options how the table can be build.
    try {
        //most likely for favorits
        let tableEntries = document.getElementsByClassName("table-panel")[0].getElementsByTagName("tbody")[0].children
        for (let item of tableEntries) {
            let title = item.children[2].children[0].getAttribute("title")
            let link = item.children[2].children[0].getAttribute("href")
            console.log( title + " " + link)
        }
    }catch {
        //most likely for courses
        let tableEntries = document.getElementsByClassName("table-panel")[0].getElementsByClassName("content-preview-container")[0].getElementsByClassName("list-unstyled")[0].getElementsByClassName("content-preview content-preview-horizontal")
        for (let item of tableEntries) {
            let title = item.getElementsByClassName("content-preview-title")[0].innerHTML
            let link = item.children[3].getAttribute("href")
            console.log(title + " " +link)
        }
    }
}

function loadAllCourses() {
    if(document.getElementsByClassName("pager-showall")[0].innerText === "alle anzeigen") {
        console.log('loading all courses...')
        let opalBaseLink = "https://bildungsportal.sachsen.de"
        let head = document.getElementsByTagName('head')[0].innerHTML //get ajax xmlHTTPRequest Url
        let pagerShowAllLink = head.split(/(?<=pager-showAllLink)/)[0].split('u":"').pop() //regex is used to keep the seperator
        let url = opalBaseLink + pagerShowAllLink;
        //do xmlHttpRequest with fetch(). This request retrieves the full course list.
        fetch(url, {
            "headers": {
              "accept": "application/xml, text/xml, */*; q=0.01",
              "accept-language": "en-US,en;q=0.9,de;q=0.8",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "wicket-ajax": "true",
              "wicket-ajax-baseurl": location.href.split("https://bildungsportal.sachsen.de/opal/")[1],
              //"wicket-focusedelementid": "" //"id80d8",
              "x-requested-with": "XMLHttpRequest"
            },
            "referrer": location.href,
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        })
        .then((resp) => resp.text())
        //display full course list in DOM
            //TODO: The xmlDoc is NOT properly inserted in the DOM. Could use some re-thinking
        .then((doc) => {
            let parser = new DOMParser()
            let xmlDoc = parser.parseFromString(doc,"text/xml")
            let id = xmlDoc.getElementsByTagName("component")[0].getAttribute('id')
            let list = xmlDoc.getElementsByTagName("component")[0].innerHTML //this should be reworked. The DOM-Node should be extracted.
            document.getElementById(id).innerHTML = list //this should be rewored. The DOM-Node should be inserted.
            return list
        })
        .then((list) => {
            parseCoursesFromWebPage()
            //parseCoursesFromXMLRequest(list) //Not working yet - but not necessary.
        })
    }

}
