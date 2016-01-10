var stream=require('stream');
var util=require('util');

var _=require('lodash');

var Peer=require('./Peer');

function Connections(delay){
  this.connections={};
  var lastBuffer=new Buffer(0);
  
  stream.Writable.call(this,{
    objectMode:true,
    highWaterMark:1
  });
  
  this._write=function(packet,enc,done){
    var frame=_.get(packet,'Frame.IP.UDP.NinFrame');
   // console.log(frame);
    
    if(frame){
      var direction=packet.Direction;
      if(packet.Direction==='Outbound'){//ignor all but one copy of the outbound packets
        if(frame.Payload.compare(lastBuffer)===0)
          return done();
        lastBuffer=frame.Payload;
      }

      var ip=direction==='Outbound'?'localhost':packet.Frame.IP.SourceAddress;
      
      
      if(this.connections[ip]){
        this.connections[ip].Packet(packet);
      }else{
        var peer=new Peer(ip,this);
        peer.Direction=direction;
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
Connections.prototype.Clear=function(){
  this.connections=[];
}
Connections.prototype.Remove=function(ip){
  delete this.connections[ip];
}
util.inherits(Connections,stream.Writable);
module.exports=Connections;