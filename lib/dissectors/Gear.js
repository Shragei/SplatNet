var abilitiesList=[
  'Damage Up',
  'Defense Up',
  'Ink Saver (Main)',
  'Ink Saver (Sub)',
  'Ink Recovery Up',
  '0x0005',
  'Swim Speed Up',
  'Special Charge Up',
  '0x0008',
  'Quick Respawn',
  'Special Saver',
  '0x000b',
  'Bomb Range Up'
];

function abilitiesMap(p,off){
  var val=p.readUInt16BE(off);
  var name=abilitiesList[val];
  if(name===undefined){
    name=val.toString(16);
    for(var i=0;i<4;i++)
      name='0'+name;
    name='0x'+name;
  }
  return name;
}

function modelMap(p,off){
  var val=p.readUInt8(off);
  if(val===0)
    return 'Inkling (female)';
  if(val===1)
    return 'Inkling (male)';
  return 'Unknown';
}
module.exports={
  Name:'Gear',
  Depends:"Event",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.Event.Type==='Player'&&payload.readUInt8(0)===0x10&&payload.readUInt16BE(3)===0x0100;
  },
  Format:function(proto,payload){
    payload=payload.slice(8);
    return{
      Model:modelMap(payload,8),
      SkinColor:payload.readUInt8(9),
      EyesColor:payload.readUInt8(10),
      Level:payload.readUInt8(62)+1,
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
          abilitiesMap(payload,26),
          abilitiesMap(payload,28),
          abilitiesMap(payload,30)
        ],
      },
      Clothes:{
        Id:payload.readUInt16BE(36),
        SlotsActive:payload.readUInt16BE(44),
        SlotsUnlocked:payload.readUInt16BE(46),
        Sub:[
          abilitiesMap(payload,38),
          abilitiesMap(payload,40),
          abilitiesMap(payload,42)
        ],
      },
      Head:{
        Id:payload.readUInt16BE(48),
        SlotsActive:payload.readUInt16BE(56),
        SlotsUnlocked:payload.readUInt16BE(58),
        Sub:[
          abilitiesMap(payload,50),
          abilitiesMap(payload,52),
          abilitiesMap(payload,54)
        ],
      },
      Payload:payload.slice(0,88)//used in this case to fingerprint this event payload
    };
  },
  Size:function(proto,payload){return 88;}
};