module.exports={
  Name:"NinFrame",
  Depends:"UDP",
  Condition:function(proto,payload){
    var p=payload;
    return proto.Frame.IP.UDP.Length>=48&&(p[0]==0x32&&p[1]==0xAB&&p[2]==0x98);
  },
  Format:function(proto,payload){
    var ret={
      Magic:payload.slice(0,4),
      Sub:payload.readUInt8(4),
      ID:payload.readUInt8(5),
      Counter:payload.readUInt16BE(6),
      Timeing:{
        Local:payload.readUInt16BE(8),
        Remote:payload.readUInt16BE(10),
        Delta:payload.readUInt16BE(10)-payload.readUInt16BE(8)
      },
      'Flags':payload.slice(12,13),
      'Slot':payload.readUInt8(13),
      Length:payload.readUInt16BE(14),
      Padding:payload.length-(payload.readUInt16BE(14)+44),
      Unknown1:payload.slice(16,20),
      NNID:payload.readUInt32BE(20),
      PayloadType:payload.readUInt8(24),
      Unknown2:payload.slice(25,31),
      HMAC:payload.slice(payload.length-12), //used to be 16byte hmac
      Payload:payload.slice(32,32+payload.readUInt16BE(14))
    };
    if(ret.ID===0)
      ret.Timeing.Delta=null;
    return ret;
  },
  Size:function(proto,payload){return payload.length} //Consumes the total payload from UDP
};