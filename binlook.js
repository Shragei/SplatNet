var mongojs=require('mongojs');
var db=mongojs('localhost/test',['Packets']);
var offset=0;
var limit=2000;
var minlength=0;
var maxlength=500;
var seesionId="CYOrO4vJ";
var type=36;
var direction='Outbound';
var val=0;
if(process.argv.length===3)
  val=new Number(process.argv[2])
var match=new Buffer([0x03,val]);
var set={};
var lastBuff=new Buffer([]);
var maxlog=10;
var cursor=db.Packets.find({SessionId:seesionId,"Frame.IP.UDP.NinMainAuth.PayloadType":type,Direction:direction}).sort({Timestamp:1});

cursor.on('data',function(doc){
  if(process.argv.length===3)
    viewpacket(doc);
  else
    uniq(doc);
});
cursor.on('end',function(){
  console.log(set);
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

  var el=packet.Frame.IP.UDP.NinMainAuth.Payload.buffer;
  if(Buffer.compare(el.slice(0,2),match)===0&&Buffer.compare(el,lastBuff)!==0&&el.length>=minlength&&el.length<=maxlength)
      lastBuff=el;
  else
    return;
    
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
  console.log(ret);
  if(maxlog!==undefined&&(count++)>maxlog)
    cursor.destroy();
}