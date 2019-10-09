// @include logger.js

// @if showLogs=true
function log(...arguments){
  var _message="";
  //console.log(arguments);
  arguments.forEach(arg=>{
    _message += JSON.stringify(arg);
  })
  if (location.protocol === 'chrome-extension:'){
    Logger.log("BACKGROUND:"+_message)
  }
  else {
    chrome.runtime.sendMessage({ action: "Logger.log", data:{logMessage:"CS:"+_message}}, result=> {});
  }
}
// @endif
// @if showLogs=false
function log() {}
// @endif
