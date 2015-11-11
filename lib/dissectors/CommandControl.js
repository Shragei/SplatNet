module.exports={
  Name:'CommandControl',
  Depends:"NinFrame",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.PayloadType===2;
  },
  Format:function(proto,payload){
    return {
      Payload:payload
    };
  },
  Size:function(proto,payload){return proto.Frame.IP.UDP.NinFrame.Length}
};