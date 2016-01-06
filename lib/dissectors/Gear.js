module.exports={
  Name:'Gear',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt16BE(0)===0x1058;
  },
  Format:function(proto,payload){
    payload=payload.slice(8);
    return{
      Model:payload.readUInt8(8),
      SkinColor:payload.readUInt8(9),
      EyesColor:payload.readUInt8(10),
      Level:payload.readUInt8(62),
      Weapon:{
        Id:payload.readUInt16BE(12),
        u1:payload.readUInt16BE(14),
        u2:payload.readUInt16BE(16),
        u3:payload.readUInt16BE(18),
        Inked:payload.readUInt32BE(20),
      },
      Shoes:{
        Id:payload.readUInt16BE(24),
        SlotsActive:payload.readUInt16BE(32),
        SlotsUnlocked:payload.readUInt16BE(34),
        Sub:[
          payload.readUInt16BE(26),
          payload.readUInt16BE(28),
          payload.readUInt16BE(30)
        ],
      },
      Clothes:{
        Id:payload.readUInt16BE(36),
        SlotsActive:payload.readUInt16BE(44),
        SlotsUnlocked:payload.readUInt16BE(46),
        Sub:[
          payload.readUInt16BE(38),
          payload.readUInt16BE(40),
          payload.readUInt16BE(42)
        ],
      },
      Head:{
        Id:payload.readUInt16BE(48),
        SlotsActive:payload.readUInt16BE(56),
        SlotsUnlocked:payload.readUInt16BE(58),
        Sub:[
          payload.readUInt16BE(50),
          payload.readUInt16BE(52),
          payload.readUInt16BE(54)
        ],
      }
    };
  },
  Size:function(proto,payload){return 88;}
};