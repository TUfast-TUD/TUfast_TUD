chrome.storage.local.get(['isEnabled' ,'fwdEnabled'], function (result) {
    if (result.isEnabled || result.fwdEnabled) {
        //on load
        document.addEventListener("DOMNodeInserted", function(e) {
            if(!document.getElementById("TUFastLogo")) {insertLogo()} 
        })
        //on document changes
        window.addEventListener("load", function() {
            if(!document.getElementById("TUFastLogo")) {insertLogo()}
        }, true) 
    }
})

var GLOBAL_counter = 0
var counterTimeoutRemove
var timeout = 1000
var blocker = false
var timeUp = false
var display_value
var typeOfMsg = ""

function logoOnClick(){

    if(blocker && !timeUp) return

    GLOBAL_counter++
    
    //create node if not existend
    if (!document.getElementById('counter')) {
        let body = document.getElementsByTagName("body")[0]
        let counter = document.createElement("div")
        let container = document.createElement("div")
        container.style.position = "relative"
        counter.id = "counter"
        counter.style.opacity = "1"
        counter.style.fontSize = "150px"
        counter.style.position= 'absolute'
        counter.style.color = "#000000"
        counter.style.top = "50%"
        counter.style.left="50%"
        counter.style.marginRight = "-50%"
        counter.style.transform = "translate(-50%, -50%)"
        counter.style.zIndex = "99"

        container.appendChild(counter)
        body.prepend(counter)
    } else {
        //just update
        clearTimeout(counterTimeoutRemove)
    }

    counter = document.getElementById('counter')
    counter.style.color = funnyColor(counter.style.color, 2)

    switch (GLOBAL_counter) {
        case 2:
            display_value = "You like numbers?"
            typeOfMsg = "text"
            break
        case 10:
            display_value = "Keep going! :)"
            typeOfMsg = "text"
            break
        case 30:
            display_value = "Just numbers..."
            typeOfMsg = "text"
            break
        case 60:
            display_value = "Maybe there is more?!"
            typeOfMsg = "text"
            break
        case 100:
            display_value = "No, there isn't."
            typeOfMsg = "text"
            break
        case 150:
            display_value = "You can stop now!"
            typeOfMsg = "text"
            break
        case 200:
            display_value = "Your are ambitious."
            typeOfMsg = "text"
            break
        case 150:
            display_value = "Okay well done."
            typeOfMsg = "text"
            break
        default:
            typeOfMsg="number"
            display_value = GLOBAL_counter
    }

    if(typeOfMsg==="number") {
        timeout = 1000
        blocker = false
        counter.style.fontSize = "150px"
    } else if (typeOfMsg==="text"){
        counter.style.fontSize = "100px"
        timeout = 2000
        blocker = true
    }

    counter.innerHTML = display_value

    timeUp = false
    counterTimeoutRemove = setTimeout(function () {
        counter = document.getElementById('counter')
        counter.parentNode.removeChild(counter)
        timeUp = true
    }, timeout)

}

function funnyColor(color, step) {
    rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    rgb[1] = parseInt(rgb[1])
    rgb[2] = parseInt(rgb[2])
    rgb[3] = parseInt(rgb[3])
    if (rgb[1] < 255 - step && rgb[2] < 255 - step && rgb[3] < 150 - step) rgb[1] += step
    else if (rgb[2] < 255 - step && rgb[3] < 150 - step) rgb[2]+=step
    else if (rgb[3] < 150-step) rgb[3]+= step
    else if (rgb[1] > 0 + step) rgb[1] -= step
    else if (rgb[2] > 0 + step) rgb[2] -= step
    else if (rgb[3] > 0 + step) rgb[3] -= step
    color = "rgb(" + rgb[1] + "," + rgb[2] + "," + rgb[3] +")"
    return color;
};

function insertLogo() {
    try {
        if(document.getElementsByClassName("page-header")[0] != undefined){
            let imgUrl = chrome.runtime.getURL("../images/tufast48.png")
            let header = document.getElementsByClassName("page-header")[0]
            let logo_node = document.createElement("h1")
            let logo_link = document.createElement("a")
            let logo_img= document.createElement("img")

            logo_link.href = "javascript:void(0)"
            logo_link.title = "powered by TUFast. You're welcome."
            logo_img.style.display = "inline-block"
            logo_img.style.width = "37px"
            logo_img.src = imgUrl
            logo_node.id ="TUFastLogo"
            logo_node.onclick = logoOnClick

            logo_link.appendChild(logo_img)
            logo_node.appendChild(logo_link)

            header.append(logo_node)
        }
    }
    catch (e) {
        console.log("Error inserting logo: " + e)
    }
}

