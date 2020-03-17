console.log("fwd to opal")
chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
window.location.replace("https://bildungsportal.sachsen.de/opal/shiblogin?0")