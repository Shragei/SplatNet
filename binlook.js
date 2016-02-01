var Pack=require('./lib/Pack');
var mongojs=require('mongojs');
var config=require('./config.json');
var db=mongojs(config.dburl,['Packets']);
var pack=new Pack();
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
  {'Timestamp':1,SessionId:1,Direction:1,Frame:1}).sort({Timestamp:1});
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
  var timestamp=packet.Timestamp;
  
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
        if(process.argv.length==9){
          var actions=process.argv[8].split('');
          for(var a=0;a<actions.length;a++){
            switch(actions[a]){
              case 'E':
                p=switchEndian(p);
                break;
              case 'L':
                p=rotL(p);
                break;
              case 'R':
                p=rotR(p);
                break;
              case 'U':
                console.log(readUInt(p));
                break;
              case 'S':
                console.log(readInt(p));
                break;
              case 'H':
                console.log(timestamp+' '+p.toString('hex'));
                break;
              case 'B':
                console.log(toBin(p));
                break;
              case 'F':
                console.log(p.readFloatBE(0));
                break;
              case 'T':
                test(p);
                break;
              case 'Q':
                testB(p);
                break;
            }
          }
        }else{
          console.log(p.toString('hex'))
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

function test(p){
  var t=new Buffer(10);
  var int=new Buffer(4);
  
  for(var i=p.length-1,k=0;i>=0;i--,k++)
    t[k]=p[i];
  pack.Set(t);
  pack.Copy(3,int);
  var z=int.readUInt32BE(0);
  pack.Shift(1);
  pack.Copy(3,int);
  var y=int.readUInt32BE(0);
  pack.Shift(1);
  pack.Copy(3,int);
  var x=int.readUInt32BE(0);
  console.log('('+x+','+y+','+z+')');
}

function toBin(p){
  var o=[];
  var f='00000000';
  for(var i=0;i<p.length;i++){
    var t=p[i].toString(2);
    t=f.substr(0,8-t.length)+t;
    o.push(t);
  }
  return o.join('');
}

function readUInt(p){
  var t=new Buffer([0,0,0,0]);
  for(var i=p.length-1,k=3;k>=0;i--,k--)
    t[k]=p[i];
  return t.readUInt32BE(0);
}
function readInt(b){
  var t=new Buffer([0,0,0,0]);
  for(var i=0;i<t.length&&i<b.length;i++)
    t[i]=b[i];
  var shift=Math.min(4-b.length,0)*8;
  return t.readInt32BE(0)>>shift;
}


function rotR(p){
  var t=new Buffer(p.length);
  var remander=p[p.length-1]&0x01;
  for(var i=0;i<p.length;i++){
    t[i]=(p[i]>>1)|(0x80*remander);
    remander=p[i]&0x01;
  }
  return t;
}
function rotL(p){
  var t=new Buffer(p.length);
  var remander=p[0]&0x80;
  for(var i=p.length-1;i>=0;i--){
    t[i]=(p[i]<<1)|(remander>>7);
    remander=p[i]&0x80;
  }
  return t;
}
function switchEndian(p){
  var t=new Buffer(p.length);
  for(var k=p.length-1,j=0;k>=0;k--,j++)
    t[j]=p[k];
  return t;
};

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
