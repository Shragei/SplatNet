var Capture=require('./lib/net/Capture');
var Decoder=require('./lib/net/Decoder');
var Dissectors=require('../lib/dissectors');

var config=require('./config');

var cap=new Capture(config.TargetMAC);
var decoder=new Decoder();
Dissectors.AddStuctures(decoder);

cap.pipe(decoder);
decoder.on('data',function(data){
  console.log(data);
})
cap.Start();