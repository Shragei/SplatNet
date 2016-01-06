'use strict';
var util=require('util');
var stream=require('stream');
var mongojs=require('mongojs');
var config=require('../../config');
var q=require('q');

//var _=require('lodash');
//ether host  and udp
function Playback(){
  stream.Readable.call(this,{objectMode:true});
  var db=mongojs(config.dburl,['Sessions','Packets']);
  var start=false;
  var cursor;
  var offset;
  this.Start=function Start(sess){
    cursor=db.Packets.find({SessionId:sess},{Timestmap:1,SessionId:1,Frame:1,Length:1,Direction:1}).sort({Timestamp:1});
    cursor.on('end',function(){
      this.emit('end');
    }.bind(this));
    if(start)
      next();
  };
  
  

  this._read=function(size){
    start=true;
    if(cursor!==undefined)
      next();
  }
  function next(){
    cursor.next(function(packet){
      if(offset===undefined){
        offset=Date.now()-packet.Timestamp*1000;
        if(this.push(packet))
          next();
      }else{
        setTimeout(function(){
          if(this.push(packet))
            next();
        }.bind(this),packet.Timestamp*1000+offset)
      }
    }.bind(this));
  }.bind(this);
  
  Object.defineProperty(this,'_read',{
    configurable:false,
    enumerable:false,
  });
  
  
}
util.inherits(Capture,stream.Readable);
module.exports=Capture;