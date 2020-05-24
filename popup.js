//this need to be done here since manifest v2
window.onload = async function(){

    this.loadCourses()

    //update saved clicks
    chrome.storage.local.get(['saved_click_counter'], (result) => {
        if (result.saved_click_counter === undefined) {result.saved_click_counter = 0}
        document.getElementById("saved_clicks").innerHTML = "<font color='green'>Du hast bisher <u>" + result.saved_click_counter + "</u> Klicks gespart!</font>"
    })
    
    //switch funciton
    document.getElementById('switch').addEventListener('change', () => {
        this.saveEnabled()
    })

    //get checkbox clicks
    //document.getElementById('SearchCheckBox').onclick = fwdGoogleSearch

    //set switch
    displayEnabled()

    //get list
    courseList = await loadCourses('favoriten')
    htmlList = document.getElementsByClassName("list")[0]

    displayCourseList(courseList, htmlList)
}

function displayCourseList(courseList, htmlList) {
    courseList.forEach(element => {
        let listEntry = document.createElement("a")
        let listImg = document.createElement("div")
        let listText = document.createElement("div")
        let img = document.createElement("img")
        listEntry.className = "list-entry"
        listImg.className = "list-entry-img"
        listEntry.href = element.link
        listEntry.target = "_blank"
        listText.className = "list-entry-text"
        listText.innerHTML = element.name
        img.className = "list-img"
        img.src ="./images/CoursesOpalIcon.png"
        
        listImg.appendChild(img)
        listEntry.appendChild(listImg)
        listEntry.appendChild(listText)

        htmlList.appendChild(listEntry)
    })

}

//return course_list = [{link:link, name: name}, ...]
function loadCourses(type) {
    switch(type) {
        case "favoriten":
            chrome.storage.local.get(['favoriten'], function(result) {
                return JSON.parse(result.favoriten)
            })
            break
        case "meine_kurse":
            chrome.storage.local.get(['meine_kurse'], function(result) {
                return JSON.parse(result.meine_kurse)
            })
            break
        default:
            break
    }
  }

//changeIsEnabledState
function saveEnabled() {
    chrome.storage.local.get(['isEnabled', 'fwdEnabled'], function(result) {
      chrome.storage.local.set({isEnabled: !(result.isEnabled)}, function() {})
    })
}

//set switch
function displayEnabled() {
    chrome.storage.local.get(['isEnabled'], function(result) {
        this.document.getElementById('switch').checked = result.isEnabled
    })
    chrome.storage.local.get(['fwdEnabled'], function(result) {
        this.document.getElementById('SearchCheckBox').checked = result.fwdEnabled
    })
}

function fwdGoogleSearch() {
    chrome.storage.local.get(['fwdEnabled'], function(result) {
        chrome.storage.local.set({fwdEnabled: !(result.fwdEnabled)}, function() {})
    })
}

function loadCourses(type) {
    return new Promise((resolve, reject) => {
        switch(type) {
            case "favoriten":
                chrome.storage.local.get(['favoriten'], function(result) {
                    resolve(JSON.parse(result.favoriten))
                })
                break
            case "meine_kurse":
                chrome.storage.local.get(['meine_kurse'], function(result) {
                    resolve(JSON.parse(result.meine_kurse))
                })
                break
            default:
                resolve(false)
                break
        }
    })
}