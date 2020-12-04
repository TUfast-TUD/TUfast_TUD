chrome.storage.local.get(['isEnabled' ,'fwdEnabled', 'flakeState'], function (result) {
    if (result.isEnabled || result.fwdEnabled) {


        let christmasTime = true
        
        //determine whether its christmas time <3
        let d = new Date()
        let month = d.getMonth() + 1 //starts at 0
        let day = d.getDate()
        if (month === 12 && day > 15 && day < 27) christmasTime = true

        //switch flakeState to true in november
        if (month === 11) chrome.storage.local.set({ flakeState: true }, function () { })

        //only show at christmas time
        if (christmasTime) {
            //on load
            document.addEventListener("DOMNodeInserted", function(e) {
                if (!document.getElementById("flake") && document.getElementById("TUFastLogo")) { //set behind tufast logo
                    insertFlakeSwitch(result.flakeState)
                } 
            })
            //on document changes
            window.addEventListener("load", function() {
                if (!document.getElementById("flake") && document.getElementById("TUFastLogo")) { //set behind tufast logo
                    insertFlakeSwitch(result.flakeState)
                    
                }
            }, true) 
        }
    }
})

//toggle flake state
function snowFlakeOnClick() {
    chrome.storage.local.get(['flakeState'], function (result) {
        chrome.storage.local.set({ flakeState: !(result.flakeState) }, function () {})
        //careful: this has to be negated, as its toggled
        if (!result.flakeState) {
            document.getElementById("flakeLink").style.color = "black"
            insertFlakes()
        }
        else if (result.flakeState) {
            document.getElementById("flakeLink").style.color = "grey"
            removeFlakes()
        }
    })
}

function removeFlakes(){
    try {
        document.getElementById("snowflakes").parentNode.removeChild(document.getElementById("snowflakes"))
    }catch(e){console.log("No snowflakes!: " + e )}
}

function insertFlakes(){
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
}

function insertFlakeSwitch(currentlyActivated) {
    if (currentlyActivated === undefined) currentlyActivated = true
    try {
        if(document.getElementsByClassName("page-header")[0] != undefined){
            header = document.getElementsByClassName("page-header")[0]
            flake = document.createElement("h1")
            flake_link = document.createElement("a")
            flake_link.id = "flakeLink"
            flake_link.style.textDecoration ="none"
            flake_link.href = "javascript:void(0)"
            flake.id = "flake"
            flake_link.title = "Switch flakes on/off."
            flake.onclick = snowFlakeOnClick
            flake.style.paddingTop = "2px"
            flake.style.paddingLeft = "3px"
            
            if (currentlyActivated) flake_link.style.color = "black"
            if (!currentlyActivated) flake_link.style.color = "LightGray"
            

            flake_link.innerHTML = "❅"
            flake_link.fontSize="30px"

            //append to header
            flake.appendChild(flake_link)
            header.append(flake)
        }
    }
    catch (e) {
        console.log("Error inserting flakeSwitch: " + e)
    }
}