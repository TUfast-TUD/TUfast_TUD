document.addEventListener('DOMContentLoaded', function() { 
  if(document.querySelector('.btn-sm[title="Login"]')){
    document.querySelector('.btn-sm[title="Login"]').click()
  }

  //when pop-up shows
  document.addEventListener("DOMNodeInserted", function(e) {
    if(document.getElementsByName("content:container:login:shibAuthForm:shibLogin")){
        document.getElementsByName("content:container:login:shibAuthForm:shibLogin")[0].click()
    }
  }, false);
});

