
//this need to be done here since manifest v2
window.onload = function(){

    //update saved clicks
    chrome.storage.local.get(['saved_click_counter'], (result) => {
        if (result.saved_click_counter === undefined) {result.saved_click_counter = 0}
        document.getElementById("saved_clicks").innerHTML = "<font color='green'>Du hast bisher <u>" + result.saved_click_counter + "</u> Klicks gespart!</font>"
    })
}
