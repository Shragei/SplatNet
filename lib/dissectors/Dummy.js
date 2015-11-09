module.exports={
  Name:'Dummy',
  Depends:"NinFrame",
  Condition:function(proto,payload){
    return proto.Frame.IP.UDP.NinFrame.PayloadType===0;
  },
  Format:function(proto,payload){  //used to be an actual packet that had Dummy as the payload
    return {Text:'Dummy'};
  },
  Size:function(proto,payload){return proto.Frame.IP.UDP.NinFrame.Length}
};