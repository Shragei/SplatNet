var mongojs=require('mongojs');
var config=require('../config.json');

var db=mongojs(config.dburl,['Sessions','Packets']);

if(process.argv.length<3){
  console.log('sessionId required');
  process.exit(1);
}

var sessionId=process.argv[2];
db.Sessions.findOne({SessionId:sessionId},function(err,doc){
  var start=doc.StartTime;
  var end=doc.EndTime;
  var offset=parseInt(process.argv[3]);
  if(offset<0){
    offset=doc.Duration+offset
  }
  var length=parseInt(process.argv[4]);
  var newSessionId=process.argv[5];
  if(isNaN(length)){
    newSessionId=process.argv[4];
    length=doc.Duration-offset;
  }
  var query={
    SessionId:sessionId,
    Timestamp:{
      $gte:doc.StartTime+offset,
      $lte:doc.StartTime+offset+length
    }
  };

  var cur=db.Packets.find(query);
  var lowerLimit=Number.MAX_SAFE_INTEGER;
  var upperLimit=0;
  var count=0;
  var size=0;
  cur.on('data',function(packet){
    if(packet.Timestamp<lowerLimit)
      lowerLimit=packet.Timestamp;
    if(packet.Timestamp>upperLimit)
      upperLimit=packet.Timestamp;
    size+=packet.Length;
    packet.SessionId=newSessionId;
    db.Packets.save(packet);
    count++;
  });
  cur.on('end',function(){
    if(count>0){
      console.log('Session: '+newSessionId+' Duration: '+(upperLimit-lowerLimit));
      db.Sessions.save({
        SessionId:newSessionId,
        StartTime:lowerLimit,
        EndTime:upperLimit,
        Duration:upperLimit-lowerLimit,
        PacketCount:count,
        TotalData:size
      },function(){
        db.close();
      });
    }else{
      console.log("No new Session created can't find packets within timeframe");
      db.close();
    }
  });
});