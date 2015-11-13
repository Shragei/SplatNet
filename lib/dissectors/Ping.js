module.exports={
  Name:'Ping',
  Depends:"NinFrame",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.PayloadType===6;
  },
  Format:function(proto,payload){
    return{
      ACK:payload.readUInt32BE(0),
      Seq:payload.slice(payload.length-5,payload.length)
    };
  },
  Size:function(proto,payload){return proto.Frame.IP.UDP.NinFrame.Length}
};