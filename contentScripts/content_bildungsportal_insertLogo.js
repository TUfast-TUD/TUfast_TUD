chrome.storage.local.get(['isEnabled' ,'fwdEnabled', 'Rocket'], function (result) {
    if (result.isEnabled || result.fwdEnabled) {
        //on load
        document.addEventListener("DOMNodeInserted", function(e) {
            if(!document.getElementById("TUFastLogo")) {insertLogo(result.Rocket)} 
        })
        //on document changes
        window.addEventListener("load", function() {
            if (!document.getElementById("TUFastLogo")) { insertLogo(result.Rocket)}
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
    if (GLOBAL_counter === 100) {
        document.getElementById("TUFastLogo").parentNode.removeChild(document.getElementById("TUFastLogo"))
        chrome.storage.local.set({ Rocket: "colorful" }, function () {})
        insertLogo("colorful")
    }
    if (GLOBAL_counter === 500) {
        document.getElementById("TUFastLogo").parentNode.removeChild(document.getElementById("TUFastLogo"))
        chrome.storage.local.set({ Rocket: "colorfulPRO" }, function () { })
        insertLogo("colorfulPRO")
    }
    
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
    counter.style.color = funnyColor(counter.style.color, 6)

    switch (GLOBAL_counter) {
        case 20:
            display_value = "You like numbers?"
            typeOfMsg = "text"
            break
        case 50:
            display_value = "Thats good!"
            typeOfMsg = "text"
            break
        case 100:
            display_value = "&#x1F680; &#x1F680; &#x1F680;"
            typeOfMsg = "text"
            break
        case 150:
            display_value = "No, there isn't."
            typeOfMsg = "text"
            break
        case 250:
            display_value = "You can stop now!"
            typeOfMsg = "text"
            break
        case 400:
            display_value = "Your are ambitious."
            typeOfMsg = "text"
            break
        case 500:
            display_value = "PRO PRO PRO"
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

function insertLogo(rocketType) {
    let imgUrl, header, logo_node, logo_link, logo_img, badge
    try {
        if(document.getElementsByClassName("page-header")[0] != undefined){
            header = document.getElementsByClassName("page-header")[0]
            logo_node = document.createElement("h1")
            logo_link = document.createElement("a")
            logo_img = document.createElement("img")
            logo_link.href = "javascript:void(0)"
            logo_node.id = "TUFastLogo"
            logo_link.title = "powered by TUFast. You're welcome."
            logo_node.onclick = logoOnClick

            switch (rocketType) {
                case "colorfulPRO":
                    logo_node.style.fontSize = "30px"
                    logo_node.style.paddingTop = "5px"
                    logo_link.style.position = "relative"
                    logo_link.innerHTML = "&#x1F680;"
                    badge = document.createElement("span")
                    badge.classList.add("badge")
                    badge.innerHTML = "PRO"
                    badge.style.fontSize = "0.3em"
                    badge.style.position = "absolute"
                    badge.style.bottom ="0px"
                    badge.style.left = "20px"
                    logo_link.appendChild(badge)
                    break
                case "colorful":
                    logo_node.style.fontSize = "30px"
                    logo_node.style.paddingTop = "5px"
                    logo_link.innerHTML = "&#x1F680;"
                    break
                default:
                    imgUrl = chrome.runtime.getURL("../images/tufast48.png")
                    logo_img.style.display = "inline-block"
                    logo_img.style.width = "37px"
                    logo_img.src = imgUrl

                    logo_link.appendChild(logo_img)
                    break
            }
            logo_node.appendChild(logo_link)
            header.append(logo_node)
        }
    }
    catch (e) {
        console.log("Error inserting logo: " + e)
    }
}

