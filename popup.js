//this need to be done here since manifest v2
window.onload = function(){

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
    document.getElementById('SearchCheckBox').onclick = fwdGoogleSearch

    //set switch
    displayEnabled()
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
    switch(type) {
        case "favoriten":
            chrome.storage.local.get(['favoriten'], function(result) {
                alert(JSON.parse(result))
            })
            break
        case "meine_kurse":
            chrome.storage.local.get(['meine_kurse'], function(result) {
                alert(JSON.parse(result))
            })
            break
        default:
            break
    }
}