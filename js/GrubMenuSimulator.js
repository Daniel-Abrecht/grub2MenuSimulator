"use strict";

class GrubMenuSimulator {

  constructor( canvas, width, height ){
    this.canvas  = canvas;
    this.context = canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false
    this.resize(
      width  || 800,
      height || 600
    );
    this.model = null;
    this.images = new Map();
  }

  resize( width, height ){
    this.width  = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.draw();
  }

  draw(){

    const c = this.context;
    c.clearRect(0, 0, this.width, this.height);

    if( this.model )
      this.model.drawAll(
        this.context,
        this.width,
        this.height
      );

  }

  loadModel( uri ){
    let self = this;
    let base = uri.split('/');
    this.configfile = base.pop();
    this.base = base.join('/')+'/';
    this.uri = uri;
    let xhr = new XMLHttpRequest();
    this.model = null;
    xhr.open('GET', uri, true);
    xhr.onload = function(){
      if( this.status == 200 ){
        var config = self.parseConfig( this.responseText );
        if(!config){
          console.error("Failed to parse config file");
          return;
        }
        self.setupModel(config);
      }
    }
    xhr.send();
  }

  getImage( src ){
    if(!src) return null;
    let res = this.images.get(src);
    if( res )
      return res.ready ? res : null;
    var img = new Image();
    img.src = this.base + src;
    img.ready = false;
    img.onload = function(){
      this.ready = true;
    };
    this.images.set( src, img );
    return null;
  }

  setupModel(config){
    config.properties.set("left","0");
    config.properties.set("top","0");
    config.properties.set("width","100%");
    config.properties.set("height","100%");
    config.name = "root canvas";
    this.model = this.createModel(config);
  }

  createModel(config){
    var component = this.createModelComponent({
      name: config.name,
      properties: config.properties
    });
    if(!component)
      return null;
    for( let conf of config.components ){
      var member = this.createModel(conf);
      if(!member)
        continue;
      component.add(member);
    }
    return component;
  }

  createModelComponent(cc){
    var component = GrubMenuSimulator.components.get(cc.name);
    if(!component){
      console.warn("unknown component "+cc.name);
      return null;
    }
    return new component(this,cc.properties);
  }

  static registerComponent(name,component){
    GrubMenuSimulator.components.set(name,component);
  }

  parseConfig( config ){
    var tokens = this.tokenizeConfig( config );
    if(!tokens){
      console.error("Tokenization failed");
      return null;
    }
    var tree = this.mktree( tokens );
    if(!tree){
      console.error("Failed to build tree");
      return null;
    }
    var config = this.configTreeToConfig( tree );
    if(!tree){
      console.error("Failed to interpret tree");
      return true;
    }
    return config;
  }

  tokenizeConfig( config ){
    const lex = [
      [ "\"(\\\\\\\\|\\\\\"|[^\"\\\\])*\"", "STRING" ],
      [ "#[0-9a-fA-F]{3}[0-9a-fA-F]{3}?", "COLOR" ],
      [ "#.*", "COMMENT" ],
      [ "\\s+", "SPACE" ],
      [ "{", "BLOCK_START" ],
      [ "}", "BLOCK_END" ],
      [ "\\(", "TUPLE_START" ],
      [ "\\)", "TUPLE_END" ],
      [ "\\+", "PLUS" ],
      [ "=", "EQUAL" ],
      [ ":", "DOUBLEPOINT" ],
      [ ",", "KOMMA" ],
      [ "[^ \t\n=:,(){}]+", "WORD" ]
    ];
    let tokens = [];
    let line = 1;
    let character=0;
    while(config.length){
      let token = null;
      let value = null;
      if( config[0] == "\n" || config.substr(0,2) == "\r\n" ){
        value = "\n";
        token = "NEWLINE";
        character = 0;
        line += 1;
      }else for( let t of lex ){
        let rex = new RegExp( "^("+t[0]+")" );
        let res = config.match( rex );
        if(!res) continue;
        value = res[0];
        token = t[1];
        break;
      }
      if( !token || value===null || !value.length )
        return null;
      config = config.substr( value.length );
      tokens.push( [token,value,line,character] );
      if(token!="NEWLINE")
        character += value.length;
    }
    return tokens;
  }

