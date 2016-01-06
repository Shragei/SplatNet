module.exports={
  Name:'303a',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x303a;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,58)
    };
  },
  Size:function(proto,payload){
    return 58;
  }
};