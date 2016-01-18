
//_bsontype objects are the bane of my existence  >:(
exports.fixMongo=function(obj){
  var objStack=[obj];
  var keyStack=[Object.keys(obj)];
  var idxStack=[0];
  while(idxStack.length){
    var skip=false;
    for(var depth=idxStack.length-1;idxStack[depth]<keyStack[depth].length;idxStack[depth]++){
      var idx=idxStack[depth];
      var key=keyStack[depth][idx];
      var val=objStack[depth][key];
      if(typeof(val)==='object'&&val!==null){
        if(val._bsontype==='Binary'){
          objStack[depth][key]=val.buffer;
        }else if(key!=='parent'&&key!=='super'){
          idxStack.push(0);
          idxStack[depth]++;
          keyStack.push(Object.keys(val));
          objStack.push(val);
          skip=true;
          break;
        }
      }
    }
    if(!skip){
      keyStack.pop();
      idxStack.pop();
      objStack.pop();
    }
  }
}
exports.readInt24LE=function(buffer,offset){
  var b=new Buffer([0,0,0,0]);
  b[3]=buffer[offset+2];b[2]=buffer[offset+1];b[1]=buffer[offset];b[0]=0;//shift to the left one byte to maintain number sign
  return b.readInt32LE(0)>>8;//move the number back 8 bits to return orginal.
}