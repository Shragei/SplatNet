//30620003030021002107000000ff000f8aa7ffffffffffff1a61000000010004000000000006005a00006e1ffd797f38ca4800000000000000003ef4f4f53f1595963db0b0b13edcdcdd3ce0e0e13f0a8a8b3f8ccccd3f19999a3dcccccd00000000
module.exports={
  Name:'3062',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x3062;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,98)
    };
  },
  Size:function(proto,payload){
    return 98;
  }
};