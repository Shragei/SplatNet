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
var cursor=db.Packets.find({"Frame.IP.UDP.NinFrame.Event.Type":'Player',SessionId:process.argv[2],Direction:'Outbound'}).sort({Timestamp:1});

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
  var el=packet.Frame.IP.UDP.NinFrame.Event.Payload.buffer;
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
 if(buf[0]===0x10&&buf[1]===0x3c){
   // console.log(ret.substr(62,10));
    console.log(ret);
 //   euclidean(buf,8);
  }
  if(maxlog!==undefined&&(count++)>maxlog)
    cursor.destroy();
}
function leExpand(buf,off){
  var t=new Buffer([0,buf[off+2],buf[off+1],buf[off]]);
  return t.readUInt32BE(0);
}
function euclidean(buff,pos){
  buff=buff.slice(pos,pos+9);
  console.log('('+leExpand(buff,0)+','+leExpand(buff,3)+','+leExpand(buff,6)+')');
}
function eulerAngles(buff){
  console.log('('+buff.readFloatBE(0)+','+buff.readFloatBE(4)+')');
}