function readInt24LE(buffer,offset){
  var b=new Buffer([0,0,0,0]);
  b[3]=buffer[offset+2];b[2]=buffer[offset+1];b[1]=buffer[offset];b[0]=0;//shift to the left one byte to maintain number sign
  return b.readInt32LE(0)>>8;//move the number back 8 bits to return orginal.
}

module.exports={
  Name:'Movement',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x103c;
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
      Ink:payload.readUInt16LE(50)
    };
  },
  Size:function(proto,payload){return 60;}   
};
