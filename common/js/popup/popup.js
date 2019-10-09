// @include ../common/options.js
// @include ../common/util.js
// @include i18n.js

var popupMgr = {
  _options:null,
  _siteShortName:null,
  _deactivatedSites:null,
  initialize:async function(){
    this._options = await Options.get();
    this._deactivatedSites = stringToSet(this._options.deactivatedSites);
    //console.log("Deactivated set =",this._deactivatedSites)
    chrome.runtime.sendMessage({action:"appMgr.getSiteShortName",data:{}}, (result)=>{
      //console.log("popupMgr.initialize: site shortName:",result.data)
      this._siteShortName = result.data;
      //console.log("popupMgr.initialize: entering ",this._options)
      $("#detectLanguage").prop('checked',(this._options.detectLanguage?true:false));
      $("#languageSelectionContainer").css("display",this._options.detectLanguage?"none":"");
      $("#detectLanguage").change((event)=>{
        var _value = $(event.target).prop('checked');
        var _optionName = event.target.id;
        Options.set({[event.target.id]:_value})
        $("#languageSelectionContainer").css("display",_value?"none":"");
      });
      $(`[name='languageUsed'][value='${this._options.forcedLanguage}']`).prop('checked',true);
      $("[name='languageUsed']").change((event)=>{
        var _value = $(event.target).prop('checked');
        Options.set({"forcedLanguage":$(event.target).attr("value")})
      });

      $("#gotopagescanner").click(event =>{
        chrome.runtime.sendMessage({action:"appMgr.updateTab",data:{url:$(event.currentTarget).attr("href")}}, (result)=>{
        });
      });
      if (this._siteShortName) this.renderSiteActivation(this._siteShortName);
    })
  },
  renderSiteActivation:function(siteShortName){
    var _container = $("#siteActivationContainer");
    var _toggle = $("<input>",{type:"checkbox"});
    _container.append(_toggle);
    var _span = $("<span>",{text:chrome.i18n.getMessage("DisableForThisSite")+" ("+siteShortName+")"});
    _container.append(_span);
    var _value = this._deactivatedSites.has(siteShortName);
    _toggle.prop('checked',_value);
    _toggle.change((event)=>{
      var _value = $(event.target).prop('checked');
      var _optionName = event.target.id;
      //console.log("Value changing for: "+event.target.id+" value:"+_value);
      _value ? this._deactivatedSites.add(siteShortName):this._deactivatedSites.delete(siteShortName);
      Options.set({deactivatedSites:JSON.stringify(Array.from(this._deactivatedSites.values()))});
      chrome.runtime.sendMessage({action:"addonAnalyticsMgr.send",
        data:{hitType:"event",eventCategory:"configuration",eventAction:_value?"disable":"enable",eventLabel:siteShortName }}, (result)=>{
      });
    });
  }
};

$(function() {
  popupMgr.initialize();
});
