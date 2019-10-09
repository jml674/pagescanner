var Server= {
  getDomForParser:function(url){
    return new Promise(function(resolve, reject) {
      $.get(url,function(result){
        var parser = new DOMParser();
        var doc = parser.parseFromString(result,"text/html");
        resolve(doc);
      },"html").fail(function(jqXHR, textStatus, errorThrown){
          log("Can't get "+url);
          reject({httpCode:jqXHR.status});
        }
      );
    });
  },
  getWithCreds:function(url, headers, data){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        xhrFields: {
          withCredentials: true
        },
        type: 'GET',
        headers: headers,
        processData : false,
        contentType : "text/plain",
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });
    });
  },
  get:function(url, headers, data){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'GET',
        headers: headers,
        processData : false,
        contentType : "text/plain",
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });
    });
  },
  put:function(url, headers, data, contentType="text/plain"){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'PUT',
        headers: headers,
        processData : false,
        contentType : contentType,
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });
    });
  },
  delete:function(url, data){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'DELETE',
        processData : false,
        contentType : "text/plain",
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });
    });
  },
  post:function(url, headers, data,contentType){
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'POST',
        headers: headers,
        processData : false,
        contentType : contentType?contentType:"text/plain",
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: JSON.stringify(data)
      });
    });
  },
  postFormUrlEncoded:function(url,headers, data){
    var serializedData ="";
    //"semail=" + encodeURIComponent(data.semail) +
    //                 "&spassword=" + encodeURIComponent(data.spassword);
    for (var prop in data){
      serializedData += (serializedData.length>0?"&":"")+prop+"="+encodeURIComponent(data[prop]);
    }
    return new Promise(function(resolve, reject) {
      return $.ajax({
        url: url,
        type: 'POST',
        headers: headers,
        //processData : false,
        contentType : "application/x-www-form-urlencoded",
        success: function(result){
          resolve(result);
        },
        error: function( jqXHR,  textStatus,  errorThrown){
          reject({httpCode:jqXHR.status});
        },
        data: serializedData
      });
    });
  },
  getJSON:function(url){
    log("getJSON url: "+url)
    return new Promise(function(resolve, reject) {
      $.get(url,function(result){
          resolve(result); // TBC
      },"json").fail(function(jqXHR, textStatus, errorThrown){
          reject({httpCode:jqXHR.status});
      });
    });
  },
  postForm:function(url,headers,formData){
    return new Promise((resolve,reject)=>{
      $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        enctype: 'multipart/form-data',
        headers: headers,
        cache: false,
        dataType: 'text',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: (data, textStatus, jqXHR) =>{
          resolve(data);
        },
        error: (jqXHR, textStatus, errorThrown) =>{
          // Handle errors here
          reject({httpCode:jqXHR.status, textStatus});
        }
      });
    });
  },
  putForm:function(url,headers,formData){
    return new Promise((resolve,reject)=>{
      $.ajax({
        url: url,
        type: 'PUT',
        data: formData,
        enctype: 'multipart/form-data',
        headers: headers,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: (data, textStatus, jqXHR) =>{
          resolve(data);
        },
        error: (jqXHR, textStatus, errorThrown) =>{
          // Handle errors here
          reject({httpCode:jqXHR.status, textStatus});
        }
      });
    });
  }
};
