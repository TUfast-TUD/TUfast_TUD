console.log('fwd to selma')
chrome.runtime.sendMessage({cmd: "save_clicks", click_count: 1})
window.location.replace("https://selma.tu-dresden.de/APP/EXTERNALPAGES/-N000000000000001,-N000155,-AEXT_willkommen");