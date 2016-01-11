var exec=require('child_process').exec;

function Ping(address,cb){
  var times=[];
  //add check for IPv6
  if(!(address.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)!==null||address==='localhost'))
    return cb(2);
  
  var proc=exec('ping -c 5 '+address);
  proc.stdout.on('data',function(data){
    var match=data.match(/time=(\d+\.\d+)/g);
    if(match.length==1)
      times.push(parseFloat(match[0].substr(5)));
  });
  proc.on('exit',function(exit){
    var avg;
    if(times.length&&exit===0)
      avg=times.reduce(function(prev,cur,idx){return prev+cur})/times.length;
    cb(exit,Math.floor(avg*100)/100);
  });
}

module.exports=Ping;