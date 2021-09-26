/*
   { selectedRocketIcon: '{"id": "RI_default", "link": "RocketIcons/default_128px"}' }
*/
chrome.storage.local.get(['isEnabled', 'fwdEnabled', 'PRObadge', 'flakeState', "selectedRocketIcon", "foundEasteregg"], function (result) {
    if (result.isEnabled || result.fwdEnabled) {
        //parse selectedRocketIcon
        let selectedRocketIcon = JSON.parse(result.selectedRocketIcon)

        //decide which overlay to show
        let christmasTime = false
        let d = new Date()
        let month = d.getMonth() + 1 //starts at 0
        let day = d.getDate()
        if (month === 12 && day > 15 && day < 27) christmasTime = true

        //switch flakeState to false in november
        if (month === 11) chrome.storage.local.set({ flakeState: false }, function () { })

        if (christmasTime) {
            //on load
            document.addEventListener("DOMNodeInserted", function (e) {
                if (!document.getElementById("flake")) insertFlakeSwitch(result.flakeState)
            })
            //on document changes
            window.addEventListener("load", function () {
                if (!document.getElementById("flake")) insertFlakeSwitch(result.flakeState)
                if (!document.getElementById("snowflakes") && result.flakeState) insertFlakes()
            }, true)
            //standard rocket logo
        } else {
            //on load
            document.addEventListener("DOMNodeInserted", function (e) {
                if (!document.getElementById("TUFastLogo")) { insertRocket(selectedRocketIcon, result.PRObadge, result.foundEasteregg) }
            })
            //on document changes
            window.addEventListener("load", function () {
                if (!document.getElementById("TUFastLogo")) { insertRocket(selectedRocketIcon, result.PRObadge, result.foundEasteregg) }
            }, true)
        }
    }
})

// variables required for rocket logo easteregg
var GLOBAL_counter = 0              //count clicks on icon
var coutdownRemoveScreenOverlay    //timer
var timeout = 1000  //timeout for timer
var blocker = false //block icon click
var timeUp = true  //true, when time is up
var display_value   //number of text, which shows on screen
var typeOfMsg = ""  //type of message which is displayed

function updateRocketLogo(iconPath) {
    let timestamp = new Date().getTime();
    chrome.runtime.sendMessage({ cmd: 'update_rocket_logo_easteregg'}, function (result) { })
    document.querySelectorAll("#TUFastLogo img")[0].src = chrome.runtime.getURL("" + iconPath) + "?t =" + timestamp;
}

function setProBadge() {
    document.getElementById("TUFastLogo").parentNode.removeChild(document.getElementById("TUFastLogo"))
    chrome.storage.local.set({ PRObadge: "PRO" }, function () { })
    insertRocket("colorful", "PRO")
}

function insertScreenOverlay() {
    try {
        if (!document.getElementById('counter')) {
            let body = document.getElementsByTagName("body")[0]
            let counter = document.createElement("div")
            let container = document.createElement("div")
            container.style.position = "relative"
            counter.id = "counter"
            counter.style.opacity = "1"
            counter.style.fontSize = "150px"
            counter.style.position = 'absolute'
            counter.style.color = "#000000"
            counter.style.top = "50%"
            counter.style.left = "50%"
            counter.style.marginRight = "-50%"
            counter.style.transform = "translate(-50%, -50%)"
            counter.style.zIndex = "99"

            container.appendChild(counter)
            body.prepend(counter)
        }
    } catch (e) { console.log("cannot insert overlay:" + e) }
}

async function logoOnClickEasteregg() {

    //block counting up when text is promted
    if (blocker && !timeUp) return

    GLOBAL_counter++

    //show screen overlay
    if (!document.getElementById('counter')) {
        //insert overlay
        insertScreenOverlay()
    } else {
        //remove existing timeout
        clearTimeout(coutdownRemoveScreenOverlay)
    }

    counter = document.getElementById('counter')
    counter.style.color = funnyColor(counter.style.color, 80)

    //trigger actions based on counter
    switch (GLOBAL_counter) {
        case 10:
            //easteregg finished
            display_value = "&#x1F680; &#x1F680; &#x1F680;"
            typeOfMsg = "text"
            //enable rocketIcon, set selected rocketIcon (RI3)
            chrome.storage.local.set({ foundEasteregg: true }, function () { })
            chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI3", "link": "../assets/icons/RocketIcons/7_128px.png"}' }, function () { })
            chrome.storage.local.get(["availableRockets"], (resp) => {
                let avRockets = resp.availableRockets
                avRockets.push("RI3")
                chrome.storage.local.set({ "availableRockets": avRockets })
            })
            //live-update the logo
            updateRocketLogo("../assets/icons/RocketIcons/7_128px.png")
            //change the onclick function
            document.getElementById("TUFastLogo").onclick = logoOnClick
            break
        default:
            typeOfMsg = "number"
            display_value = GLOBAL_counter
    }

    //decide how to show text
    switch (typeOfMsg) {
        case "number":
            timeout = 1000
            blocker = false
            counter.style.fontSize = "150px"
            break
        case "text":
            counter.style.fontSize = "100px"
            timeout = 3000
            blocker = true
            break
        default:
            //same as number
            timeout = 1000
            blocker = false
            counter.style.fontSize = "150px"
    }

    //populate screen overlay with value
    counter.innerHTML = display_value

    timeUp = false

    coutdownRemoveScreenOverlay = setTimeout(function () {
        counter = document.getElementById('counter')
        counter.parentNode.removeChild(counter)
        timeUp = true
    }, timeout)
}

function logoOnClick() {
    console.log("here")
    if (timeUp) chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' }, function (result) { })
}

