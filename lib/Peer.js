function Peer(ip,route,close){
  
  route.AddHandler(0x00,function Null(type,frame,next){
    if(frame.Payload.lenth!==0){
      console.log("Peer.Null: Null type does not have zero length");
    }
    next();
  });
  
  route.AddHandler(0x01,function ConnectionCtrl(type,frame))
  
}