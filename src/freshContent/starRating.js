/*
    That is a third party file. Original source: https://www.cssscript.com/tiny-star-rating-system/
    Slight modifications where done!
*/


/* myStarCollection.push("className"); */
var mouseClickedStarRating = false
function rateSystem(className, obj, fnc = function () { }, fncMove = function () { }, fncLeave = function () { }) {
    /* window.myStarCollection.push(className); */
    for (let i = 0; i < document.getElementsByClassName(className).length; i++) {

        document.getElementsByClassName(className)[i].style.width = (obj.rating * obj.starSize) + "px"
        document.getElementsByClassName(className)[i].style.height = obj.starSize + "px"
        document.getElementsByClassName(className)[i].style.backgroundSize = obj.starSize + "px"
        document.getElementsByClassName(className)[i].style.backgroundImage = "url('" + obj.starImage + "')"
        document.getElementsByClassName(className)[i].style.backgroundRepeat = "repeat-x"
        document.getElementsByClassName(className)[i].parentElement.style.width = (parseInt(obj.starSize) * parseInt(obj.maxRating)) + "px"
        document.getElementsByClassName(className)[i].parentElement.style.maxWidth = (parseInt(obj.starSize) * parseInt(obj.maxRating)) + "px"
        document.getElementsByClassName(className)[i].parentElement.style.height = parseInt(obj.starSize) + "px"

        if (obj.minRating) {
            document.getElementsByClassName(className)[i].style.minWidth = (obj.minRating * obj.starSize) + "px"
        } else {
            document.getElementsByClassName(className)[i].style.minWidth = "0px"
        }

        if (obj.backgroundStarImage) {
            document.getElementsByClassName(className)[i].parentElement.style.backgroundSize = obj.starSize + "px"
            document.getElementsByClassName(className)[i].parentElement.style.backgroundRepeat = "repeat-x"
            document.getElementsByClassName(className)[i].parentElement.style.backgroundImage = "url('" + obj.backgroundStarImage + "')"
        }

        if (obj.emptyStarImage) {
            document.getElementsByClassName(className)[i].innerHTML = '<div class="emptyStarRating"></div>'
            document.getElementsByClassName(className)[i].getElementsByClassName("emptyStarRating")[0].style.backgroundSize = parseInt(obj.starSize) + "px"
            document.getElementsByClassName(className)[i].getElementsByClassName("emptyStarRating")[0].style.backgroundImage = "url('" + obj.emptyStarImage + "')"
            document.getElementsByClassName(className)[i].getElementsByClassName("emptyStarRating")[0].style.backgroundRepeat = "repeat-x"
            document.getElementsByClassName(className)[i].getElementsByClassName("emptyStarRating")[0].style.width = (parseInt(obj.starSize) * parseInt(obj.maxRating)) + "px"
            document.getElementsByClassName(className)[i].getElementsByClassName("emptyStarRating")[0].style.height = parseInt(obj.starSize) + "px"
        }

        document.getElementsByClassName(className)[i].style.maxWidth = obj.starSize * obj.maxRating + "px"
        /* document.getElementsByClassName(className)[i].title = obj.rating; */
        document.getElementsByClassName(className)[i].dataset.rating = obj.rating
        document.getElementsByClassName(className)[i].dataset.step = obj.step
        if (obj.readOnly === "yes") {
            document.getElementsByClassName(className)[i].classList.add("readOnlyStarRating")
        }
        /*     document.getElementsByClassName(className)[i].innerHTML=obj.rating; */
        document.getElementsByClassName(className)[i].parentElement.addEventListener("mousemove", function () { zmouseMoveStarRating(fncMove) }, false)
        document.getElementsByClassName(className)[i].parentElement.addEventListener("click", function () { zmouseMoveStarRatingClick(fnc) }, false)
        document.getElementsByClassName(className)[i].parentElement.addEventListener("mouseleave", function () { zmouseMoveStarRatingLeave(fncLeave) }, false)

        document.getElementsByClassName(className)[i].parentElement.addEventListener("touchstart", function () { zmouseMoveStarRatingTouch(fncMove) }, false)
        document.getElementsByClassName(className)[i].parentElement.addEventListener("touchend", function () { zmouseMoveStarRatingLeaveTouch(fnc, fncLeave) }, false)
        document.getElementsByClassName(className)[i].parentElement.addEventListener("touchmove", function () { zmouseMoveStarRatingTouchMove(fncMove) }, false)
    }

}

