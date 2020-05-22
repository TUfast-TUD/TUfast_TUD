chrome.storage.local.get(['isEnabled',], function(result) {
    if(result.isEnabled) {
        //on first load
        document.addEventListener("DOMContentLoaded", function(e) {
            loadAllCourses()
        })
        //when navigation through page
        document.addEventListener("click", function(){
            //window needs to be reloaded. Not nice, but i didnt found another solution. This causes some bugs!
            window.location.reload()
            loadAllCourses()
        })
    }
})

function parseCourses(){
    //todo
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
            document.getElementById(id).innerHTML = list
            })
    }

}

