var readInt24LE=require('../util').readInt24LE;

module.exports={
  Name:'Movement',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt8(0)===0x10&&payload.readUInt16BE(3)===0x0000;
  },
  Format:function(proto,payload){
    var buttons=payload.readUInt8(52);
    
    return{
      Position:{
        X:readInt24LE(payload,8),
        Y:readInt24LE(payload,11),
        Z:readInt24LE(payload,14)
      },
      Rotation:readInt24LE(payload,36),
      Gyro:{
        X:readInt24LE(payload,39),
        Y:readInt24LE(payload,42),
        Z:readInt24LE(payload,45)
      },
      Actions:{
        Jump:buttons&0x10?true:false,
        Squid:buttons&0x20?true:false,
        Firing:buttons&0x40?true:false,
        Alt:buttons&0x80?true:false
      },
      Ink:payload.readUInt16LE(50),
      Payload:payload.slice(8)
    };
  },
  Size:function(proto,payload){return 60;}   
};
