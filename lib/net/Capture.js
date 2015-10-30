'use strict';
var util=require('util');
var stream=require('stream');
var events=require('events');
var crypto=require('crypto');
var q=require('q');

//var _=require('lodash');
var pcap=require('pcap');
//ether host  and udp
function Capture(TargetMAC){
  stream.Readable.call(this,{objectMode:true});
  
  var stuctures={};
  TargetMAC=TargetMAC.toLowerCase();
  var filter="ether host "+TargetMAC+" and udp";
  
  var session=pcap.createSession('eth0');
  var sessionId=false;
  var stats={};
  var more=true;
  var idle=20;
  
  this.Start=function Start(){
    if(sessionId===false){
      sessionId=crypto.randomBytes(6).toString('base64');
      stats={
        StartTime:Date.now()/1000,
        PacketCount:0,
        TotalData:0
      };
    }
  };
  
  this.Stop=function Stop(cb){
    var tId=sessionId;
    if(sessionId!==false){
      sessionId=false;
      var endtime=Date.now()/1000;
      var stopStats={
        SessionId:tId,
        StartTime:stats.StartTime,
        RunTime:endtime-stats.StartTime,
        EndTime:endtime,
        PacketCount:stats.PacketCount,
        TotalData:stats.TotalData
      };
      this.emit('End',stopStats);
    }
  };
  
  this.Stats=function(){
    if(sessionId!==false){
      var ret={
        SessionId:sessionId,
        StartTime:stats.StartTime,
        RunTime:(Date.now()/1000)-stats.StartTime,
        PacketCount:stats.PacketCount,
        TotalData:stats.TotalData
      };
      return ret;
    }
  };
  
  this._read=function(){
    more=true;
  }

  session.on('packet',function(packet){
    if(sessionId!==false){
      if(more){
        var frame=MakeFrame(packet);
        if(frame['Direction']!==undefined){
          stats.PacketCount++;
          stats.TotalData+=frame.Length;
          this.push(frame);
        }
      }
     // packet=decoder.DecodePcap(packet);
    }
  }.bind(this));
  
  Object.defineProperty(this,'State',{
    configurable:false,
    enumerable:true,
    get:function(){
      return sessionId!==false?'Capturing':'Capture';
    }
  });
  Object.defineProperty(this,'_read',{
    configurable:false,
    enumerable:false,
  });
  
  function EthernetMAC(buffer,offset){
    var mac=[
             buffer.readUInt8(offset),
             buffer.readUInt8(offset+1),
             buffer.readUInt8(offset+2),
             buffer.readUInt8(offset+3),
             buffer.readUInt8(offset+4),
             buffer.readUInt8(offset+5)];

    return mac.map(function(el){
      el=el.toString(16);
      if(el.length===1){
        el='0'+el;
      }
      return el;
    }).join(':');
  }
  function MakeFrame(packet){
    var header=packet.header;
    var data=packet.buf.slice(0,header.readUInt32LE(12,true));
    var proto={//14 bytes to payload
      Timestamp:header.readUInt32LE(0,true)+header.readUInt32LE(4,true)/1000000,
      Length:header.readUInt32LE(8,true),
      SessionId:sessionId,
      Frame:{
        DestinationAddress:EthernetMAC(data,0),
        SourceAddress:EthernetMAC(data,6),
        EtherType:data.readUInt16BE(12),
        Payload:data.slice(14,data.length-4),
        'Length':data.length-18
      }
    };
    if(proto.Frame.SourceAddress===TargetMAC)
      proto.Direction='Outbound';
    if(proto.Frame.DestinationAddress===TargetMAC)
      proto.Direction='Inbound';
    
    return proto;
  }
}
util.inherits(Capture,stream.Readable);
module.exports=Capture;