var mods=['NinFrame','Ping','Dummy','Handshake',
          'CommandControl','Event','Movement',
          'Gear','200a','200f','201a','303a','302a','302d'].map(function(name){
  return require('./'+name);
});

mods.AddStuctures=function(decoder){//avoid having this duplicated
  for(var i=0;i<mods.length;i++)
    decoder.AddStucture(mods[i]);
};
module.exports=mods;