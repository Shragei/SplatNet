var mongojs=require('mongojs');
var config=require('../config.json');


var mongojs=require('mongojs');
var config=require('../config.json');

var db=mongojs(config.dburl,['Sessions','Packets']);


var cur=db.Sessions.find({}).sort({SessionId:1});
var sessions=[];
cur.on('data',function(s){
  sessions.push(s);
});

cur.on('end',function(){
  var max=0;
  for(var i=0;i<sessions.length;i++){
    if(max<sessions[i].SessionId.length)
      max=sessions[i].SessionId.length;
  }
  for(var i=0;i<sessions.length;i++){
    for(var j=sessions[i].SessionId.length;j<max;j++)
      sessions[i].SessionId+=' ';
    console.log(sessions[i].SessionId+' ('+(Math.floor(sessions[i].Duration*100)/100)+')');
  }
    
  db.close();
})