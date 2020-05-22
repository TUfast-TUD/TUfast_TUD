chrome.storage.local.get(['isEnabled',], function(result) {
    if(result.isEnabled) {
        //on first load
        document.addEventListener("DOMContentLoaded", async function(e) {
            loadAllCourses()
        })
        //when navigation through page
        document.addEventListener("click", async function(){
            //window needs to be reloaded as soon as url changes. Not nice, but I didnt found another solution. This causes some bugs!
            //For some reason the changes loaded by XML are not present in current DOM
            let oldUrl = location.href
            setInterval(function(){ 
                if (oldUrl != location.href) {
                    oldUrl = location.href
                    console.log("on click"+location.href)
                    location.reload()
                    return
                } 
            }, 10);
        })
    }
})

//THIS FUNCTION DOES NOT WORK YET
function parseCoursesFromXMLRequest(XMLString){
    //Directly parse courses from xmlHttpRequest
    
    //Need to remove CDATA-Tag
    XMLString = XMLString.replace("<![CDATA[", "")
    XMLString = XMLString.replace("]]>", "")
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
}

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
        //get ajax xmlHTTPRequest Url
        let head = document.getElementsByTagName('head')[0].innerHTML
        //regex is used to keep the seperator
        let pagerShowAllLink = head.split(/(?<=pager-showAllLink)/)[0].split('u":"').pop()
        let url = opalBaseLink + pagerShowAllLink;

        //do xmlHttpRequest with fetch(). This request retrieves full course list
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
        .then((doc) => {
            let parser = new DOMParser()
            let xmlDoc = parser.parseFromString(doc,"text/xml")
            let id = xmlDoc.getElementsByTagName("component")[0].getAttribute('id')
            let list = xmlDoc.getElementsByTagName("component")[0].innerHTML
            //this needs to be reworked in order to implement all courses corretly in DOM!
            document.getElementById(id).innerHTML = list
            return list
        })
        .then((list) => {
            //parseCoursesFromWebPage()
            //parseCoursesFromXMLRequest(list) // NOT WORKING YET
        })
    }

}
