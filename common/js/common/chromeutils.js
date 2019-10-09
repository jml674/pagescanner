function chromeGetCurrentTab(){
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({active:true, currentWindow: true},(tabs)=>{
      resolve(tabs.length?tabs[0]:null);
    })
  });
}

function chromeSendMessage(action, data){
  return new Promise(function(resolve, reject) {
    chrome.runtime.sendMessage({ action, data}, result=> {
      resolve(result)
    });
  });
}

function chromeExecuteScript(tabId, details) {
  return new Promise((resolve, reject)=> {
    chrome.tabs.executeScript(tabId, details, result=> {
      if (chrome.runtime.lastError) {
        console.warn("chromeExecuteScript: EXCEPTION injecting ",details)
        return reject(chrome.runtime.lastError);
      }
      //console.log("chromeExecuteScript: OK injecting ",details)
      return resolve(result);
    });
  });
}
