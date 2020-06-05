chrome.storage.local.get(['isEnabled', 'seenInOpalAfterDashbaordUpdate'], function(result) {
    //if(result.isEnabled) {
        
        let showDashboardBanner = false
        if(result.seenInOpalAfterDashbaordUpdate < 5) {showDashboardBanner = true}
        chrome.storage.local.set({seenInOpalAfterDashbaordUpdate: result.seenInOpalAfterDashbaordUpdate + 1}, function() {})
        
        //wait until full page is loaded
        window.addEventListener("load", async function(e) {

            let oldLocationHref = location.href
            let parsedCourses = false

            // -- show banner
            if(showDashboardBanner) {
                let banner = this.document.createElement("div")
                let imgUrl = chrome.runtime.getURL("../images/OpalBanner3.png")
                banner.style.height="42px"
                banner.innerHTML = '<img src='+imgUrl+' style="height: 39px; float: right; margin-right: 30px;">'
                this.document.body.insertBefore(banner, document.body.childNodes[0])
            }
            // --

            //if all courses loaded --> parse
            if(!document.getElementsByClassName("pager-showall")[0]){
                chrome.runtime.sendMessage({cmd: "save_courses", course_list: parseCoursesFromWebPage()})
                parsedCourses = true
            //if not --> load all courses
            } else {
                document.getElementsByClassName("pager-showall")[0].click()
                parsedCourses = false
            }

            //use mutation observer to detect page changes
            const config = { attributes: true, childList: true, subtree: true }
            const callback = function(mutationsList, observer) {

                //detect new page
                if(location.href != oldLocationHref) {
                    oldLocationHref = location.href
                    //all courses loaded already --> parse directly
                    if(!document.getElementsByClassName("pager-showall")[0]){
                        let course_list = parseCoursesFromWebPage()
                        chrome.runtime.sendMessage({cmd: "save_courses", course_list: course_list})
                        parsedCourses = true
                    }
                    //not all courses loaded already --> load all courses
                    if(document.getElementsByClassName("pager-showall")[0].innerText === "alle anzeigen"){
                        document.getElementsByClassName("pager-showall")[0].click()
                        parsedCourses = false
                    }
                }
                
                //parse courses
                if(document.getElementsByClassName("pager-showall")[0]){
                    if(document.getElementsByClassName("pager-showall")[0].innerText === "Seiten" && !parsedCourses) {
                        chrome.runtime.sendMessage({cmd: "save_courses", course_list: parseCoursesFromWebPage()})
                        parsedCourses = true
                    }  
                } 
            }
            const observer = new MutationObserver(callback);
            observer.observe(document.body, config);
        }, true)
    //}
})

function parseCoursesFromWebPage(){
    //there are two options how the table can be build.
    let course_list = {type:"", list:[]}
    if (location.pathname ==="/opal/auth/resource/courses") {course_list.type = "meine_kurse"}
    if (location.pathname ==="/opal/auth/resource/favorites") {course_list.type = "favoriten"}
    try {
        //most likely for favoriten
        let tableEntries = document.getElementsByClassName("table-panel")[0].getElementsByTagName("tbody")[0].children
        for (let item of tableEntries) {
            let name = item.children[2].children[0].getAttribute("title")
            let link = item.children[2].children[0].getAttribute("href")
            course_list.list.push({name: name, link: link})
        }
    } catch {
        //most likely for meine kurse
        let tableEntries = document.getElementsByClassName("table-panel")[0].getElementsByClassName("content-preview-container")[0].getElementsByClassName("list-unstyled")[0].getElementsByClassName("content-preview content-preview-horizontal")
        for (let item of tableEntries) {
            let name = item.getElementsByClassName("content-preview-title")[0].innerHTML
            let link = item.children[3].getAttribute("href")
            course_list.list.push({name: name, link: link})
        }
    }
    return course_list
}