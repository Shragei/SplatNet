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

var cursor=db.Packets.find(
  {"Frame.IP.UDP.NinFrame.Event.Type":'Player',SessionId:process.argv[2],Direction:process.argv[3]},
 // {"Frame.IP.UDP.NinFrame.Event.Type":{$exists:true},SessionId:process.argv[2],Direction:process.argv[3]},
  {'Timestmap':1,SessionId:1,Direction:1,Frame:1}).sort({Timestamp:1});
/*var query=[
  {
    $match:{
      "Frame.IP.UDP.NinFrame.Event.Type":'Player',
      SessionId:process.argv[2],
      Direction:process.argv[3]
    }
  },{
    $sort:{Timestamp:1}
  }
];
console.log(query);
var cursor=db.Packets.aggregate(query,
  {allowDiskUse:true,
   cursor:{batchSize:150}
  }
);*/

cursor.on('data',function(doc){
  var el=doc.Frame.IP.UDP.NinFrame.Event.Payload.buffer;
  if(el.compare(lastBuff)!==0)
    lastBuff=el;
  else return;
  
  if(process.argv.length>=6){
    viewpacket(doc);
    //pairs(doc,process.argv[4]);
  }else{
    uniq(doc);
  }
});
cursor.on('end',function(){
  if(process.argv.length<6)
    console.log(set);
  db.close();
});

function uniq(packet){
  var el=packet.Frame.IP.UDP.NinFrame.Event.Payload.buffer;

  var blocks=breakBlock(el);
  //var subtype=packet.Frame.IP.UDP.NinFrame.Event.Type//Payload.buffer.slice(0,2).toString('hex');
  for(var i=0;i<blocks.length;i++){
    var cat=blocks[i].slice(0,1).toString('hex');
    var subtype=blocks[i].slice(3,5).toString('hex');
    var key=cat+' '+subtype;
    if(key in set){
      set[key]++;
    }else{
      set[key]=1;
    }
  }
}
var count=0;
function viewpacket(packet){
  var el=packet.Frame.IP.UDP.NinFrame.Event.Payload.buffer;

  var blocks=breakBlock(el);
  for(var i=0;i<blocks.length;i++){
    if(blocks[i].slice(0,1).toString('hex')===process.argv[4]&&blocks[i].slice(3,5).toString('hex')===process.argv[5]){
      var ret=blocks.map(function(el){return el.toString('hex')});
      var address=packet.Direction==='Outbound'?packet.Frame.IP.DestinationAddress:packet.Frame.IP.SourceAddress;
      while(address.length<15)
        address+=' ';
    //  console.log(address+' '+ret);
      if(process.argv.length>=8){
        var off=parseInt(process.argv[6]);
        var size=parseInt(process.argv[7]);
        var p=blocks[i].slice(off,off+size);
        switch(process.argv[8]){
          case 'L':
            var t=new Buffer(p.length);
            for(var k=p.length-1,j=0;k>=0;k--,j++)
              t[j]=p[k];
            p=t;
            console.log(p.toString('hex'));
          break;
          case '24L':
            console.log(readInt24LE(p,0));
        }
        
      }else{
        console.log(blocks[i].toString('hex'));
      }
    //  return; 
    }
  }

  var buf=el;

  

  if(maxlog!==undefined&&(count++)>maxlog)
    cursor.destroy();
}
function breakBlock(buf){
  var off=0;
  var blocks=[];
  while((off+1)<buf.length){
    var size=buf.readUInt8(off+1);
    blocks.push(buf.slice(off,off+size))
    off+=size;
  }
  return blocks;
}
function pairs(packet,key){
  var blocks=breakBlock(packet.Frame.IP.UDP.NinFrame.Event.Payload.buffer);
  for(var i=0;i<blocks.length;i++){
    if(blocks[i].slice(3,5).toString('hex')===key){
      console.log(blocks.map(function(el){
        return el.slice(0,1).toString('hex')+' '+el.slice(3,5).toString('hex');
      }).join(', '));
      return;
    }
  }
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

function readInt24LE(buffer,offset){
  var b=new Buffer([0,0,0,0]);
  b[3]=buffer[offset+2];b[2]=buffer[offset+1];b[1]=buffer[offset];b[0]=0;//shift to the left one byte to maintain number sign
  return b.readInt32LE(0)>>8;//move the number back 8 bits to return orginal.
}