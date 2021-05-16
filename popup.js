const shareHTML = '<div style=height:450px;width:510px;overflow:hidden><div class=the-middle style=white-space:nowrap;display:inline><div class=tufast_text><span class=tufasst_name>Hilf deinen Mitstudierenden</span></div><div class="tufast_text" style=position:relative;top:6px><img class="imgicon huge" src=/images/tufast48.png style=position:relative;top:-7px;left:0px><span class="tufasst_name huge" style=position:relative;top:-7px;left:3px>TUfast</span><span class=tufasst_name> &nbsp;zu entdecken</span></div><div class=grey><span class=tufasst_name>und <a class=grey_a id=rewards_link href=javascript:void(0)>sammle coole Raketen</a>!</span></div><div id=download-section><div>Teilen mit</div><div class=download-link><img class=imgicon src=icons/gmail.png><span class=browser_name><a href="mailto:?subject=Probiere%20mal%20TUfast!%20%F0%9F%9A%80&body=Hey%20%3A)%0A%0Akennst%20du%20schon%20TUfast%3F%0A%0ATUfast%20hilft%20beim%20t%C3%A4glichen%20Arbeiten%20mit%20den%20Online-Portalen%20der%20TU%20Dresden.%0ADamit%20spare%20ich%20viel%20Zeit%20und%20nervige%20Klicks.%0A%0ATUfast%20ist%20eine%20Erweiterung%20f%C3%BCr%20den%20Browser%20und%20wurde%20von%20Studenten%20entwickelt.%0AProbiere%20es%20jetzt%20auf%20www.tu-fast.de%20!%0A%0ALiebe%20Gr%C3%BC%C3%9Fe%C2%A0%F0%9F%96%90"target=_blank> E-Mail</a></span></div><div class=download-link><img class=imgicon src=icons/wa2.png style=height:1.4em><span class=browser_name><a href="https://api.whatsapp.com/send?text=Hey%2C%20kennst%20du%20schon%20TUfast%3F%20%F0%9F%9A%80%0A%0AMacht%20das%20arbeiten%20mit%20allen%20Online-Portalen%20der%20TU%20Dresden%20produktiver%20und%20hat%20mir%20schon%20viel%20Zeit%20und%20nervige%20Klicks%20gespart.%20Eine%20richtig%20n%C3%BCtzliche%20Browsererweiterung%20f%C3%BCr%20Studenten!%0A%0AProbiers%20gleich%20mal%20aus%20auf%20www.tu-fast.de%20%F0%9F%96%90"target=_blank>WhatsApp</a></span></div><div class=download-link><span class=browser_name>oder <a href=https://www.tu-fast.de target=_blank>www.tu-fast.de</a></span></div></div></div><div class=the-bottom><p>Gemacht mit 🖤 von Studenten | <a href=https://github.com/TUfast-TUD/TUfast_TUD target=_blank>GitHub</a> | <a href="mailto:frage@tu-fast.de?subject=Feedback%20TUfast"target=_blank>Kontakt</a></div></div>'
const bananaHTML = '<a href="https://www.buymeacoffee.com/olihausdoerfer" target="_blank"style = "position: fixed; bottom: 68px; right: -66px; width:240px; height: auto;" > <img style="width: 170px;"src="https://img.buymeacoffee.com/button-api/?text=Buy me a banana&emoji=🍌&slug=olihausdoerfer&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"></a>'

//this config is used to customize TUfast for a course of study
//it overrides the default setting from popup.html
//if you want to add an footer icon for your course of study, you need to add it to popup.html and set footer_icons_display property in this config
const studiengang_config = {
    "general": {
        "name": "Standardeinstellungen",
        "footer_icons_display": ["selma", "opal", "qis", "matrix", "msx", "cloud", "je", "swdd"]
    },
    "medizin": {
        "name": "Medizin",
        "fsr_icon": "./OfficialIcons/fsr_medi.jpg",
        "fsr_icon_dashboard_style": "",
        "footer_icons_display": ["selma", "opal", "moodle", "eportal", "msx", "cloud", "swdd"],
        "footer_icons_links": {
            "swdd":"https://www.studentenwerk-dresden.de/mensen/speiseplan/mensologie.html",
        }
    },
    "maschinenbau": {
        "name": "Maschinenwesen",
        "fsr_icon": "./OfficialIcons/fsr_mw.png",
        "fsr_icon_dashboard_style": "max-height: 32px;",
        "footer_icons_display": ["selma", "opal", "qis", "matrix", "msx", "cloud", "swdd"],
        "footer_icons_links": {
            "swdd": "https://www.studentenwerk-dresden.de/mensen/speiseplan/",
        }
    }
}

