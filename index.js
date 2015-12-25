var Capture=require('./lib/net/Capture');
var Decoder=require('./lib/net/Decoder');
var Dissectors=require('../lib/dissectors');

var app=require('express')();
var server=require('http').createServer(app);
var Socket=require('socket.io');
var config=require('./config');

var cap=new Capture(config.TargetMAC);
var decoder=new Decoder();
Dissectors.AddStuctures(decoder);

cap.pipe(decoder);
decoder.on('data',function(data){
  console.log(data);
})
cap.Start();

server.listen(config.Port)