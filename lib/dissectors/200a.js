//200a00000505000fca49
module.exports={
  Name:'200a',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x200a;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,10)
    };
  },
  Size:function(proto,payload){
    return 10;
  }
};