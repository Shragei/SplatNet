'use strict';
module.exports=[
  {
    Name:"IP",
    Depends:"Frame",
    Condition:function(proto,payload){return proto.Frame.EtherType===2048;},
    Format:function(proto,payload){
      function IPProto(buffer,offset){
        var proto=buffer.readUInt8(offset);
        switch(proto){
          case 1:return'ICMP';
          case 2:return'IGMP';
          case 3:return'GGP';
          case 4:return'IPinIP';
          case 6:return'TCP';
          case 7:return'EGP';
          case 17:return'UDP';
        }
      }
      function IPAddress(payload,offset){
        var address=[payload.readUInt8(offset),
                     payload.readUInt8(offset+1),
                     payload.readUInt8(offset+2),
                     payload.readUInt8(offset+3)];
        return address.join('.');
      }
      var length=payload.readUInt16BE(2);
      var headerSize=20;
      var IHL=payload.readUInt8(0)&0x0F;
      if(IHL>5)
        headerSize+=4
      return{
        IHL:IHL,
        Length:length-headerSize,
        Protocol:IPProto(payload,9),
        SourceAddress:IPAddress(payload,12),
        DestinationAddress:IPAddress(payload,16),
        Payload:payload.slice(headerSize)
      }
    },
    Size:function(proto,payload){
      var a=proto.Frame.IP.IHL>5?24:20;
      return a+proto.Frame.IP.Length;
    }
  },
  {
    Name:"TCP",
    Depends:"IP",
    Condition:function(proto,payload){return proto.Frame.IP.Protocol==='TCP';},
    Format:function(proto,payload){
      var offset=(payload.readUInt8(12)>>4)&0x0F;
      return{
        SourcePort:payload.readUInt16BE(0),
        DestinationPort:payload.readUInt16BE(2),
        SequenceNumber:payload.readUInt32BE(4),
        Acknowledgment:payload.readUInt32BE(8),
        DataOffset:offset,
        WindowSize:payload.readUInt16BE(14),
        Length:payload.length-offset*4,
        Payload:payload.slice(offset*4)
      }
    },

    Size:function(proto,payload){
      return proto.IP.TCP.Length+proto.IP.TCP.DataOffset;
    }
  },
  {
    Name:"UDP",
    Depends:"IP",
    Condition:function(proto,payload){return proto.Frame.IP.Protocol==='UDP';},
    Format:function(proto,payload){
      var length=payload.readUInt16BE(4);
      return {
        SourcePort:payload.readUInt16BE(0),
        DestinationPort:payload.readUInt16BE(2),
        Length:length-8,
        Payload:payload.slice(8)
      };
    },
    Size:function(proto,payload){return 8+proto.Frame.IP.UDP.Length}
  }
];