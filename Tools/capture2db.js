//requires root to use pcap
var crypto=require('crypto');
var mongojs=require('mongojs');
var Capture=require('../lib/net/Capture');
var Decoder=require('../lib/net/Decoder');
var Dissectors=require('../lib/dissectors');
var config=require('../config.json');

var mongojs=require('mongojs');

if(process.env.SplatNet_db_url!==undefined) //override the config
  config.dburl=process.env.SplatNet_db_url;

var db=mongojs(config.dburl,['Session','Packets']);

var sessionId=crypto.randomBytes(6).toString('base64');
if(process.argv.length===3){ //override default sessionId with user provided sessionId
  sessionId=process.argv[2];
}


db.Session.createIndex({SessionId:1});
db.Packets.createIndex({SessionId:1});
db.Packets.createIndex({Timestamp:1});

var cap=new Capture(config.TargetMAC);
var decoder=new Decoder();
Dissectors.AddStuctures(decoder);

var startTime=Date.now()/1000;

cap.pipe(decoder);

var packetCount=0;
var totalData=0;
decoder.on('data',function(data){
  if(data.Frame.IP!==undefined&&data.Frame.IP.UDP!==undefined&&data.Frame.IP.UDP.NinFrame!==undefined){//ignore all packets that don't have have the ninFrame
    packetCount++;
    totalData+=data.Frame.IP.UDP.Payload.length
    db.Packets.save(data);
  }
});

process.on('SIGINT',function(){
  var endtime=Date.now()/1000
  db.Session.save({
    SessionId:sessionId,
    StartStart:startTime,
    EndTime:endtime,
    Duration:endtime-startTime,
    PacketCount:packetCount,
    TotalData:totalData
  });
  console.log("Session: "+sessionId+" Duration: "+(endtime-startTime));
  process.exit();
});
cap.Start(sessionId);