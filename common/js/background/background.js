const DEFAULT_LANGUAGE = "fr";
const BROWSER_NAME = navigator.userAgent.toLowerCase().search("chrome")!=-1?"chrome":"firefox";

// @include ../common/emitter.js
// @include ../common/messenger.js
// @include ../common/notification.js

// @include ../common/log.js


log("Pagescanner starting");

//@if env=='development'
// @include hot-reload.js
//@endif


// @include ../common/httputil.js
// @include ../common/options.js
// @include ../common/util.js

// @include ./api.js
// @include ../common/chromeutils.js
// @include analyticmgr.js

function ApplicationInitDebugPhase(){
  return Promise.resolve(true)
}


//==================================================
//
//
//     Misc.
//
//



//@if browser='chrome' || browser='firefox'
var extensionVersion = chrome.runtime.getManifest().version;
var extensionBrowser = 'Chrome';
//@endif
//@if browser='safari'
var extensionVersion = safari.extension.displayVersion;
var extensionBrowser = 'Safari';
//@endif

chrome.runtime.setUninstallURL(BackendMgr.getUrl("uninstall"));

chrome.runtime.onInstalled.addListener(async (details) => {
  Logger.log("AppMgr: running install Handler..."+details.reason);
  console.log("Install details:",details)

  switch(details.reason){
    case "update":
      addonAnalyticsMgr.send("event","UserMgmt",details.reason,extensionVersion);
    break;
    case "install":
      chrome.tabs.update({url:BackendMgr.getUrl("install")});
      addonAnalyticsMgr.send("event","UserMgmt",details.reason,extensionVersion);
    break;
  }
});

var appMgr = {
  _deactivated: false,
  _options: null,
  initialize:async function(){
    log("appMgr.initialize: entering");
    Options.setListener((options) => {
      this._options = options;
      this._deactivatedSites = stringToMap(this._options.deactivatedSites);
      snippetMgr.setLanguage(options.forcedLanguage);
    })
    this._options = await Options.get();
    snippetMgr.initialize(["fr"]);
    Messenger.addReceiver("appMgr",this);
    Messenger.addReceiver("notificationMgr",notificationMgr);
    Messenger.addReceiver("addonAnalyticsMgr",addonAnalyticsMgr);
  },
  error:function(code){
    var _errorMsg = null;
    var _errorMap = new Map([[500,chrome.i18n.getMessage("UnexpectedError")],
                            [401,chrome.i18n.getMessage("WrongCredentials")],
                            [403,chrome.i18n.getMessage("BlockedUser")],
                            [0,chrome.i18n.getMessage("ServerUnreachable")],
                          ])
    _errorMsg = _errorMap.get(code);
    if (_errorMsg == ''){
      _errorMsg = chrome.i18n.getMessage("UnexpectedError");
    }
    return _errorMsg;
  },
  _onMessage_createTab:function(data, from, reply){
    var _url = data.url ? data.url : (data.urlName?apiMgr.getUrl(data.urlName):"null")
    if (_url){
      chrome.tabs.create({url:_url});
    }
    else alert("Url not set yet:"+data.urlName)
  },
  _onMessage_updateTab:async function(data, from, reply){
    var _url = data.url ? data.url : (data.urlName?BackendMgr.getUrl(data.urlName):"null")
    var _tab = await chromeGetCurrentTab();
    if (_url){
      chrome.tabs.update(_tab.id,{url:_url});
    }
    else alert("Url not set yet:"+data.urlName)
  },

  _onMessage_pageStart:function(data, from, reply) {
    log("appMgr._onMessage_pageStart: entering ")

    return this.shortName(from.tab);
  },
  languageUsed:function(language){
    if (this._options.detectLanguage){
      if (language != ""){
        return language;
      }
      else return DEFAULT_LANGUAGE;
    }
    else return this._options.forcedLanguage;
  },
  shortName:function(tab){
    if (tab){
      var _url = new URL(tab.url)
      return _url.host;
    }
    return null;
  },
  _onMessage_getSiteShortName:async function(data,from,reply){
    var _tab = await chromeGetCurrentTab();
    log("_onMessage_getSiteShortName: exiting "+this.shortName(_tab));
    return this.shortName(_tab);
  },

  _onMessage_checkText:function(data, from, reply) {
    var _regexpCleaner = /[,;(){}]/gi
    var _setAlreadyFound = new Set();
    var _regexpSplitter = RegExp('\\S+','g');
    var _splittedWords=[];
    log("appMgr._onMessage_checkText: entering ",data.text);
    if (data.text){
      var _array1;
      while ((_array1 = _regexpSplitter.exec(data.text)) !== null) {
        _splittedWords.push({beginIndex:_array1.index,endIndex:_regexpSplitter.lastIndex, word:_array1[0].trim().replace(_regexpCleaner,"").toUpperCase()})
      }
      //var _processed = data.text.replace(_splitter,' ').trim().toUpperCase().replace(/\s+/g, " ");
      //var _words = _processed.split(" ").map(word => {return word.trim()});
      var _snippets = _splittedWords.map((word,index) =>{
        var _start = new Date().getTime()
        var _exp = snippetMgr.findExpression(data.text,_splittedWords,index,this.languageUsed(data.language));
        if (_exp && !_setAlreadyFound.has(_exp.expression)){
          var _end = new Date().getTime()
          //console.log("time:",_end-_start)
          _setAlreadyFound.add(_exp.expression)
          var _result = Object.assign(_exp.snippet,{title:_exp.expression});
          return _result;
        }
        else return null;
      }).filter(snippet => {
        return snippet!=null;
      });
      return _snippets;
    }
  }
};
appMgr.initialize()