function funnyColor(color, step) {
    rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    rgb[1] = parseInt(rgb[1])
    rgb[2] = parseInt(rgb[2])
    rgb[3] = parseInt(rgb[3])
    if (rgb[1] < 255 - step && rgb[2] < 255 - step && rgb[3] < 150 - step) rgb[1] += step
    else if (rgb[2] < 255 - step && rgb[3] < 150 - step) rgb[2] += step
    else if (rgb[3] < 150 - step) rgb[3] += step
    else if (rgb[1] > 0 + step) rgb[1] -= step
    else if (rgb[2] > 0 + step) rgb[2] -= step
    else if (rgb[3] > 0 + step) rgb[3] -= step
    color = "rgb(" + rgb[1] + "," + rgb[2] + "," + rgb[3] + ")"
    return color;
};

function insertRocket(selectedRocketIcon, PRObadge = false, foundEasteregg) {
    let imgUrl, header, logo_node, logo_link, logo_img, badge
    try {
        if (document.getElementsByClassName("page-header")[0] != undefined) {
            header = document.getElementsByClassName("page-header")[0]
            logo_node = document.createElement("h1")
            logo_link = document.createElement("a")
            logo_img = document.createElement("img")
            logo_link.href = "javascript:void(0)"
            logo_node.id = "TUFastLogo"
            logo_link.title = "powered by TUFast. Enjoy :)"

            //onclick function depends on whether easteregg was already found!
            if (foundEasteregg) {
                logo_node.onclick = logoOnClick
            } else {
                logo_node.onclick = logoOnClickEasteregg
            }

            //create rocket icon
            imgUrl = chrome.runtime.getURL("../" + selectedRocketIcon.link)
            logo_img.style.display = "inline-block"
            logo_img.style.width = "37px"
            logo_img.src = imgUrl
            logo_link.appendChild(logo_img)

            //add badge
            switch (PRObadge) {
                case "PRO":
                    logo_link.style.position = "relative"
                    badge = document.createElement("span")
                    badge.classList.add("badge")
                    badge.innerHTML = "PRO"
                    badge.style.fontSize = "0.3em"
                    badge.style.position = "absolute"
                    badge.style.bottom = "0px"
                    badge.style.left = "20px"
                    logo_link.appendChild(badge)
                    break
                default:
                    break
            }

            //append to header
            logo_node.appendChild(logo_link)
            header.append(logo_node)
        }
    }
    catch (e) {
        console.log("Error inserting logo: " + e)
    }
}


//toggle flake state
function flakesSwitchOnClick() {
    chrome.storage.local.get(['flakeState'], function (result) {
        chrome.storage.local.set({ flakeState: !(result.flakeState) }, function () { })
        //careful: this has to be negated, as its toggled
        if (!result.flakeState) {
            document.getElementById("flakeLink").style.color = "black"
            insertFlakes()
        }
        else if (result.flakeState) {
            document.getElementById("flakeLink").style.color = "Grey"
            removeFlakes()
        }
    })
}

function removeFlakes() {
    try {
        document.getElementById("snowflakes").parentNode.removeChild(document.getElementById("snowflakes"))
    } catch (e) { console.log("No snowflakes!: " + e) }
}

function insertFlakes() {
    try {
        if (!document.getElementById("snowflakes")) {
            //create snowflake css
            let snowflakeCss = ".snowflake {color: #fff;font-size: 1em;font-family: Arial, sans-serif;text-shadow: 0 0 5px #000;}@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:9999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}.snowflake:nth-of-type(10){left:25%;-webkit-animation-delay:2s,0s;animation-delay:2s,0s}.snowflake:nth-of-type(11){left:65%;-webkit-animation-delay:4s,2.5s;animation-delay:4s,2.5s}"
            let snowflakeStyle = document.createElement('style')

            //add css to snowflage tag
            if (snowflakeStyle.styleSheet) {
                snowflakeStyle.styleSheet.cssText = snowflakeCss;
            } else {
                snowflakeStyle.appendChild(document.createTextNode(snowflakeCss));
            }

            //add snowflage style tag to website head
            document.getElementsByTagName("Head")[0].appendChild(snowflakeStyle)

            //create snowflake div
            let snowflakes = document.createElement("div")
            snowflakes.classList.add("snowflakes")
            snowflakes.id = "snowflakes"
            snowflakes.setAttribute('aria-hidden', 'true');
            snowflakes.innerHTML = '<div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div>'

            //add snowflake div to website body
            document.getElementsByTagName("Body")[0].prepend(snowflakes)
        }
    } catch (e) { console.log("cannot insert snowFlakes: " + e) }
}

function insertFlakeSwitch(currentlyActivated) {
    if (currentlyActivated === undefined) currentlyActivated = true
    try {
        if (document.getElementsByClassName("page-header")[0] != undefined) {
            header = document.getElementsByClassName("page-header")[0]
            flake = document.createElement("h1")
            flake_link = document.createElement("a")
            flake_link.id = "flakeLink"
            flake_link.style.textDecoration = "none"
            flake_link.href = "javascript:void(0)"
            flake.id = "flake"
            flake_link.title = "Click me. Winter powered by TUfast."
            flake.onclick = flakesSwitchOnClick
            flake.style.paddingTop = "2px"
            flake.style.paddingLeft = "3px"

            if (currentlyActivated) flake_link.style.color = "black"
            if (!currentlyActivated) flake_link.style.color = "Grey"


            flake_link.innerHTML = "❅"
            flake_link.fontSize = "30px"

            //append to header
            flake.appendChild(flake_link)
            header.append(flake)
        }
    }
    catch (e) {
        console.log("Error inserting flakeSwitch: " + e)
    }
}

