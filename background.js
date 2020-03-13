'use strict';

//executes, when pages is called
/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(changeInfo.url != null){
    if (changeInfo.url.includes('https://bildungsportal.sachsen.de/opal/')) {
      calledOpalUrl();
      chrome.tabs.sendMessage( tabId, {
        message: 'hello',
        url: changeInfo.url
      })
    }
  }
});
*/

//executes, when page is loaded
/*
chrome.webNavigation.onCompleted.addListener(function(details) {
  console.log("detected opal call in bg-script!")
  chrome.tabs.sendMessage(details.tabId, {request: "request"}, function(resp){
    console.log('Got reply in bg-script: ' + resp.reply)
  })
}, {url: [{urlMatches : 'https://bildungsportal.sachsen.de/opal/'}]});


function calledOpalUrl() {
  console.log("detected opal call in bg-script (Ext function)!")
}
*/

// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


