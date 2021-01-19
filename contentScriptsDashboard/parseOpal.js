chrome.storage.local.get(['isEnabled', 'seenInOpalAfterDashbaordUpdate', "removedOpalBanner", "saved_click_counter", "mostLiklySubmittedReview", "removedReviewBanner", "neverShowedReviewBanner"], function (result) {

    //decide whether to show dashbaord banner
    let showDashboardBanner = false
    if (result.seenInOpalAfterDashbaordUpdate < 5 && !result.removedOpalBanner) { showDashboardBanner = true }
    chrome.storage.local.set({ seenInOpalAfterDashbaordUpdate: result.seenInOpalAfterDashbaordUpdate + 1 }, function () { })


    //wait until full page is loaded
    window.addEventListener("load", async function (e) {

        let oldLocationHref = location.href
        let parsedCourses = false

        // show banner
        if (showDashboardBanner) { showDashboardBannerFunc() }
        // 

        //if all courses loaded --> parse
        if (!document.getElementsByClassName("pager-showall")[0]) {
            chrome.runtime.sendMessage({ cmd: "save_courses", course_list: parseCoursesFromWebPage() })
            parsedCourses = true
            //if not --> load all courses
        } else {
            document.getElementsByClassName("pager-showall")[0].click()
            chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
            parsedCourses = false
        }

        //close banner buttons
        if (this.document.getElementById("closeOpalBanner")) {
            this.document.getElementById("closeOpalBanner").onclick = closeOpalBanner
        }

        //use mutation observer to detect page changes
        const config = { attributes: true, childList: true, subtree: true }
        const callback = function (mutationsList, observer) {

            //detect new page
            if (location.href != oldLocationHref) {
                oldLocationHref = location.href
                //all courses loaded already --> parse directly
                if (!document.getElementsByClassName("pager-showall")[0]) {
                    let course_list = parseCoursesFromWebPage()
                    chrome.runtime.sendMessage({ cmd: "save_courses", course_list: course_list })
                    parsedCourses = true
                }
                //not all courses loaded already --> load all courses
                if (document.getElementsByClassName("pager-showall")[0].innerText === "alle anzeigen") {
                    document.getElementsByClassName("pager-showall")[0].click()
                    chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
                    parsedCourses = false
                }
            }

            //parse courses
            if (document.getElementsByClassName("pager-showall")[0]) {
                if (document.getElementsByClassName("pager-showall")[0].innerText === "Seiten" && !parsedCourses) {
                    chrome.runtime.sendMessage({ cmd: "save_courses", course_list: parseCoursesFromWebPage() })
                    parsedCourses = true
                }
            }
        }
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    }, true)
})

function closeOpalBanner() {
    if (document.getElementById("opalBanner")) {
        document.getElementById("opalBanner").remove()
        chrome.storage.local.set({ removedOpalBanner: true }, function () { })
    }
}

function showDashboardBannerFunc() {
    let banner = this.document.createElement("div")
    let imgUrl = chrome.runtime.getURL("../images/OpalBanner3.png")
    banner.id = "opalBanner"
    banner.style.height = "50px"
    banner.style.margin = "auto"
    //add remove button -->
    banner.innerHTML = '<img src=' + imgUrl + ' style=" -webkit-filter: drop-shadow(2px 2px 2px #aaa);filter: drop-shadow(2px 2px 2px #aaa); height: 55px; right: 30px; z-index: 999; position:fixed;"> <span id="closeOpalBanner" style="-webkit-filter: drop-shadow(2px 2px 2px #aaa);filter: drop-shadow(2px 2px 2px #aaa);font-size: 18px; z-index: 999; cursor: pointer; position: fixed; top: 14.1px; right: 13px; padding: 5.8px 7px; background-color: #ddd">x</span>'
    this.document.body.insertBefore(banner, document.body.childNodes[0])
}

function parseCoursesFromWebPage() {
    //there are two options how the table can be build.
    let course_list = { type: "", list: [] }
    if (location.pathname === "/opal/auth/resource/courses") { course_list.type = "meine_kurse" }
    if (location.pathname === "/opal/auth/resource/favorites") { course_list.type = "favoriten" }
    try {
        //most likely for favoriten
        let tableEntries = document.getElementsByClassName("table-panel")[0].getElementsByTagName("tbody")[0].children
        for (let item of tableEntries) {
            let name = item.children[2].children[0].getAttribute("title")
            let link = item.children[2].children[0].getAttribute("href")
            course_list.list.push({ name: name, link: link })
        }
    } catch {
        //most likely for meine kurse
        let tableEntries = document.getElementsByClassName("table-panel")[0].getElementsByClassName("content-preview-container")[0].getElementsByClassName("list-unstyled")[0].getElementsByClassName("content-preview content-preview-horizontal")
        for (let item of tableEntries) {
            try {
                let name = item.getElementsByClassName("content-preview-title")[0].innerHTML
                let link = item.children[3].getAttribute("href")
                course_list.list.push({ name: name, link: link })
            }
            catch (e) {console.log("Error in parsing course list:" + e) }
        }
    }
    return course_list
}
