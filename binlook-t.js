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
var maxlog;  //"Frame.IP.UDP.NinFrame.PayloadType":1,
var cursor=db.Packets.find({"Frame.IP.UDP.NinFrame.Event.Type":"Player",SessionId:process.argv[2],Direction:process.argv[3]}).sort({Timestamp:1});
var seen={};
cursor.on('data',function(doc){
 // if(process.argv.length===3)
    viewpacket(doc);
 // else
 //   uniq(doc);
});
cursor.on('end',function(){
  console.log(seen);
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
  var el=packet.Frame.IP.UDP.NinFrame.Event.Payload.buffer;
  if(el.compare(lastBuff)!==0)
    lastBuff=el;
  else return;
  var buf=el;//.slice(18,18+6);
  var ret=[];

  //ret=ret.join('');
  ret=buf.toString('hex');
  var address=packet.Frame.IP.DestinationAddress;
  while(address.length<15)
    address+=' ';
  var type=ret.substr(0,4);
  if(type==='1058')
    console.log(ret.substr(16));
  

}
