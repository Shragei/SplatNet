var eventEmitter=require('event');
var util=require('util');
var _=require('lodash');
function Peer(ip){
  var timeout;
  var disconnected=false;
  var gearSig=new Buffer();
  eventEmitter.call(this);
  this.IP=ip;
  
  this.Packet=function(frame){
    if(disconnected)
      return;
    
    if(timeout)
      clearTimeout(timeout);
    
    timeout=setTimeout(function(){
      disconnected=true;
      this.emit('Disconnect');
    }.bind(this),20000);
    
    var ninFrame=_.get(frame,'Frame.IP.UDP.NinFrame');
    if(this.Name===undefined&&ninFrame.Handshake){
      var handshake=ninFrame.Handshake;
      if(handshake.Type==="Hello"){
        this.Hello=handshake.Payload;
      }else if(handshake.Type==="Name"){
        this.Name=handshake.Name;
      }
      if(this.Hello&&this.Name){
        this.emit('Hello',{Hello:this.Hello,Name:this.Name});
      }
    }
    if(ninFrame.Handshake&&ninFrame.Handshake.Type==='Disconnect'){
      disconnected=true;
      this.emit('Disconnect');
    }
    if(ninFrame.Event&&ninFrame.Event.Type==='Player'){
      var event=ninFrame.Event;
      
      if(event.Gear){
        var gear=event.Gear;
        if(this.Gear===undefined)
          this.Gear={};
        var change=false;
        var old=this.gear;
        this.Gear=gear;
        if(!_.isEqual(this.Gear,old))
          this.emit('GearChange',this.Gear);
      }
      if(event.Movement){
        this.Movement=event.Movement;
        this.emit('Movement',this.Movement)
      }
    }
  };
}

util.inherits(Peer,eventEmitter);