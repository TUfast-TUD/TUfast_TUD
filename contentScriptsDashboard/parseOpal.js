chrome.storage.local.get(['isEnabled',], function(result) {
    if(result.isEnabled) {
        //wait until full page is loaded
        window.addEventListener("load", async function(e) {

            //check if pager-showall exists
            let oldId = ""
            let parsedCourses = false

            //check if all courses are loaded already
            if(!document.getElementsByClassName("pager-showall")[0]){
                chrome.runtime.sendMessage({cmd: "save_courses", course_list: parseCoursesFromWebPage()})
            } else {
                document.getElementsByClassName("pager-showall")[0].click()
                oldId = document.getElementsByClassName("pager-showall")[0].getAttribute("id")
            }

            //listen for new ID with mutation observer and urlPath-change --> course list was reloaded
            const config = { attributes: true, childList: true, subtree: true }
            const callback = function(mutationsList, observer) {
               
                //if  all courses are loaded already and on new page
                if(!document.getElementsByClassName("pager-showall")[0] && location.href != oldId){
                    let course_list = parseCoursesFromWebPage()
                    chrome.runtime.sendMessage({cmd: "save_courses", course_list: course_list})
                    oldId = location.href
                }

                //if not all courses are loaded already
                if(document.getElementsByClassName("pager-showall")[0].getAttribute("id") != oldId && document.getElementsByClassName("pager-showall")[0].innerText === "alle anzeigen") {
                    oldId = document.getElementsByClassName("pager-showall")[0].getAttribute("id")
                    document.getElementsByClassName("pager-showall")[0].click()
                    parsedCourses = false
                }  
                //parse courses
                if(document.getElementsByClassName("pager-showall")[0].innerText === "Seiten" && !parsedCourses) {
                    chrome.runtime.sendMessage({cmd: "save_courses", course_list: parseCoursesFromWebPage()})
                    parsedCourses = true
                }   
            }
            const observer = new MutationObserver(callback);
            observer.observe(document.body, config);
        }, true)
    }
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
    alert(course_list.list.length)
    return course_list
}