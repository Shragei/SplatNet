'use strict';
var util=require('util');
var events=require('events');
var stream=require('stream');
var builtin=require("./builtin");
var lodash=require('lodash');
function Decoder(){
  var stuctures={};
  var dependencies={};

  stream.Transform.call(this,{objectMode:true});
  
  
  function wrapFunction(func){
    if(typeof func === "string"){
      func=new Function('proto','payload',' '+func);
    }
    return func;
  }
  function walk(proto,path){//walk the protocol structure and decode any additional payloads
    var last=path[path.length-1];
    var queue=dependencies[last];
    var struct=lodash.get(proto,path.join('.'));
    
    struct.ROOT=proto;
    struct.SUPER=lodash.get(proto,path.slice(0,path.length-1).join('.'));
    Object.defineProperty(struct,'ROOT',{
      enumerable:false,
      configurable:false
    });
    Object.defineProperty(struct,'SUPER',{
      enumerable:false,
      configurable:false
    });
    
    if(queue){
      if('Payload' in struct){// If there is a payload key then the tree can be expaned
        var payloadLength=struct.Payload.length;
        var payloadOffset=0;
        var appliedDissector=false;
        
        do{
          var dissector=stuctures[key];
          var payload=struct.Payload.slice(payloadOffset);
          
          for(var i=0,l=queue.length;i<l;i++){
            var key=queue[i];
        
            if(dissector.Condition(proto,payload)){
              var substruct=dissector.Format(proto,payload);
              payloadOffset+=dissector.Size(proto,payload);
              
              if(struct[key]===undefined){//only use arrays if there is more than one dissector being applied. 
                struct[key]=substruct;
              }else{
                if(!(struct[key] instanceof Array))
                  struct[key]=[struct[key]];
                struct[key].push(substruct);
                key+='['+(struct[key].length-1)+']';
              }

              path.push(key);
              walk(proto,path);
              path.pop();
              appliedDissector=true;
              break;
            }
          }
        }while(payloadOffset<payloadLength&&appliedDissector);//extra data that hasn't be process will not be indicated in the structured data.
        
      }else{ //else try to walk known dependencies to get deep into the structure. 
        /* the payload is always kept now, so this is useless.
        var keys=Object.keys(struct);
        for(var i=0,l=keys.length;i<l;i++){
          if(queue.indexOf(keys[i])>=0){
            path.push(keys[i]);
            walk(proto,path);
            path.pop();
            break;
          }
        }*/
      }
    }
  }
  
  this.AddStucture=function AddStucture(c){
    var name=c.Name;
    var depends=c.Depends;
    stuctures[name]={
      Condition:wrapFunction(c.Condition),
      Format:wrapFunction(c.Format),
      Size:wrapFunction(c.Size)
    };
    
    if(!(c.Depends in dependencies)){
      dependencies[depends]=[];
    }
    dependencies[c.Depends].push(name);
  };
  this.RemoveStucture=function RemoveSturcture(name){
    delete stuctures[name];
    var keys=Object.keys(dependencies);
    for(var i=0,l=keys.length;i<l;i++){
      var off=dependencies[keys[i]].indexOf(name);
      if(off>=0){
        dependencies[keys[i]].splice(off,1);
      }
    }
  };
  this.Decode=function Decode(proto){//rewalk the protocol structure and decode any missed payloads
    proto.ROOT=proto;
    proto.SUPER=proto;
    
    Object.defineProperty(proto,'ROOT',{
      enumerable:false,
      configurable:false
    });
    Object.defineProperty(proto,'SUPER',{
      enumerable:false,
      configurable:false
    });
    
    walk(proto,['Frame']);
  };
  
  for(var i=0;i<builtin.length;i++)
    this.AddStucture(builtin[i]);
  
  this._transform=function Transform(chunk,encoding,next){
    this.Decode(chunk);
    next(null,chunk); 
  };
}

util.inherits(Decoder,stream.Transform);
module.exports=Decoder;