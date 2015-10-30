var Capture=require('./lib/net/Capture');
var Decoder=require('./lib/net/Decoder');

var config=require('./config');

var cap=new Capture(config.TargetMAC);
var decoder=new Decoder();

cap.pipe(decoder);
decoder.on('data',function(data){
  console.log(data);
})
cap.Start();