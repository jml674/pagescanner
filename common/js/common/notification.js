var notificationMgr= {
  notificationIds:[],
  initialize:function(){
    chrome.notifications.onClosed.addListener((notificationId,byUser)=>{
      //console.log("Notification closed: "+notificationId+" "+byUser);
      var _notif = this.getById(notificationId);
      if (_notif){
        this.notificationIds.splice(_notif.index,1);
        if(!byUser){
          this.display(_notif.title,_notif.message,true);
        }
      }
    })
  },
  _onMessage_display:async function(data, from, reply){
    return this.display(data.title,data.message,data.permanent)
  },
  display:function(title,message,permanent){
    chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/truelogo.png',
            title: title,
            message: message
          }, function (id) {
            if (permanent){
              notification.notificationIds.push({id:id,title:title,message:message});
            }
            //console.log("Notif id:"+ id);
            return id;
          });
  },
  getById:function(notificationId){
    var result = null;
    this.notificationIds.forEach((value,index)=>{
      if (value.id == notificationId){
        result={index:index,title:value.title,message:value.message};
      }
    })
    return result;
  }
}
