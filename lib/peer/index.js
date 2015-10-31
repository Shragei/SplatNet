var Log=require('Log');
var Handshake=require('./Handshake');
function Peer(ip,route,close){
  var Stats={
    'Null':{
      Inbound:0,
      Outbound:0
    },
    Ping:{
      Inbound:0,
      Outbound:0
    }
  };
  var 
  route.AddHandler(0x00,function Null(dir,frame,next){
    if(frame.Payload.lenth!==0){
      console.log("Peer.Null: Null type does not have zero length");
    }
    Stats['Null'][dir]++;
    next();
  });
  
  route.AddHandler(0x06,function Ping(dir,frame,next){
    if(!frame.Ping.ACK)
      Stats.Ping[dir]++;
  })
    
  
    
  function DefaultLog(dir,frame){
    Log.Packet(frame);
  }
  
  route.DefaultHandler(0x01,DefaultLog);
  route.DefaultHandler(0x02,DefaultLog);
  route.DefaultHandler(0x04,DefaultLog);
  route.DefaultHandler(0x06,DefaultLog);
  route.DefaultHandler(0x36,DefaultLog);
}