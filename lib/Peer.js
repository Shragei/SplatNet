function Peer(ip,route,close){
  var Stats={
    'Null':0,
    Ping:0
  }
  route.AddHandler(0x00,function Null(type,frame,next){
    if(frame.Payload.lenth!==0){
      console.log("Peer.Null: Null type does not have zero length");
    }
    Stats['Null']++;
    next();
  });
  
  route.AddHandler(0x06,function Ping(type,frame,next){
    if(!frame.Ping.ACK)
      Stats.Ping++;
  })
    
  route.AddHandler(0x01,function ConnectionCtrl(type,frame,next){
    
  });
  
}