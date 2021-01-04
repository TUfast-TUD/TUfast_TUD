chrome.storage.local.get(['loggedOutElearningMED'], function (result) {
    console.log(result.loggedOutElearningMED)
    if (!result.loggedOutElearningMED) {
        if (document.readyState !== 'loading') {
            loginElearningMED(result.loggedOutElearningMED)
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                loginElearningMED(result.loggedOutElearningMED)
            })
        }
        console.log('Auto Login to elearning.med.')
    }
})

function loginElearningMED(loggedOutElearningMED) {
    if (document.getElementsByTagName("a")[0].textContent === "Moodle" && location.href === "https://elearning.med.tu-dresden.de/") {
        document.getElementsByTagName("a")[0].click()
        chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
    } else if (location.href === "https://elearning.med.tu-dresden.de/moodle/academiLogin.html" && document.querySelectorAll('[href="https://elearning.med.tu-dresden.de/moodle/auth/shibboleth/index.php"]')[0]) {
        document.querySelectorAll('[href="https://elearning.med.tu-dresden.de/moodle/auth/shibboleth/index.php"]')[0].click()
        chrome.runtime.sendMessage({ cmd: "save_clicks", click_count: 1 })
    }

    //detecting logout
    if (document.getElementById("actionmenuaction-6")) {
        document.getElementById("actionmenuaction-6").addEventListener('click', function () {
            console.log("logout detected!")
            chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutElearningMED' })
        })
    }
}