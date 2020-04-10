console.log("fwd to magma")
chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
window.location.replace("https://bildungsportal.sachsen.de/magma/")