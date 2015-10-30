var crypt=require('crypto');
var mongojs=require("mongojs");
var q=require('q');

var config=require("../config");
var db=mongojs.mongojs(config.dburl,['Session','Packets','Messages']);
var sessionId=crypto.randomBytes(6).toString('base64');
var startTime=Date.now()/1000;

//don't care if index already exists mongo will just ignore the call
db.Session.createIndex({SessionId:1});
db.Packets.createIndex({SessionId:1});
db.Packets.createIndex({Timestamp:1});//used with the packets
db.Packets.createIndex({LogTimestamp:1});//used by the logger
db.Messages.createIndex({SessionId:1});
db.Messages.createIndex({LogTimestamp:1});
export.Message(msg){
  var defer=q.defer()
  var date=Date.now();
  db.Messages.save({
    TimeStamp:Date.now()/1000,
    Message:msg
  },function(err){
    if(err)
      defer.reject(err);
    else
      defer.resolve();
  });
  return defer.promise;
}

export.Packet(packet){
  var defer=q.defer()
  var date=Date.now()/1000;
  packet=packet.ROOT;
  packet.LogTimestamp=Date.now();
  packet.SessionId=sessionId;
  db.Packets.save({
    Timestamp:packet.Timestamp,
    LogTimestamp:date,
    'Length':packet.Length,
    SessionId:sessionId,
    Direction:packet.Direction,
    Frame:packet.Frame
  },function(err,doc){
    if(err)
      defer.reject(err);
    else
      defer.resolve(doc);
  });
  return defer.promise;
}
process.on('exit',function(){
  db.Session.Save({
    SessionId:sessionId,
    Start:startTime,
    End:Date.now()/1000
  });
  process.exit();
});