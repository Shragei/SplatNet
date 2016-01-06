//201a00000302000000ff000feb8000000000000c000800000000
module.exports={
  Name:'201a',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x201a;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,26)
    };
  },
  Size:function(proto,payload){
    return 26;
  }
};