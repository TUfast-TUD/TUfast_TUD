window.onload = async function () {

    //get things from storage
    chrome.storage.local.get(['dashboardDisplay', "saved_click_counter"], async function (result) {
        //display courses
        let dashboardDisplay = result.dashboardDisplay
        let courseList = await loadCourses(dashboardDisplay)
        let htmlList = document.getElementsByClassName("list")[0]
        displayCourseList(courseList, htmlList, dashboardDisplay)

        //filter list
        listSearchFunction()

        //display saved clicks
        if (result.saved_click_counter === undefined) { result.saved_click_counter = 0 }
        let time = clicksToTime(result.saved_click_counter)
        document.getElementById("saved_clicks").innerHTML = "<text><font color='green'>" + result.saved_click_counter + " Klicks</font> gespart: <a href='javascript:void(0)' id='time' target='_blank' style='color: purple;'>" + time + "</a></text>"
        this.document.getElementById('time').onclick = openSettingsTimeSection

    })

    //assign switch function
    document.getElementById('switch').addEventListener('change', () => {
        saveEnabled()
    })

    //asign input search fct
    //onkeydown?
    this.document.getElementById("searchListInput").onkeyup = listSearchFunction

    this.document.getElementById("settings").onclick = this.openSettings

    displayEnabled()

    //bind enter key --> when enter key is pressed the first course in list is clicked
    document.getElementById("list").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            //Cancel the default action, if needed
            //event.preventDefault();
            //Click the first element which is visible
            let list_entries = document.getElementsByClassName("list-entry")
            for (let i = 0; i < list_entries.length; i++) {
                if (!(list_entries[i].style.display === "none")) {
                    list_entries[i].click()
                    break
                }
            }
        }
    });
}

function clicksToTime(clicks) {
    clicks = clicks * 3
    let secs = clicks % 60
    let mins = Math.floor(clicks / 60)
    return mins + "min " + secs + "s"
}


function openSettings() {
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', param: "" }, function (result) { }) //for some reason I need to pass empty param - else it wont work in ff
    let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
    if (isFirefox) window.close()
    return false //Required for ff
}

function openSettingsTimeSection() {
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'time_settings' }, function (result) { })
    let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
    if (isFirefox) window.close()
    return false //Required for ff
}

function listSearchFunction() {
    let input, filter, list, listEntries, i

    input = document.getElementById("searchListInput")
    filter = input.value.toLowerCase()
    list = document.getElementById("list")
    listEntries = list.getElementsByClassName("list-entry")

    for (i = 0; i < listEntries.length; i++) {
        let txtValue = listEntries[i].text.toLowerCase()
        if (!txtValue.includes(filter)) {
            listEntries[i].style.display = "none"
        } else {
            listEntries[i].style.display = ""
        }
    }

    //always show "Klicke hier, um die Kursliste manuell zu aktualisieren..."
    if (listEntries[listEntries.length - 1].innerHTML.includes("aktualisieren")) { listEntries[listEntries.length - 1].style.display = "" }
}

