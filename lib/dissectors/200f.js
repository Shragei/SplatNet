//200f00000301000000ff000f8a5805
module.exports={
  Name:'200f',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x200f;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,15)
    };
  },
  Size:function(proto,payload){
    return 15;
  }
};