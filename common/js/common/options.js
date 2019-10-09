var Options = {
  set:function(options){
    return this.get().then(_options=>{
        for (var prop in options) {
          _options[prop]=options[prop];
        }
        chrome.storage.local.set( _options, function() {
          // Update status to let user know storage were saved.
          return true;
        });
    });
  },
  get:function(){
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get({
        debugUseDevUrl:false,
        userName: "",
        password:"",
        token: null,
        logged: false,
        deactivatedSites: "",
        //deactivatedAll: false,
        detectLanguage: true,
        forcedLanguage: "fr",
      }, function(storage) {
        resolve(storage);
      });
    });
  },
  setListener:function(callback){
    chrome.storage.onChanged.addListener((changes, areaname) => {
      this.get().then(options => {
        return callback(options);
      })
    });
  }
};
