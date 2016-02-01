
var Playback=require('./lib/net/Playback');
var Capture=require('./lib/net/Capture');
var Decoder=require('./lib/net/Decoder');
var Dissectors=require('./lib/dissectors');
var Connections=require('./lib/state/Connections');


var config=require('./config');
var io=require('socket.io')(config.Port);


var state=new Connections();
state.on('end',function(){
  console.log('state end');
});

if(process.argv.length===3){
  console.error('requires session');
  var play=new Playback();
  play.on('end',function(){
    console.log('db end');
    process.exit();
  });
  play.pipe(state);
}else{
  var cap=new Capture(config.TargetMAC);
  var decode=new Decoder();
  Dissectors.AddStuctures(decoder);
  cap.pipe(decode);
  decode.pipe(state);
}

var SplatPeers={};
var ioPeers={};

io.on('connection',function(socket){
  socket.emit('StatePush',SplatPeers);
});

state.on('Connection',function(peer){
  var name=peer.IP;
  console.log('Peer connected '+name);
  io.emit('PeerConnection',peer);
  SplatPeers[peer.IP]=peer;
  
  peer.on('Disconnect',function(){
    io.emit('PeerDisconnect',peer.IP);
    delete SplatPeers[peer.IP];
    console.log(name+' disconnected');
  });
  
  peer.on('Hello',function(inkling){
   // console.log(name+' Name'+inkling.Name);
    io.emit('Hello',{
      IP:peer.ip,
      State:inkling
    });
    console.log(peer.Slot+' '+peer.Name);
    name=inkling.Name;
  });
  peer.on('Gear',function(gear){
    io.emit('Gear',{
      IP:peer.ip,
      State:gear
    });
    console.log(peer.Slot+' '+peer.Name+' '+gear.Model+', lvl '+gear.Level+', wp '+gear.Weapon.Id);
  });
 
  peer.on('Movement',function(move){
    io.emit('Movement',{
      IP:peer.ip,
      State:move
    });
    var p=move.Position;
 //   console.log(name+' ('+p.X+','+p.Y+','+p.Z+')')
  });
});


server.listen(config.Port);
play.Start(process.argv[2]);