window.onload = async function () {

    //get things from storage
    chrome.storage.local.get(['dashboardDisplay', "saved_click_counter", "studiengang"], async function (result) {
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

        //display banana
        // if (result.saved_click_counter > 100) {
        //     document.getElementById("banana").innerHTML = bananaHTML
        // }

        //exclusive style adjustments
        customizeForStudiengang(result.studiengang)

    })

    //assign switch function
    document.getElementById('switch').addEventListener('change', () => {
        saveEnabled()
    })

    //asign input search fct
    //onkeydown?
    this.document.getElementById("searchListInput").onkeyup = listSearchFunction

    this.document.getElementById("settings").onclick = this.openSettings
    this.document.getElementById("share").onclick = this.openShare

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
    })

    //set custom dropdown styles and js for studiengang selection
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function (event) {
        if (!event.target.matches('.select_studiengang_btn')) {
            var dropdowns = document.getElementsByClassName("select_studiengang_dropdown_content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }

    //studiengang selection drop-down
    document.getElementById("select_studiengang_btn").onclick = selectStudiengangDropdown
    addDropdownOptions()


}

function changeStudiengangSelection() {
    studiengang = this.getAttribute('studiengang')
    chrome.storage.local.set({ studiengang: studiengang }, function () { })
    customizeForStudiengang(studiengang)
}

function addDropdownOptions() {
    let dropdown_content = document.getElementById("select_studiengang_dropdown_content")

    //set footer icons
    Object.keys(studiengang_config).forEach(function (key) {
        
        let listEntry = document.createElement("p")
        listEntry.style = "display:flex;align-items: center; min-height: 36px"
        listEntry.onclick = changeStudiengangSelection
        listEntry.setAttribute('studiengang', key);

        let listTxt = document.createElement("text")
        listTxt.style = "flex:10"
        listTxt.innerHTML = studiengang_config[key].name

        if (studiengang_config[key].fsr_icon) {
            let listImg = document.createElement("img")
            listImg.style = "flex: 1;height: 30px; width: auto; vertical-align:middle"
            listImg.src = studiengang_config[key].fsr_icon
            listEntry.appendChild(listImg)
        }

        listEntry.appendChild(listTxt)

        dropdown_content.appendChild(listEntry)
    });
}

//dashboard adjustments for studiengang
function customizeForStudiengang(studiengang) {

    //set fsr icon
    if (studiengang_config[studiengang].fsr_icon) {
        document.getElementById("fsr_icon").src = studiengang_config[studiengang].fsr_icon
        document.getElementById("fsr_icon").style = studiengang_config[studiengang].fsr_icon_dashboard_style
    }


    //set footer icons
    if (studiengang_config[studiengang].footer_icons_display) {
        //set visibility for all icons to none
        icons = document.getElementById("settings-footer-bar-icons").children
        console.log(icons)
        for (var i = 0; i < icons.length; i++) {
            console.log(icons[i].style); //second console output
            icons[i].style.display = "none"
        }

        //set visible icons
        studiengang_config[studiengang].footer_icons_display.forEach(element => {
            document.getElementById(element).style.display = "flex"
        });
    }

    //set footer icon links
    if (studiengang_config[studiengang].footer_icons_links) { 
        Object.keys(studiengang_config[studiengang].footer_icons_links).forEach(function (key) {
            document.getElementById(key).href = studiengang_config[studiengang].footer_icons_links[key]
        });
    }
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

async function openShare() {
    document.getElementById("list").innerHTML = shareHTML   //it needs to be injected this way, else click doesnt work
    await new Promise(r => setTimeout(r, 500))
    document.getElementById("rewards_link").addEventListener("click", function () {   //click handler needs to be set this way
        chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' }, function (result) { }) //for some reason I need to pass empty param - else it wont work in ff
        let isFirefox = navigator.userAgent.includes("Firefox/")  //attention: no failsave browser detection
        if (isFirefox) window.close()
        return false //Required for ff
    })

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
    chrome.storage.local.get(['isEnabled'], function (resp) {
        chrome.runtime.sendMessage({ cmd: 'get_user_data' }, function (result) {
            if (!(result.asdf === undefined || result.fdsa === undefined)) {
                chrome.storage.local.set({ isEnabled: !(resp.isEnabled) }, function () { })
            } else {
                chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'auto_login_settings' }, function (result) { })
                window.close()

            }
        })
    })

}

//set switch
function displayEnabled() {
    chrome.storage.local.get(['isEnabled'], function (result) {
        this.document.getElementById('switch').checked = result.isEnabled
    })
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


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function selectStudiengangDropdown() {
    document.getElementById("select_studiengang_dropdown_content").classList.toggle("show");
}

