//document.addEventListener('DOMContentLoaded', function() { 
  //when pop-up shows
  document.addEventListener("DOMNodeInserted", function(e) {
    if(document.getElementsByName("content:container:login:shibAuthForm:shibLogin")[0]){
      chrome.runtime.sendMessage({cmd: "show_badge"});  
      document.getElementsByName("content:container:login:shibAuthForm:shibLogin")[0].click()
    }
  }, false);
//});

$(document).ready(function() {
  if(document.getElementsByClassName('btn btn-sm')[1].innerText.includes('Login')){
    chrome.runtime.sendMessage({cmd: "show_badge"});
    document.getElementsByClassName('btn btn-sm')[1].click()
  }
})

