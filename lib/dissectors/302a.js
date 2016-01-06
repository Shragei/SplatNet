//302a0000030000000007000000ff000f8e1affffffffffff555500000000000f937400000000567b02b9
module.exports={
  Name:'302a',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x302a;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,42)
    };
  },
  Size:function(proto,payload){
    return 42;
  }
};