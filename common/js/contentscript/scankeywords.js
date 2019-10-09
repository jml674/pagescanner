// @include ../common/emitter.js
// @include icons.js
// @include dom.js
// @include observer.js
// @include ../common/chromeutils.js
// @include ../common/options.js
// @include ../common/util.js

console.log("Entering scankeywords.js")
var scriptMgr = {
  _visibilityObserver:null,
  _runsAtDocumentStart: true,
  _mutationObserver:null,
  initialize:async function(){
    // we have to set observers even if user has deactivated for the sites
    // because it will be to late if we wait for checking Options
    // and will miss some events.
    this.setObservers();
    var _options = await Options.get();
    var _deactivatedSites = stringToSet(_options.deactivatedSites);
    var _language = this.recognizeLanguage();
    chromeSendMessage("appMgr.pageStart",{}).then(result=>{
      var _siteName = result.data;
      if (!_deactivatedSites.has(_siteName)){
        scheduler.start((element)=>{
          chrome.runtime.sendMessage({ action: "appMgr.checkText",
              data:{text:element.textContent, language:_language}}, result=>{
                if (result.data && result.data.length){
                  //console.log("checkText: result=",result)
                  result.data.forEach((snippet,index)=>{
                    DOMexplorer.processElement(element,snippet.title, snippet.linkUrl, snippet.linkLabel, snippet.description,snippet.etymology);
                  })
                  //$(element).css("background","red")
                }
              }
          );
        })
      }
      else{
        // then we deactivate all events processing
        scheduler.emptyPipe();
        this.unsetObservers();
      }
    });
  },
  setObservers:function(){
    var _targets = [];
    if (!this._runsAtDocumentStart){
      _targets = DOMexplorer.from(document.querySelector("body"));
    }
    this._visibilityObserver = new VisibilityObserver();
    /*if (_targets.length){*/
      this._visibilityObserver.observe(_targets,"VisibilityChanged",true);
    /*}*/
    this._mutationObserver = new MutObserver();
    this._mutationObserver.observe(document,"NodeCreation","NodeDeletion");
    Emitter.on(this,"VisibilityChanged");
    Emitter.on(this,"NodeCreation");
  },
  unsetObservers:function(){
    this._visibilityObserver.disconnect();
    this._mutationObserver.disconnect();
  },
  recognizeLanguage:function(){
    var _language = $("html").attr("lang");
    if (_language == ""){
      document.URL.split(".").forEach((subpart)=>{
        switch(subpart){
          case "de": _language ="de";
          break;
          case "uk": _language ="en";
          break;
        }
      })
    }
    return _language;
  },
  _onEventVisibilityChanged:function(target){
    //console.log("_onEventVisibilityChanged: text:"+target.textContent,target)
    scheduler.addToPipe(target)
  },
  _onEventNodeCreation:function(event){
    if (false) console.log("_onEventNodeCreation: entering children:",event.childList);
    event.childList.forEach(child =>{
      if ($(child).is("[role='tooltip']")|| $(child).is("[class^='mwe-']")|| $(child).parents("[class^='mwe-']").length
|| child.nodeType != Node.ELEMENT_NODE || child.ignoreAtCreation){

      }
      else{
        var _newTargets = DOMexplorer.from(child);
        if (_newTargets.length){
          this._visibilityObserver.addEntries(_newTargets);
        }
      }
    })
  },
};
const PROCESS_DELAY = 10; // time given to browser to breathe (can be reduced)
var scheduler = {
  _pipe:[],
  _callback:null,
  start:function(callback){
    this._callback = callback;
    this.processPipe();
  },
  processPipe:function(){
    if (this._pipe.length){
      var _element = this._pipe[0];
      this._callback(_element);
      this._pipe = this._pipe.slice(1);
    }
    setTimeout(()=>{
      this.processPipe();
    },PROCESS_DELAY)
  },
  addToPipe:function(element){
    this._pipe.push(element);
  },
  emptyPipe:function(){
    this._pipe != [];
  }
}
scriptMgr.initialize();