function displayCourseList(courseList, htmlList, type) {
    let link = ""
    let name = ""
    let imgSrc = ""
    switch (type) {
        case "favoriten":
            link = "https://bildungsportal.sachsen.de/opal/auth/resource/favorites"
            name = "Klicke, um deine Opal-Kurse zu importieren"
            imgSrc = "./icons/star.png"
            break
        case "meine_kurse":
            link = "https://bildungsportal.sachsen.de/opal/auth/resource/courses"
            name = "Klicke, um deine Opal-Kurse zu importieren"
            imgSrc = "./icons/CoursesOpalIcon.png"
            break
        default:
            break
    }

    if (courseList.length === 0 || courseList === undefined || courseList === false) {
        courseList = []
        courseList.push({ "name": name, "link": link, "img": "./icons/reload.png" })
    } else {
        courseList.push({ "name": "Diese Kursliste jetzt aktualisieren...", "link": link, "img": "./icons/reload.png" })
    }

    courseList.forEach(element => {
        let listEntry = document.createElement("a")
        let listImg = document.createElement("div")
        let listText = document.createElement("div")
        let img = document.createElement("img")
        listEntry.className = "list-entry"
        listImg.className = "list-entry-img"
        listEntry.href = element.link
        listEntry.target = "_blank"
        listEntry.onclick = save__two_clicks
        listText.className = "list-entry-text"
        listText.innerHTML = element.name
        img.className = "list-img"
        img.src = imgSrc
        if (element.img === "./icons/reload.png") img.src = "./icons/reload.png"
        listImg.appendChild(img)
        if (!(element.img === false)) { listEntry.appendChild(listImg) }
        listEntry.appendChild(listText)

        htmlList.appendChild(listEntry)
    })

    //Create button so switch courses <> favorites, only if 
    let listEntry = document.createElement("a")
    let listImg = document.createElement("div")
    let listText = document.createElement("div")
    let img = document.createElement("img")
    listImg.className = "list-entry-img"
    listEntry.className = "list-entry"
    listEntry.href = "javascript:void(0)"
    listEntry.onclick = switch_courses_to_show
    listText.className = "list-entry-text"
    //listText.style.flex = "none"    //Required
    img.className = "list-img"
    //listImg.style.flex = "none"     //Required
    if (type === "favoriten") img.src = "./icons/CoursesOpalIcon.png"
    if (type === "meine_kurse") img.src = "./icons/star.png"

    listImg.appendChild(img)
    listEntry.appendChild(listImg)
    if (type === "favoriten") listText.innerHTML = 'Wechsel zu "Meine Kurse" ... '
    if (type === "meine_kurse") listText.innerHTML = 'Wechsel zu "Meine Favoriten" ...'

    listEntry.appendChild(listText)

    htmlList.appendChild(listEntry)

}

function switch_courses_to_show() {
    chrome.storage.local.get(['dashboardDisplay'], async function (result) {
        if (result.dashboardDisplay === "meine_kurse") chrome.storage.local.set({ dashboardDisplay: "favoriten" }, function () { })
        if (result.dashboardDisplay === "favoriten") chrome.storage.local.set({ dashboardDisplay: "meine_kurse" }, function () { })
        location.reload()
    })
}

function save__two_clicks() {
    chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 2 })
}

//changeIsEnabledState
function saveEnabled() {
    //only save, if user data is available. Else forward to settings page
    chrome.storage.local.get(['isEnabled'], (resp) => {
        chrome.runtime.sendMessage({ cmd: 'is_user_data_available' }, (result) => {
            if (result.selma || result.slub) {
                chrome.storage.local.set({ isEnabled: !(resp.isEnabled) }, () => { })
            } else {
                chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'auto_login_settings' }, () => { })
                window.close()
            }
        })
    })

}

//set switch
function displayEnabled() {
    chrome.storage.local.get(['isEnabled'], function (result) {
        this.document.getElementById('switch').checked = result.isEnabled
    });
    chrome.runtime.sendMessage({ cmd: 'is_user_data_available' }, (result) => {
        if(!result.selma && result.slub) {
            document.getElementById("settings-al-label").innerHTML += " <small>(SLUB only)</small>"
        }
    });
}

//return course_list = [{link:link, name: name}, ...]
function loadCourses(type) {
    return new Promise((resolve, reject) => {
        switch (type) {
            case "favoriten":
                chrome.storage.local.get(['favoriten'], function (result) {
                    try {
                        resolve(JSON.parse(result.favoriten))
                    } catch {
                        resolve(false)
                    }
                })
                break
            case "meine_kurse":
                chrome.storage.local.get(['meine_kurse'], function (result) {
                    try {
                        resolve(JSON.parse(result.meine_kurse))
                    } catch {
                        resolve(false)
                    }
                })
                break
            default:
                resolve(false)
                break
        }
    })
}
