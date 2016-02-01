function Pack(){
  var buff=new Buffer([]);
  var position=0;
  var size=0;
  
  this.Set=function(buffer){
    buff=buffer;
    position=0;
    size=buffer.length*8;
  }
  
  this.Seek=function(bits){
    if(position+bits<size)
      position=bits;
  }
  this.Shift=function(bits){
    if(position+bits<size)
      position+=bits;
  }
  this.Copy=function(bytes,to){
    if(to.length<bytes)
      throw new Error('Pack.Copy: copy to buffer is too small.');
    if(position+(bytes*8)>=size)
      throw new Error('Pack.Copy: read past end of buffer');
    var fromByte=Math.floor(position/8);
    var fromBit=position%8;
    var top=fromBit;
    var bottom=8-fromBit;
    
    for(k=0,i=fromByte;k<bytes;k++,i++){
      to[k]=buff[i]<<top|buff[i+1]>>bottom;
    }
    
    position+=bytes*8;
  }
}

module.exports=Pack