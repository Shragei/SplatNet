var stream=require('stream');
var util=require('util');

var _=require('lodash');

var Peer=require('./Peer');

function Connections(delay){
  this.connections={};
  var lastBuffer=new Buffer();
  
  stream.Writable.call(this,{
    objectMode:true,
    highWaterMark:1
  });
  
  this._write=function(packet,enc,done){
    var frame=_.get(packet,'IP.UDP.NinFrame');
    if(frame){
      var ip=packet.Direction==='Inbound'?packet.IP.SourceAddress:packet.IP.DestinationAddress;
      
      if(packet.Direction==='Outbound'){//ignor all but one copy of the outbound packets
        if(frame.Payload.compare(lastBuffer)===0)
          return done();
        lastBuffer=frame.Payload;
      }
      
      if(this.connections[ip]){
        this.connections[ip].Packet(packet);
      }else{
        var peer=new Peer(ip,this);
        this.on('Disconnect',function(){
          delete this.connections[ip];
        });
        this.emit('Connection',peer);
        
        peer.Packet(packet);
        this.connections[ip]=peer;
      }
    }
    done();
  }.bind(this);  
}

Connections.prototype.Remove=function(ip){
  delete this.connections[ip];
}
util.inherits(State,stream.Writable);
module.exports=State;