function zmouseMoveStarRating(fncMove) {
    // if (mouseClickedStarRating == false) {
    if (event.target.classList.contains("starRatingContainer")) {
        let myDiv = event.target.getElementsByTagName("DIV")[0]
        let realStep = parseFloat(myDiv.dataset.step) * parseInt(myDiv.style.backgroundSize)
        realStep = 1 / realStep
        /* console.log(realStep); */

        if (!myDiv.classList.contains("readOnlyStarRating")) {
            if ((event.clientX - myDiv.getBoundingClientRect().left) <= parseInt(myDiv.style.maxWidth)) {
                if ((event.clientX - myDiv.getBoundingClientRect().left) >= parseInt(myDiv.style.minWidth)) {
                    myDiv.style.width = (Math.round((event.clientX - myDiv.getBoundingClientRect().left) * realStep) / realStep) + "px"
                } else {
                    myDiv.style.width = (Math.round((parseInt(myDiv.style.minWidth)) * realStep) / realStep) + "px"
                }
            } else {
                /* myDiv.style.width= myDiv.style.maxWidth;  */
            }
            /* myDiv.title = (parseInt(myDiv.style.width)/parseInt(myDiv.style.backgroundSize)).toFixed(2); */
        }
        fncMove((parseInt(myDiv.style.width) / parseInt(myDiv.style.backgroundSize)).toFixed(2), myDiv, false)

    } else if (event.target.classList.contains("emptyStarRating")) {

        if (!event.target.parentElement.classList.contains("readOnlyStarRating")) {
            if ((event.clientX - event.target.parentElement.getBoundingClientRect().left) <= parseInt(event.target.parentElement.style.maxWidth)) {

                let realStep = parseFloat(event.target.parentElement.dataset.step) * parseInt(event.target.parentElement.style.backgroundSize)
                realStep = 1 / realStep
                /* console.log(realStep); */
                if ((event.clientX - event.target.parentElement.getBoundingClientRect().left) >= parseInt(event.target.parentElement.style.minWidth)) {
                    event.target.parentElement.style.width = (Math.round((event.clientX - event.target.parentElement.getBoundingClientRect().left) * realStep) / realStep) + "px"
                } else {
                    event.target.parentElement.style.width = (Math.round((parseInt(event.target.parentElement.style.minWidth)) * realStep) / realStep) + "px"
                }
            } else {
                /* event.target.style.width =  event.target.style.maxWidth; */
            }
            /* event.target.title = (parseInt(event.target.parentElement.style.width)/parseInt(event.target.parentElement.style.backgroundSize)).toFixed(2); */
        }
        fncMove((parseInt(event.target.parentElement.style.width) / parseInt(event.target.parentElement.style.backgroundSize)).toFixed(2), event.target.parentElement, false)

    } else {

        if (!event.target.classList.contains("readOnlyStarRating")) {
            if ((event.clientX - event.target.getBoundingClientRect().left) <= parseInt(event.target.style.maxWidth)) {

                let realStep = parseFloat(event.target.dataset.step) * parseInt(event.target.style.backgroundSize)
                realStep = 1 / realStep
                /* console.log(realStep); */
                if ((event.clientX - event.target.getBoundingClientRect().left) >= parseInt(event.target.style.minWidth)) {
                    event.target.style.width = (Math.round((event.clientX - event.target.getBoundingClientRect().left) * realStep) / realStep) + "px"
                } else {
                    event.target.style.width = (Math.round((parseInt(event.target.style.minWidth)) * realStep) / realStep) + "px"
                }
            } else {
                /* event.target.style.width =  event.target.style.maxWidth; */
            }
            /* event.target.title = (parseInt(event.target.style.width)/parseInt(event.target.style.backgroundSize)).toFixed(2); */
        }
        fncMove((parseInt(event.target.style.width) / parseInt(event.target.style.backgroundSize)).toFixed(2), event.target, false)

    }
    // }
}



function zmouseMoveStarRatingClick(fnc) {
    if (event.target.classList.contains("starRatingContainer")) {
        let myDiv = event.target.getElementsByTagName("DIV")[0]
        if (!myDiv.classList.contains("readOnlyStarRating")) {
            mouseClickedStarRating = true
            myDiv.dataset.rating = (parseInt(myDiv.style.width) / parseInt(myDiv.style.backgroundSize)).toFixed(2)
            fnc(myDiv.dataset.rating, myDiv, false)
        }
    } else if (event.target.classList.contains("emptyStarRating")) {
        if (!event.target.parentElement.classList.contains("readOnlyStarRating")) {
            mouseClickedStarRating = true
            event.target.parentElement.dataset.rating = (parseInt(event.target.parentElement.style.width) / parseInt(event.target.parentElement.style.backgroundSize)).toFixed(2)
            fnc(event.target.parentElement.dataset.rating, event.target.parentElement, false)
        }
    } else {
        if (!event.target.classList.contains("readOnlyStarRating")) {
            mouseClickedStarRating = true
            event.target.dataset.rating = (parseInt(event.target.style.width) / parseInt(event.target.style.backgroundSize)).toFixed(2)
            fnc(event.target.dataset.rating, event.target, false)
        }
    }
}


