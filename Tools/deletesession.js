var mongojs=require('mongojs');
var config=require('../config.json');


var mongojs=require('mongojs');
var config=require('../config.json');

var db=mongojs(config.dburl,['Sessions','Packets']);

if(process.argv.length!==3){
  console.log('sessionId required');
  process.exit(1);
}
  
var sessionId=process.argv[2];
db.Sessions.remove({SessionId:sessionId},function(){
  db.Packets.remove({SessionId:sessionId},function(){
    db.close();
  });
});