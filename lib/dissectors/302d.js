//302d000203032f032f01000000bd000fd8f6ffffffffffff55551ead01314b004219fcab4c61b806b3f037ca02
module.exports={
  Name:'302d',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x302d;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,45)
    };
  },
  Size:function(proto,payload){
    return 45;
  }
};