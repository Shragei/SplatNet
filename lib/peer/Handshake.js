var event=require('event');
var util=require('util');

function Handshake(route){//consider extending Handshake with 
  event.EventEmitter.call(this);
  handlers('Inbound',route,this);
  handlers('Outbound',route,this);
  
}


function handlers(direction,route,obj){
  var seq;
  var synchronize;
  var meta;
  obj[direction]={
    synchronize:undefined,
    meta:undefined
  }
  function handShake(dir,frame,next){
    if(frame.Handshake.Type==="Synchronize"&&direction===dir){
      seq=frame.Handshake.SeqId;
      obj[direction].synchronize=frame.Handshake.Payload;
      route.AddHandler(0x01,ack);
      route.RemoveHandler(0x01,handShake);
      next(true);//stop
    }else
      next();
  }
  function established(dir,frame,next){
    if(frame.Handshake.Type==="Established"&&direction===dir){
      obj[direction].meta=frame.Handshake.Payload;
      seq=frame.Handshake.SeqId;
      next(true);
    }else
      next();
  }
  function ack(dir,frame,next){
    if(frame.Handshake.Type==='ACK'&&direction!==dir){
      if(seq===frame.Handshake.SeqId){
        if(obj[direction].synchronize){
          route.AddHandler(0x01,established);
        }else if(obj[direction].meta){//all finished
          route.AddHandler(0x01,disconnect);
          obj.emit('established');
          route.RemoveHandler(0x01,established);
          route.RemoveHandler(0x01,ack);
        }else{
          console.log("Peer.Handshake: out of order ACK");
          Log.Packet(frame);
          cleanup()
        }
      }else{
        console.log("Peer.Handshake: ack with bad sequence");
        Log.Packet(frame);
        cleanup()
      }
    }
  }
  
  function disconnect(dir,frame,next){
    if(frame.Handshake.Type==='Disconnect'&&direction===dir){
      route.AddHandler(0x01,dack);
      route.RemoveHandler(0x01,disconnect);
      next(true);
    }else{
      next();
    }
  }
  function dack(dir,frame,next){
    if(direction!==dir){
      route.RemoveHandler(0x01,dack);
      obj.emit('disconnect');
      next(true);
    }else{
      next();
    }
    
  }
  function cleanup(){
    route.RemoveHandler(0x01,handShake);
    route.RemoveHandler(0x01,established);
    route.RemoveHandler(0x01,ack);
  }
  route.AddHandler(0x01,handShake);
}


util.inherits(Handshake,event.EventEmitter);
module.exports=Handshake;