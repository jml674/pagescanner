// @include frenchsnippets.json

const POLLING_SNIPPET_INTERVAL = 15000//7*24*60*60*1000; // Poll every week
var SEEDED_SNIPPETS=[];
SEEDED_SNIPPETS["fr"]=frSeededSnippets;

var snippetMgr = {
  _maps : [],
  initialize:function(languages){
    languages.forEach(language =>{
      this.pullSnippets(language).then(result=>{
        //console.log("snippetMgr.initialize: ",result);
        if (!result.success){
          console.warn("snippetMgr.initialize: fallback to seeded snippets for "+language)
          this._maps[language] = this._buildMap(SEEDED_SNIPPETS[language]);
        }
      });
      setInterval(()=>{
        this.pullSnippets(language).then(result=>{
          if (!result.success){
            console.warn("snippetMgr.initialize: can't load snippet file for "+language)
          }
        });
      }, POLLING_SNIPPET_INTERVAL);
    })
  },
  pullSnippets:function(language){
    //var _languageString = LANGUAGE_MAP.get(language);
    var _url = URLS[language+"Snippets"];
    return BackendMgr.getDataFromFileIfChanged(_url).then(result => {
      if (result.success){
        if (result.status == "changed"){
          this._maps[language] = this._buildMap(result.data);
        }
      }
      return result;
    }).catch(e => {
      return {success:false};
    })
  },
  findExpression:function(sentence,words,index,language){
    var _result = false;
    var _primarySnippet = this._maps[language].get(words[index].word);
    if (_primarySnippet){
      for (var i=Math.min(_primarySnippet.max,words.length);i>=0;i--){
        var _expression = words.slice(index,index+i).reduce((accumulator,word)=>{
          return accumulator.length ? accumulator+" "+word.word : word.word;
        },"");
        var _secondarySnippet = _primarySnippet.map.get(_expression);
        if (_secondarySnippet){
          var _expression = sentence.substring(words[index].beginIndex,words[index+i-1].endIndex);
          return {snippet: _secondarySnippet,expression:_expression};
        }
      }
    }
    return _result;
  },
  _buildMap:function(snippets){
    var _map = new Map();
    // remove no destination snippets & sort them by title so that snippets with title like 'a b' get after 'a'
    var _snippets = snippets.filter((snippet)=> {return snippet.destinations.length}).sort((s1,s2) => {
      return s1.title < s2.title ? -1 : 1;
    });
    _snippets.forEach((snippet)=>{
      this._processSnippet(snippet.title,snippet,_map);
      snippet.synonyms.forEach(synonym => {
        this._processSnippet(synonym,snippet,_map);
      })
    })
    return _map;
  },
  _processSnippet:function(title,snippet,map){
    var _keywords = title.toUpperCase().split(" ");
    var _rootSnippet;
    /* try finding a snippet in the dictionary */
    for (var i=_keywords.length-1;i>0;i--){
      var _key = _keywords.slice(0,i).join(" ");
      _rootSnippet = map.get(_key);
      if (_rootSnippet) break;
    }
    var _obj = this._createMapObject(snippet);
    if (!_rootSnippet){
      /* simple insertion in dictionary */
      var _key = _keywords[0].toUpperCase();
      map.set(_key,{max:_keywords.length,map:new Map([[title.toUpperCase(),_obj]])})
    }
    else{ /* add snippet to root snippet */
      //console.log("appMgr._buildMap: adding to root snippet")
      _rootSnippet.max = Math.max(_keywords.length,_rootSnippet.max);
      _rootSnippet.map.set(title.toUpperCase(),_obj);
    }
  },
  _createMapObject:function(snippet){
    _anchor = snippet.destinations[0].anchor;
    _obj= {
      title:snippet.title,
      description:snippet.description,
      etymology:snippet.etymology,
      linkUrl:_anchor,
      linkLabel: snippet.destinations.length?snippet.destinations[0].label:""
    };
    return _obj;
  },
}