  mktree( tokens ){
    var groups = {
      "SPACES_OR_NEWLINES": [
        [
          "SPACE",
          "NEWLINE"
        ],
        "?SPACES_OR_NEWLINES"
      ],
      "GLOBAL_PROPERTY": [
        ":WORD",
        "?SPACES_OR_NEWLINES",
        "DOUBLEPOINT",
        "?SPACES_OR_NEWLINES",
        ":VALUE"
      ],
      "COMPONENT": [
        "PLUS",
        "?SPACES_OR_NEWLINES",
        ":WORD",
        "?SPACES_OR_NEWLINES",
        "BLOCK_START",
        "?SPACES_OR_NEWLINES",
        ":?PROPERTY_LIST",
        "?SPACES_OR_NEWLINES",
        "BLOCK_END"
      ],
      "PROPERTY_LIST": [
        [":COMPONENT",":PROPERTY",":COMMENT"],
        "?SPACES_OR_NEWLINES",
        ":?PROPERTY_LIST"
      ],
      "PROPERTY": [
        ":WORD",
        "?SPACES_OR_NEWLINES",
        "EQUAL",
        "?SPACES_OR_NEWLINES",
        ":VALUE"
      ],
      "VALUE": [
        [":WORD",":STRING",":TOUPLE",":COLOR"]
      ],
      "TOUPLE": [
        "TUPLE_START",
        "?SPACES_OR_NEWLINES",
        ":TOUPLE_VALUE",
        "?SPACES_OR_NEWLINES",
        ":TOUPLE_NEXT_VALUE",
        "?SPACES_OR_NEWLINES",
        "TUPLE_END"
      ],
      "TOUPLE_NEXT_VALUE": [
        "KOMMA",
        "?SPACES_OR_NEWLINES",
        ":TOUPLE_VALUE",
        "?SPACES_OR_NEWLINES",
        ":?TOUPLE_NEXT_VALUE"
      ],
      "ROOT": [
        [
          ":GLOBAL_PROPERTY",
          ":COMPONENT",
          ":COMMENT"
        ],
        "?SPACES_OR_NEWLINES",
        "?:ROOT"
      ]
    };
    function tokenize( tokens, group, i, path ){
      i = i || 0;
      path = path || [];

      if(i>=tokens.length)
        return null;

      let gm = group.match(/^([^a-zA-Z_-]*)(.*)$/);
      let gparams = gm[1];
      let gkey = gm[2];
      let result = [];
      let g = groups[gkey];

      let found = 0;
      let nsp = path.concat([gkey]);

      function push( value ){
        if(/:/.test(value.params)){
          if( gkey == value.token ){
            result = result.concat(value.value);
          }else{
            result.push(value);
          }
        }
        found++;
      }

      function checkRecursion(t){
        return path.indexOf(t.match(/^([^a-zA-Z_-]*)(.*)$/)[2]) != -1
      }

      if( gkey == tokens[i][0] ){
        result = tokens[i][1];
        i++;
      }else if(g){
        for( let t of g ){
          if( found )
            nsp = path;
          if( t instanceof Array ){
            let res = null;
            for( let u of t ){
              if( !found && checkRecursion(u) )
                continue;
              res = tokenize( tokens, u, i, nsp );
              if( res ) break;
            }
            if(!res) return null;
            i = res[1];
            push( res[0] );
          }else{
            if( !found && checkRecursion(t) )
              return null;
            let res = tokenize( tokens, t, i, nsp );
            if(!res){
              let params = t.match(/^([^a-zA-Z_-]*)(.*)$/)[1];
              if(/\?/.test(params))
                continue;
              return null;
            }
            i = res[1];
            push( res[0] );
          }
        }
      }else return null;

      return [{
        params: gparams,
        token: gkey,
        value: result
      },i];
    }

    let res = tokenize( tokens, "ROOT" );
    if( res && res[1] == tokens.length )
      return res[0].value;
    return null;
  }

  configTreeToConfig(tree){
    var config = {
      properties: new Map(),
      components: []
    };
    function Pvalue(x){
      var value = x.value;
      switch( x.token ){
        case "STRING": value = value.substr(1,value.length-2);
        case "WORD":
        case "COLOR": {
          return value;
        }
        case "TUPLE": {
          return null;
        }
      }
    }
    function Pcomponent(x){
      var res = {
        name: x[0].value,
        properties: new Map(),
        components: []
      };
      var content = x[1].value;
      for( let node of content ){
        switch( node.token ){
          case "PROPERTY": {
            res.properties.set(
              node.value[0].value,
              Pvalue(node.value[1].value[0])
            );
          } break;
          case "COMPONENT": {
            res.components.push(
              Pcomponent(node.value)
            );
          } break;
        }
      }
      return res;
    }
    for( let node of tree ){
      switch( node.token ){
        case "GLOBAL_PROPERTY": {
          config.properties.set(
            node.value[0].value,
            Pvalue(node.value[1].value[0])
          );
        } break;
        case "COMPONENT": {
          config.components.push(
            Pcomponent(node.value)
          );
        } break;
      }
    }
    return config;
  }

}

GrubMenuSimulator.components = new Map();

function ParseSize(s){
  var res = s.match(/((\d+)%\s*)?([+|-]?)?\s*(\d+)?/);
  if( !res || res[2]===null && res[3]===null )
    return null;
  return [
    parseInt(res[2])/100 || 0,
    parseInt((res[3]||'')+res[4]) || 0
  ];
}

