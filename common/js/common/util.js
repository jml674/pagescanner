function stringToSet(value){
  if(value=="") return new Set();
  return new Set(JSON.parse(value));
}

function getShortNameFromUrl(url){
  log("getShortNameFromUrl: entering")
  var _result = "";
  var _sites = Array.from(appMgr._siteConfigsByShortname)
  .filter(site=>{
    return (url.search(site[1].url)!=-1);
  });
  if (_sites.length) _result = _sites[0][0];
  log("getShortNameFromUrl: exiting"+_result)
  return _result;
}
//@if browser="chrome"

function readFile(filename){
  return new Promise((resolve,reject)=>{
    chrome.runtime.getPackageDirectoryEntry(function(root) {
      root.getFile(filename, {}, (fileEntry) => {
        fileEntry.file((file) => {
          var reader = new FileReader();
          reader.onloadend = function(e) {
            // contents are in this.result
            resolve(this.result);
          };
          reader.readAsText(file);
        }, (error)=>{log("ERROR: readFile ",e)});
      }, (error)=>{log("ERROR: readFile ",e)});
    });
  })
}
//@endif
//@if browser="firefox"
function readFile(filename){
  console.log("readFile: "+filename)
  return new Promise((resolve,reject)=>{
    var xhr = new XMLHttpRequest;
    xhr.open("GET", chrome.runtime.getURL(filename));
    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        //log("request finished, now parsing"+xhr.responseText);
        resolve(xhr.responseText);
      }
    };
    xhr.send();
  });
}
//@endif
