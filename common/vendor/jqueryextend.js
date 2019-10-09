function setJSextenders(){
  // Extends jQuery to match text contents
  //console.log("setJSextenders: entering");
  $.expr[':'].textEquals = function(el, i, m) {
    var searchText = m[3];
    var match = $(el).text().trim().match("^" + searchText + "$")
    return match && match.length > 0;
  };
  $.expr[':'].textMatchRegexp = function(el, i, m) {
    var searchText = m[3];
    var match = $(el).text().trim().match(new RegExp(searchText))
    return match && match.length > 0;
  };
  $.expr[':'].textBigger = function(el, i, m) {
    try{
      var arg = m[3];
      var match = parseInt($(el).text()) > parseInt(arg);
    }
    catch(e){
      console.log("EXCEPTION:",e)
    }
    return match;
  };
}
