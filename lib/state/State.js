'use strict';
var util=require('util');
var events=require('events');
var stream=require('stream');

var Route=require('./Route');

function State(catchAll,peer){
  var connections={};
  var timeout=60;
  this._write=function(packet,enc,done){
    var ip=packet.Direction=='Inbound'?packet.IP.SourceAddress:packet.IP.DestinationAddress;
    var port=packet.Direction=='Inbound'?packet.IP.UDP.SourcePort:packet.IP.UDP.DestinationPort;
    
    if(connections[ip]===undefined){
      var route=new Route(catchAll);
      var peer=new peer(ip,route,function(){
        delete connections[ip];
      });
      connections[ip]={
        Peer:peer,
        Route:route,
        PacketsPerSecond:[],
        TotalPackets:0,
        StartTime:packet.Timestamp
      }
    }
    
    var connection=connections[ip];
    connection.TotalPackets++;
    connection.PacketsPerSecond.push(packet.Timestamp);
    connection.Route.Handle(packet);
    cullAvg();
    done();
  }
  
  function cullAvg(){
    var now=Date.now()/1000;
    for(var ip in connections){
      var connection=connections[ip];
      var limit=(now-connection.StartTime)-1;
      connection.PacketsPerSecond=connection.PacketsPerSecond.filter(function(time){
        return (now-time)>limit;
      });
    }
  }

  this.Stats=function Stats(){
    cullAvg();
    var ret=[];
    for(var i in connections){
      ret.push({
        IP:i,
        PacketsPerSecond:connections[i].PacketsPerSecond.length,
        TotalPackets:connections[i].TotalPackets,
        StartTime:connections[i],StartTime
      });
    }
    return ret;
  }
  
}

util.inherits(State,stream.Writable);
module.exports=State;