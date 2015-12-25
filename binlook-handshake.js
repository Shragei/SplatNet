var mongojs=require('mongojs');
var config=require('./config.json');
var db=mongojs(config.dburl,['Packets']);
var offset=0;
var limit=2000;
var minlength=0;
var maxlength=500;

var val=0;
//if(process.argv.length===3)
//  val=new Number(process.argv[2])
var match=new Buffer([0x03,val]);
var set={};
var lastBuff=new Buffer([]);
var maxlog;
var cursor=db.Packets.find({"Frame.IP.UDP.NinFrame.PayloadType":1,SessionId:process.argv[2],Direction:process.argv[3]}).sort({Timestamp:1});

cursor.on('data',function(doc){
 // if(process.argv.length===3)
    viewpacket(doc);
 // else
 //   uniq(doc);
});
cursor.on('end',function(){
  db.close();
});

function uniq(packet){
  var subtype=packet.Frame.IP.UDP.NinMainAuth.Payload.buffer.slice(1,2).toString('hex');
  if(subtype in set){
    set[subtype]++;
  }else{
    set[subtype]=0;
  }
}
var count=0;
function viewpacket(packet){
  var el=packet.Frame.IP.UDP.NinFrame.Payload.buffer;
  var NinFrame=packet.Frame.IP.UDP.NinFrame;
  
  if(el.compare(lastBuff)!==0)
    lastBuff=el;
  else return;
  var buf=el;//.slice(18,18+6);
  var ret=[];
  for(var i=0;i<buf.length;i++){
    var t=buf[i].toString(2);
    while(t.length<8){
      t='0'+t;
    }
    ret.push(t);
  }
  //ret=ret.join('');
  ret=buf.toString('hex');
 if(NinFrame.Handshake.Type==="Name"){
   // console.log(ret.substr(62,10));
   var name=new Buffer(31);
   var nameLength=buf[68];
   buf.slice(37,37+31).copy(name);
   name=name.toString('ucs2');
   console.log(NinFrame.Slot+' '+name.substr(0,nameLength));
 //   euclidean(buf,8);
  // cursor.destroy();
 }
  if(maxlog!==undefined&&(count++)>maxlog)
    cursor.destroy();
}