function zmouseMoveStarRatingLeave(fncLeave) {
    if (!event.target.classList.contains("starRatingContainer")) {
        /*    if(!event.target.classList.contains("readOnlyStarRating")){
       event.target.style.width=event.target.dataset.rating*parseInt(event.target.style.backgroundSize)+"px";
       mouseClickedStarRating=false;
           } */
    } else {
        let myDiv = event.target.getElementsByTagName("DIV")[0]
        if (!myDiv.classList.contains("readOnlyStarRating")) {
            myDiv.style.width = myDiv.dataset.rating * parseInt(myDiv.style.backgroundSize) + "px"
            mouseClickedStarRating = false
        }
        fncLeave((parseInt(myDiv.style.width) / parseInt(myDiv.style.backgroundSize)).toFixed(2), myDiv, false)
    }
}


function zmouseMoveStarRatingTouch(fncMove) {
    try {
        event.preventDefault()
    } catch (err) {

    }

    if (event.target.classList.contains("starRatingContainer")) {

        let myDiv = event.target.getElementsByTagName("DIV")[0]
        fncMove((parseInt(myDiv.style.width) / parseInt(myDiv.style.backgroundSize)).toFixed(2), myDiv, true)

    } else if (event.target.classList.contains("emptyStarRating")) {

        fncMove((parseInt(event.target.parentElement.style.width) / parseInt(event.target.parentElement.style.backgroundSize)).toFixed(2), event.target.parentElement, true)

    } else {
        fncMove((parseInt(event.target.style.width) / parseInt(event.target.style.backgroundSize)).toFixed(2), event.target, true)
    }

}

function zmouseMoveStarRatingLeaveTouch(fnc, fncLeave) {

    if (event.target.classList.contains("starRatingContainer")) {
        let myDiv = event.target.getElementsByTagName("DIV")[0]
        if (!myDiv.classList.contains("readOnlyStarRating")) {
            if ((event.changedTouches[0].clientX - myDiv.getBoundingClientRect().left) <= parseInt(myDiv.style.maxWidth)) {
                let realStep = parseFloat(myDiv.dataset.step) * parseInt(myDiv.style.backgroundSize)
                realStep = 1 / realStep
                if ((event.changedTouches[0].clientX - myDiv.getBoundingClientRect().left) >= parseInt(myDiv.style.minWidth)) {
                    myDiv.style.width = (Math.round((parseInt(event.changedTouches[0].clientX) - parseInt(myDiv.getBoundingClientRect().left)) * realStep) / realStep) + "px"
                } else {
                    myDiv.style.width = (Math.round((parseInt(myDiv.style.minWidth) * realStep)) / realStep) + "px"
                }
            } else {
                myDiv.style.width = myDiv.style.maxWidth
            }
            myDiv.dataset.rating = (parseInt(myDiv.style.width) / parseInt(myDiv.style.backgroundSize)).toFixed(2)
            fnc(myDiv.dataset.rating, myDiv, true)
        }
        fncLeave(myDiv.dataset.rating, myDiv, true)
    } else if (event.target.classList.contains("emptyStarRating")) {
        if (!event.target.parentElement.classList.contains("readOnlyStarRating")) {
            if ((event.changedTouches[0].clientX - event.target.parentElement.getBoundingClientRect().left) <= parseInt(event.target.parentElement.style.maxWidth)) {

                let realStep = parseFloat(event.target.parentElement.dataset.step) * parseInt(event.target.parentElement.style.backgroundSize)
                realStep = 1 / realStep
                if ((event.changedTouches[0].clientX - event.target.parentElement.getBoundingClientRect().left) >= parseInt(event.target.parentElement.style.minWidth)) {
                    event.target.parentElement.style.width = (Math.round((parseInt(event.changedTouches[0].clientX) - parseInt(event.target.parentElement.getBoundingClientRect().left)) * realStep) / realStep) + "px"
                } else {
                    event.target.parentElement.style.width = (Math.round((parseInt(event.target.parentElement.style.minWidth)) * realStep) / realStep) + "px"
                }

            } else {
                event.target.parentElement.style.width = event.target.parentElement.style.maxWidth
            }
            event.target.parentElement.dataset.rating = (parseInt(event.target.parentElement.style.width) / parseInt(event.target.parentElement.style.backgroundSize)).toFixed(2)
            fnc(event.target.parentElement.dataset.rating, event.target.parentElement, true)
        }
        fncLeave(event.target.parentElement.dataset.rating, event.target.parentElement, true)

    } else {

        if (!event.target.classList.contains("readOnlyStarRating")) {
            if ((event.changedTouches[0].clientX - event.target.getBoundingClientRect().left) <= parseInt(event.target.style.maxWidth)) {

                let realStep = parseFloat(event.target.dataset.step) * parseInt(event.target.style.backgroundSize)
                realStep = 1 / realStep
                if ((event.changedTouches[0].clientX - event.target.getBoundingClientRect().left) >= parseInt(event.target.style.minWidth)) {
                    event.target.style.width = (Math.round((parseInt(event.changedTouches[0].clientX) - parseInt(event.target.getBoundingClientRect().left)) * realStep) / realStep) + "px"
                } else {
                    event.target.style.width = (Math.round((parseInt(event.target.style.minWidth)) * realStep) / realStep) + "px"
                }

            } else {
                event.target.style.width = event.target.style.maxWidth
            }
            event.target.dataset.rating = (parseInt(event.target.style.width) / parseInt(event.target.style.backgroundSize)).toFixed(2)
            fnc(event.target.dataset.rating, event.target, true)
        }
        fncLeave(event.target.dataset.rating, event.target, true)

    }
}

