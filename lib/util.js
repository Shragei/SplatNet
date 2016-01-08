
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