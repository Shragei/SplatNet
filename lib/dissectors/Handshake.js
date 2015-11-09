module.exports={
  Name:'Handshake',
  Depends:"NinFrame",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.PayloadType===1;
  },
  Format:function(proto,payload){
    var sub=payload.readUInt8(0);
    var seq;
    var ret={};
    if(payload.length>5)
      seq=payload.readUInt32BE(payload.length-4);

    switch(sub){
      case 1:
        ret.Type="Synchronize";
        ret.Payload=payload.slice(1,payload.length-4);
        ret.SeqId=seq;
        break;
      case 2:
        ret.Type="Established";
        ret.Payload=payload.slice(1,payload.length-4);
        ret.SeqId=seq;
        break;
      case 3:
        ret.Type='Disconnect';
        break;
      case 4:
        ret.Type='Disconnect ACK';
        break;
      case 5:
        ret.Type='ACK';
        ret.SeqId=seq;
        break;
      default:
    }
    return ret;
  },
  Size:function(proto,payload){return proto.Frame.IP.UDP.NinFrame.Length}   
};