function zmouseMoveStarRatingTouchMove(fncMove) {

    if (event.target.classList.contains("starRatingContainer")) {

        let myDiv = event.target.getElementsByTagName("DIV")[0]
        if (!myDiv.classList.contains("readOnlyStarRating")) {
            if ((event.changedTouches[0].clientX - myDiv.getBoundingClientRect().left) <= parseInt(myDiv.style.maxWidth)) {
                let realStep = parseFloat(myDiv.dataset.step) * parseInt(myDiv.style.backgroundSize)
                realStep = 1 / realStep
                myDiv.style.width = (Math.round((parseInt(event.changedTouches[0].clientX) - parseInt(myDiv.getBoundingClientRect().left)) * realStep) / realStep) + "px"
            } else {
                myDiv.style.width = myDiv.style.maxWidth
            }

        }
        fncMove((parseInt(myDiv.style.width) / parseInt(myDiv.style.backgroundSize)).toFixed(2), myDiv, true)

    } else if (event.target.classList.contains("emptyStarRating")) {
        if (!event.target.parentElement.classList.contains("readOnlyStarRating")) {
            if ((event.changedTouches[0].clientX - event.target.parentElement.getBoundingClientRect().left) <= parseInt(event.target.parentElement.style.maxWidth)) {
                let realStep = parseFloat(event.target.parentElement.dataset.step) * parseInt(event.target.parentElement.style.backgroundSize)
                realStep = 1 / realStep
                event.target.parentElement.style.width = (Math.round((parseInt(event.changedTouches[0].clientX) - parseInt(event.target.parentElement.getBoundingClientRect().left)) * realStep) / realStep) + "px"
            } else {
                event.target.parentElement.style.width = event.target.parentElement.style.maxWidth
            }

        }
        fncMove((parseInt(event.target.parentElement.style.width) / parseInt(event.target.parentElement.style.backgroundSize)).toFixed(2), event.target.parentElement, true)
    } else {

        if (!event.target.classList.contains("readOnlyStarRating")) {
            if ((event.changedTouches[0].clientX - event.target.getBoundingClientRect().left) <= parseInt(event.target.style.maxWidth)) {
                let realStep = parseFloat(event.target.dataset.step) * parseInt(event.target.style.backgroundSize)
                realStep = 1 / realStep
                event.target.style.width = (Math.round((parseInt(event.changedTouches[0].clientX) - parseInt(event.target.getBoundingClientRect().left)) * realStep) / realStep) + "px"
            } else {
                event.target.style.width = event.target.style.maxWidth
            }

        }
        fncMove((parseInt(event.target.style.width) / parseInt(event.target.style.backgroundSize)).toFixed(2), event.target, true)

    }

}