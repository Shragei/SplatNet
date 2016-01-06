//30320004030011001106000000bf000fd7f5ffffffffffff55553ea5add70673000000d10002be95a3bdb3527bf9be17b2cf
//302d0002030067006606000000bf000fd7f7ffffffffffff555594f102393f021a2e0174c35f83fe64f477bc02
//302d0002030067006606000000bf000fd7f7ffffffffffff555594f102393f021a2e0174c35f83fe64f477bc02
//3032000403000b000b01000000bd000fa2b2ffffffffffff55553e8f5c290203000601f50003be77cbf200000000bea3075f
//30310001030a190a1901000000bd000fa2b2ffffffffffff555541f8530b3320002c4009767d00380083ffdbdefffe000e
//302d00020300f400f401000000bd000fa2b4ffffffffffff5555e05202a9ad0112e7efa358de29fedc9337ca1a30310001030a1a0a1901000000bd000fa2b6ffffffffffff555541f893af4020002c4039cd7d0038c082ffa3defffe0002
module.exports={
  Name:'3032',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x3032;
  },
  Format:function(proto,payload){
    return{
      Payload:payload.slice(0,50)
    };
  },
  Size:function(proto,payload){
    return 50;
  }
};