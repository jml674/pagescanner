var addonAnalyticsMgr = {
  _queue : [],
  _initialized:true,
  initialize:function(){
    this._sendQueuedInstructions();
  },
  _onMessage_send:async function(data, from, reply){
    this.send(data.hitType,data.eventCategory,data.eventAction,data.eventLabel);
  },
  send:function(hitType,eventCategory,eventAction,eventLabel){
    if (this._initialized){
      analytics.track(eventCategory, {eventAction,eventLabel} );
    }
    else{
      this._queue.push({hitType, eventCategory,eventAction,eventLabel})
    }
  },
  _sendQueuedInstructions:function(){
    this._queue.forEach((event => {
      this.send(event);
    }))
    this._queue = [];
  },
}
!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t,e){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+t+"/analytics.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.1.0";
 analytics.load(YOUR_WRITE_KEY);
 //analytics.page();
 addonAnalyticsMgr.initialize();
 }}();
