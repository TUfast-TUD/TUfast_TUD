//this need to be done here since manifest v2
window.onload = function(){
  //detect when user clicks on review link.
  var OneClick = document.getElementById("WebStoreLink");
  OneClick.addEventListener('click', function(){
    chrome.storage.local.set({submitted_review: true}, function() {})
    console.log('Detected review submittion. Thanks!')
  }, false);
}
