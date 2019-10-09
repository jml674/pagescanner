var Logger = {
  _url:"https://tvsurftv.com/LOGSERVER/log.php",
  _log: false,
  initialize:function(){
    if (typeof Messenger != 'undefined'){
      Messenger.addReceiver("Logger",Logger);
    }
  },
  _onMessage_log:function(data, from, reply){
    this.log("CONTENT_SCRIPT:"+data.logMessage);
  },
  log:function(...args){
    var _message = args.reduce((accumulator,arg)=>{
      return accumulator+(accumulator.length?",":"")+(typeof arg == 'object' ? JSON.stringify(arg):arg);
    });
    if (this._log){
      console.log(_message)
      this._post(this._url,chrome.runtime.getManifest().version+" "+_message).catch(e=>{
        console.log("Logger exception:",e);
      })
    }
  },
  _post:function(url, data){
    var _now = new Date();
    return new Promise((resolve, reject) => {
      return $.ajax({
        url: url,
        type: 'POST',
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: 'log=' + data+'&appname=pagescanneraddon&timestamp='+_now.getHours()+":"+_now.getMinutes()+":"+_now.getSeconds()+":"+_now.getMilliseconds(),
      });
    });
  },
}
Logger.initialize();
