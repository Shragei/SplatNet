var mongojs=require('mongojs');

var Decoder=require('../lib/net/Decoder');
var config=require('../config.json');

var db=mongojs(config.dburl,['Packets']);

var decoder=new Decoder();
var query={};
if(process.argv.length===3){ //apply update to one sessionId 
  query.sessionId=process.argv[2];
}
var reprocessed=0;
var cursor=db.Packets.find(query);
cursor.pipe(decoder);

decoder.on('data',function(packet){
  reprocessed++;
  db.Packets.save(packet);
});

cursor.on('end',function(){
  console.log("Reprocessed: "+reprocessed+' Packet(s)');
  process.exit();
});
