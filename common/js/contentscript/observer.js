class VisibilityObserver {
  constructor(){
    this._observerConfig = {
      root: null,
      rootMargin: '0px',
      //threshold: this.buildPercentages()
      threshold: 0.001
    };
    this._observerSet=false;
    this._eventToEmit = null;
    this._observer = new IntersectionObserver((entries, observer)=>{
      //console.log("VisibilityObserver: ",entries);
      entries.some(entry => {
        if (entry.isIntersecting){
          //console.log("Target becoming visible: ",entry.target);
          Emitter.emit(this._eventToEmit,entry.target)
          this._observer.unobserve(entry.target);
        }
      });
    }, this._observerConfig);
  }
  buildPercentages(){
    var _percentages = [];
    for (var i=0;i<100;i+=1){
      _percentages[i] = i/100.0;
    }
    return _percentages;
  }
  addEntries(entries){
    entries.forEach(entry =>{
      this._observer.observe(entry, this._observerConfig);
    })
  }
  observe(targets,eventToEmit,unobserveAfter){
    if (this._observerSet){
      console.log("Changing observed target to "+targets);
      this.disconnect();
    }
    console.log("VisibilityObserver: observe "+targets);

    //this._observer.observe(targets[0], this._observerConfig);
    targets.forEach(target=>{
      this._observer.observe(target, this._observerConfig);
    })
    this._observerSet=true;
    this._unobserveAfter = unobserveAfter;
    this._targets=targets;
    this._eventToEmit = eventToEmit;
  }
  disconnect(){
    //Empties the MutationObserver instance's record queue and returns what was in there.
    this._observer.takeRecords();
    // Stops the MutationObserver instance from receiving notifications of DOM mutations.
    this._observer.disconnect();
    console.log("Disconnecting visibility observer");
  }
}


class MutObserver {
  constructor(){
    this._observerConfig = {
        // we are tracking children insertions within the table of sources
        childList: true,
        // we are tracking visibility changes
        //attributes: true,
        //attributeOldValue: true,
        // yes, we are interested into chnges in the descendeants of target ...
        subtree: true,
        //attributeFilter: ['class','style'],
     };
    this._observerSet=false;
    this._eventToEmit = null;
    this._observer =  new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        var _result = false;
        var _blackListedTagNames = ["SCRIPT","STYLE","HEAD","HTML","TITLE"];
        switch (mutation.type) {
          case "childList":
          if (mutation.addedNodes.length && _blackListedTagNames.indexOf(mutation.target.tagName) == -1){
            Emitter.emit(this._creationEventToEmit, {childList:mutation.addedNodes, target: mutation.target});
          }
          return;
          if (mutation.removedNodes.length && _blackListedTagNames.indexOf(mutation.target.tagName) == -1){
            Emitter.emit(this._deletionEventToEmit, {childList:mutation.removedNodes, target: mutation.target});
          }
          break;
          case "attributes":
            return;
            if (mutation.target == this._target || $JSPLIKITY.contains(mutation.target,this._target)){
              console.log("Testing condition "+this._testCallback(this._target))
              // we wait a bit for the field to be visible
              // once the expected class/Style change has happened
              setTimeout(()=>{
                if (this._testCallback(this._target)){
                  this._callback();
                }
              },200)

            }
            break;
          default:
        }
        return _result;
      });
    });
  }
  observe(target,creationEventToEmit,deletionEventToEmit){
    if (this._observerSet){
      console.log("MutObserver.observe: Changing observed target to "+target);
      this.disconnect();
    }
    this._creationEventToEmit = creationEventToEmit;
    this._deletionEventToEmit = deletionEventToEmit;
    this._observer.observe(target, this._observerConfig);
    this._target = target;
    this._observerSet=true;
  }
  disconnect(){
    //Empties the MutationObserver instance's record queue and returns what was in there.
    this._observer.takeRecords();
    // Stops the MutationObserver instance from receiving notifications of DOM mutations.
    this._observer.disconnect();
    console.log("Disconnecting observer");
  }
};
