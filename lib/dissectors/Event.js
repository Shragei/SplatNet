var zlib=require('zlib');

module.exports={
    Name:'Event',
    Depends:"NinFrame",
    Condition:function(proto,payload){
      return proto.Frame.IP.UDP.NinFrame.PayloadType===36;
    },
    Format:function(proto,payload){console.log()
      var sub=payload.readUInt8(1);
      var ret={
        Type:sub,
        Frame:payload.readUInt16BE(2),
      }
      
      switch(sub){
        case 0x11:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.splice(12,16);
          break;
        case 0x21:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,24);
          break;
        case 0x31:
        case 0x32:
        case 0x33:
          ret.Meta=payload.slice(4,8);
          break;
        case 0x41:
          ret.Meta=payload.slice(4,12);
          break;
        case 0x81:
        case 0x82:
        case 0x83:
        case 0x84:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,16);
          break;
        case 0x91:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,20);
          break;
        case 0xa1:
        case 0xa2:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,24);
          break;
        case 0xd3:
          ret.Type='Player';
          ret.Meta=payload.slice(4,12);
          ret.Payload=zlib.inflate(payload.slice(13,payload.length)); //offset 0x01
          break;
        case 0xc1:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,28);
          break;
 
      }
      return ret;
    },
    Size:function(proto,payload){return proto.Frame.IP.UDP.NinFrame.Length}
  };