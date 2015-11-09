var mods=['NinFrame','Ping','Dummy','Handshake','CommandControl','Event'].map(function(name){
  return require(name);
});

mods.AddStuctures=function(decoder){//avoid having this duplicated
  for(var i=0i<mods.length;i++)
    decoder.AddStucture(mods[i]);
};
module.exports=mods;