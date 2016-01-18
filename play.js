
var Playback=require('./lib/net/Playback');
var Decoder=require('./lib/net/Decoder');
var Dissectors=require('./lib/dissectors');
var Connections=require('./lib/state/Connections');

var app=require('express')();
var server=require('http').createServer(app);
var Socket=require('socket.io');
var config=require('./config');

if(process.argv.length!=3)
  console.error('requires session');

//var cap=new Capture(config.TargetMAC);
var play=new Playback();
var state=new Connections();


play.on('end',function(){
  console.log('db end');
  process.exit();
});
state.on('end',function(){
  console.log('state end');
});
play.pipe(state);

state.on('Connection',function(peer){
  var name=peer.IP
  console.log('Peer connected '+name);
  
  peer.on('Disconnect',function(){
    console.log(name+' disconnected');
  });
  
  peer.on('Hello',function(inkling){
   // console.log(name+' Name'+inkling.Name);
    console.log(peer.Slot+' '+peer.Name);
    name=inkling.Name;
  });
  peer.on('Gear',function(gear){
    console.log(peer.Slot+' '+peer.Name+' '+gear.Model+', lvl '+gear.Level+', wp '+gear.Weapon.Id);
  });
 
  peer.on('Movement',function(move){
    var p=move.Position;
 //   console.log(name+' ('+p.X+','+p.Y+','+p.Z+')')
  });
});


server.listen(config.Port);
play.Start(process.argv[2]);

