'use strict';
var util=require('util');
var stream=require('stream');
var mongojs=require('mongojs');
var RingBuffer=require('ringbufferjs');
var config=require('../../config');
var q=require('q');
var fixMongo=require('../util').fixMongo;
//ether host  and udp
var debug=false;
function Playback(){
  stream.Readable.call(this,{objectMode:true});
  var db=mongojs(config.dburl,['Sessions','Packets']);
  var buffer=new RingBuffer(512);

  var cursor;
  var interval;
  var timer=0;;
  var closed=false;
  var fetching=false;
  var read=false;
  
  var SessionId;
  var count=0;
  var lowWaterMark=0;
  var offset=0;
  var lastTick=0;
  
  var query=function(reconnect){
    if(reconnect){
      db=mongojs(config.dburl,['Sessions','Packets']);
      if(debug)
        process.stdout.write('r');
     // console.log('reconnecting');
    }

    cursor=db.Packets.find({SessionId:SessionId,"Timestamp":{$gt:lowWaterMark}},
                           {"Timestamp":1,SessionId:1,Length:1,Frame:1,Direction:1})
             .sort({"Timestamp":1}).limit(768);

    
    cursor.on('data',function(packet){
      lowWaterMark=packet.Timestamp;
      count--;
      buffer.enq(packet);
      if(debug)
        process.stdout.write('-');
      if(buffer.isFull()){
        cursor.pause();
        fetching=false;
      }
    });
    cursor.on('end',function(){
      if(count>0)
        query(false);
    }.bind(this));
    cursor.on('error',function(err){
  //    console.log('here'+err);
    })
  }.bind(this);
  
  this.Start=function Start(sess){  
    db.Sessions.findOne({SessionId:sess},function(err,session){
      timer=session.StartTime*1000;
      //{'Timestmap':1,SessionId:1,Direction:1,Frame:1}).sort({Timestamp:1});
      SessionId=sess;
      count=session.PacketCount;
      
      setTimeout(function(){
        console.log('timeout') 
      },session.Duration*1000);
      query(false);
      lastTick=Date.now();
      interval=setInterval(tick,1);
      
    }.bind(this));
  };
  
  
  

  this._read=function(size){
    read=true;
  }

  var tick=function(){
    var now=Date.now();
    timer+=now-lastTick;
    lastTick=now;

    while(read&&(!buffer.isEmpty())&&(buffer.peek().Timestamp*1000)<=timer){
      if(debug)
        process.stdout.write('+');
      var packet=buffer.deq();
      fixMongo(packet);
      if(!this.push(packet)){
        if(debug)
          process.stdout.write('#');
        read=false;
        break;
      }
    }

    if(buffer.isEmpty()){
      if(debug)
        process.stdout.write('.');
      if(count<=0){
        clearInterval(interval);
        console.log('here');
        return this.push(null);
      }
        
    }
    if(fetching===false&&!buffer.isFull()){
      fetching=true;
  //    cursor.next(next);
      cursor.resume();
    }

  }.bind(this);
  
  Object.defineProperty(this,'_read',{
    configurable:false,
    enumerable:false,
  });
  
  
}
util.inherits(Playback,stream.Readable);
module.exports=Playback;