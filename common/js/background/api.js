// @include ../config.js

var BackendMgr = {
  _serverUrl:"",
  _timerId:null,
  _catalogLastPollingDate: 0,
  initialize:function(){
    this._serverUrl = URLS["serverUrl"];
  },
  getUrl:function(urlType){
    var _language = (window.navigator.userLanguage || window.navigator.language).toLowerCase();
    var _url = URLS[urlType].get(_language);
    return this._serverUrl+(_url?_url:URLS[urlType].get("en-en"));
  },
  lastModifiedDate:function(url){
    return new Promise((resolve, reject) => {
      $.ajax({url: url, type:"HEAD"}).done((d, s, xhr) => {
        let date = Date.parse(xhr.getResponseHeader("Last-Modified"))
        resolve(date)
      }).fail((xhr, s, err) => {
        reject(s)
      })
    })
  },
  getDataFromFileIfChanged:async function(url){
    var _headers = {"Accept": "application/json"};
    //_headers.Authorization="Bearer " +this._accessToken;
    var _date = await this.lastModifiedDate(url);
    //console.log("Date modified:"+new Date(_date))
    if (this._catalogLastPollingDate > _date){
      //console.log("getCatalog:no change")
      return {success:true,status:"unchanged"};
    }
    //console.log("getCatalog:polling file")
    return new Promise((resolve, reject) => {
      $.ajax({
              url: url,
              success: (data)=>{
                this._catalogLastPollingDate = new Date().getTime();
                try{
                  //data = JSON.parse(data);
                }
                catch(e){
                  reject({success:false,error:e})
                }
                resolve({success:true,data,status:"changed"});
              },
              error: (err)=>{
                reject({success:false,error:err});
              }
      });
    })
  },
}
BackendMgr.initialize();
