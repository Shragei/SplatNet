var eventEmitter=require('events');
var util=require('util');
var _=require('lodash');


function Peer(ip,nnid){
  var timeout;
  var disconnected=false;
  eventEmitter.call(this);
  
  this.IP=ip;
  this.NNID=nnid;
  this.Gear={};
  this.Slot=undefined;
  
 
  var hsCnd=true;
  
  this.Packet=function(frame){
    if(disconnected)
      return;
    
    var ninFrame=_.get(frame,'Frame.IP.UDP.NinFrame');
    if(ninFrame===undefined)
      return;
    
    resetTimeout();
    
    if(hsCnd&&ninFrame.Handshake)
      hsCnd=Handshake(ninFrame);

    if(ninFrame.Handshake&&ninFrame.Handshake.Type==='Disconnect'){
      disconnected=true;
      this.emit('Disconnect');
    }

    if(ninFrame.Event&&ninFrame.Event.Type==='Player'){
      var event=ninFrame.Event;
      if(event.Gear)
        Gear(event);
      if(event.Movement)
        Movement(event);
    }
  };
 
  var resetTimeout=function(){
    if(timeout)
      clearTimeout(timeout);
    
    timeout=setTimeout(function(){
      disconnected=true;
      this.emit('Disconnect');
    }.bind(this),5000);
  }.bind(this);
  
  var Handshake=function(ninFrame){
    var handshake=ninFrame.Handshake;
    this.Slot=ninFrame.Slot;
    if(handshake.Type==="Hello"){
      this.Hello=handshake.Payload;
    }else if(handshake.Type==="Name"){
      this.Name=handshake.Name;
    }
    if(this.Hello&&this.Name&&this.Slot!==253){
      this.emit('Hello',{
        Hello:this.Hello,
        Name:this.Name,
        Slot:this.Slot
      });
      return false;
    }
    return true;
  }.bind(this);
  
  var GearP=new Buffer(80);
  var Gear=function(event){
    if(event.Gear&&event.Gear.Payload.compare(GearP)!==0){
      event.Gear.Payload.copy(GearP);
      delete event.Gear.Payload;
      var gear=event.Gear

      this.Gear=gear;
      this.emit('Gear',gear);
    }
    return true;
  }.bind(this);
  
  var MoveP=new Buffer(52);
  var Movement=function(event){
    if(event.Movement&&event.Movement.Payload.compare(MoveP)!==0){
      event.Movement.Payload.copy(MoveP);
      this.Movement=event.Movement;
      this.emit('Movement',this.Movement)
    }
    return true;
  }.bind(this);
}




util.inherits(Peer,eventEmitter);
module.exports=Peer;