const PAGESCANNER_CLASSNAME="pagescannerAnchor";


var pageMgr = {
  initialize:function() {
  },
};
pageMgr.initialize();
  /* Possible types of nodes. */
var node_types = new Array (
    "FAKE NODE", // fix array offset
    "ELEMENT NODE",
    "ATTRIBUTE NODE",
    "TEXT NODE",
    "CDATA SECTION NODE",
    "ENTITY REFERENCE NODE",
    "ENTITY NODE",
    "PROCESSING INSTRUCTION NODE",
    "COMMENT NODE",
    "DOCUMENT NODE",
    "DOCUMENT TYPE NODE",
    "DOCUMENT FRAGMENT NODE",
    "NOTATION NODE"
);
var DOMexplorer = {
  from:function (node){
    var _dumpContent=[];
    this.traverseNodes (node,_dumpContent);
    return _dumpContent;
  },
  /* Traverse the sub-nodes of 'node' */
 traverseNodes:function (node, dumpContent){
    if (node.nodeType == Node.TEXT_NODE) {
      //dumpContent.push(node);
      return /[a-zA-Z]/.exec(node.textContent) != null;
    }
    if (node.childNodes && node.childNodes.length) {
      for (var i=0; i<node.childNodes.length; i++){
        var _hasTextChild = this.traverseNodes(node.childNodes.item(i),dumpContent);
        if (_hasTextChild){
          dumpContent.push(node);
          return;
        }
      }
    }
  },
  getTextNodesFrom:function (node){
    var _result=[];
    this.textGetNodes (node,_result);
    return _result;
  },
  textGetNodes:function (node, dumpContent){
     if (node.childNodes && node.childNodes.length) {
       for (var i=0; i<node.childNodes.length; i++){
         var _child = node.childNodes.item(i);
         if (_child.nodeType == Node.TEXT_NODE) {
           //dumpContent.push(node);
           if (/[a-zA-Z]/.exec(_child.textContent) != null){
             dumpContent.push(_child);
           }
         }
       }
     }
     //console.log("textGetNodes: returning ",dumpContent)
   },
  processElement:function(element,title, link, linkLabel, description,etymology){
    var _textNodes = this.getTextNodesFrom(element);
    _textNodes.forEach((node) =>{
      var _regexp = new RegExp (title,"gi");
      var _result;
      var _node = node;
      while ( (_result = _regexp.exec(_node.nodeValue)) ) {
          _node = this.smartInsert(_node, title,_result.index,link,linkLabel, description,etymology);
      }
    })
  },
  smartInsert:function(node,key,pos,link,linkLabel, description,etymology){
    var _anchor = $("<span>",{id:"pagescanner",class:PAGESCANNER_CLASSNAME,"data-link":link,"data-label":linkLabel,"data-description":description})
    _anchor[0].ignoreAtCreation = true;
    var _link = $("<span>",{text:key,id:"pagescanner"});
    _link.ignoreAtCreation = true;
    var _img = $("<img>",{src:iconAnchorData,
      class:"pagescannerIcon",id:"pagescanner"});
    _link.appendTo(_anchor);
    _img.appendTo(_anchor);
    /*_img.tooltip({
      animation:true,
      html:true,
      title: (tooltip)=>{
        return "LAMBERT"
      }
    });*/
    var _title = `<div id="content" class="pagescannerContent">
			<div id="pagescannerHeader" class="pagescannerHeader">
        <img src="${iconPagescannerLogoData}" class="iconPagescannerLogo"></img>
				<span>PageScanner</span>
			</div>
			<div id="pagescannerSnippetTitle" class="pagescannerSnippetTitle">
			${key}
			</div>
			<div id="pagescannerSnippetAbbreviation" class="pagescannerSnippetAbbreviation">
			${etymology}
			</div>
			<div id="pagescannerSnippetDescription" class="pagescannerSnippetDescription">
      ${description}
      </div>
			<hr class="pagescannerHr">
			<div id="pagescannerFooter" class="pagescannerFooter">
        <img src="${iconBookData}" class="iconBook"></img>
				<a href="${link}">${linkLabel}</a>
			</div>
		</div>`;

    _img.popover({ trigger: "manual" , content:_title,html: true, animation:false})
        .on("mouseenter",  function(event) {
            var _this = this;
            $(this).popover("show");
            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
            // fix for wikipedia: avoid other popups to show when hovering
            event.stopPropagation();
        }).on("mouseleave", function () {
            var _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 300);
    });






    var _nodeValue = node.nodeValue;
    // insertion at beginning
    if (pos==0){
        _anchor.insertBefore($(node));
        node.nodeValue = node.nodeValue.substr(key.length,node.nodeValue.length-key.length);
        return node;
    } // insertion in the middle or at the end
    else {

      node.nodeValue = _nodeValue.substr(0,pos);
      _anchor.insertAfter($(node));
      var t = document.createTextNode(_nodeValue.substr(pos+key.length,_nodeValue.length-pos+1));
      t.ignoreAtCreation = true;
      $(t).insertAfter(_anchor);
      return t;
    }
  }
};
