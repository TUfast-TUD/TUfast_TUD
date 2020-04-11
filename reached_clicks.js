//this need to be done here since manifest v2
window.onload = function(){
  
  if(document.getElementById("WebStoreLink")) {
    var WebStoreLink = document.getElementById("WebStoreLink");
    WebStoreLink.addEventListener('click', review_submitted, false);
  }

  if(document.getElementById("EMailLink")){
    var EMailLink = document.getElementById("EMailLink");
    EMailLink.addEventListener('click', review_submitted, false);
  }

  //for reached_100_clicks.html show this, if screen has been shown a number of times.
  if (document.getElementById('nicht_mehr_anzeigen')) {
    chrome.storage.local.get(['showed_feedback_screen_counter'], (result) => {
      //show decline button
      if (result.showed_feedback_screen_counter > 2) {
        document.getElementById("nicht_mehr_anzeigen").style.display = "block"
        document.getElementById("nicht_mehr_anzeigen").onclick = function(){
          chrome.storage.local.set({refused_review: true}, function() {})
          console.log('Too sad. Thanks anyway for using the App!')
          document.getElementById("nicht_mehr_anzeigen").innerText = "Gespeichert. Du kannst das Fenster nun schliessen!"
        }  
      }
    })
  }
}

function review_submitted() {
  chrome.storage.local.set({submitted_review: true}, function() {})
  console.log('Detected review submition. Thanks!')
}
