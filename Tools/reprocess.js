'use strict';
var util=require('util');
var stream=require('stream');
var mongojs=require('mongojs');

var Decoder=require('../lib/net/Decoder');
var Dissectors=require('../lib/dissectors');
var config=require('../config.json');


if(process.env.SplatNet_db_url!==undefined) //override the config
  config.dburl=process.env.SplatNet_db_url;

var db=mongojs(config.dburl,['Packets']);

var decoder=new Decoder();
Dissectors.AddStuctures(decoder);

var query={};
if(process.argv.length===3){ //apply update to one sessionId 
  query.SessionId=process.argv[2];
}
var reprocessed=0;
var cursor=db.Packets.find(query);
var bf=new stream.Transform({objectMode:true});
bf._transform=function Transform(chunk,encoding,next){//fix the bson binary
  if(chunk.Frame.IP)
    delete chunk.Frame.IP;
  chunk.Frame.Payload=chunk.Frame.Payload.buffer
  next(null,chunk); 
};
cursor.pipe(bf);
bf.pipe(decoder);

decoder.on('data',function(packet){
  reprocessed++;
  db.Packets.save(packet);
});

cursor.on('end',function(){
  console.log("Reprocessed: "+reprocessed+' Packet(s)');
  process.exit();
});

