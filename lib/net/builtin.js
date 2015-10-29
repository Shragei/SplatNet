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
  },
  {
    Name:"NinMainAuth",
    Depends:"UDP",
    Condition:function(proto,payload){
      var p=payload;
      return proto.Frame.IP.UDP.Length>=48&&(p[0]==0x32&&p[1]==0xAB&&p[2]==0x98);
    },
    Format:function(proto,payload){
      var ret={
        Magic:payload.slice(0,4),
        Sub:payload.readUInt8(4),
        ID:payload.readUInt8(5),
        Counter:payload.readUInt16BE(6),
        Timeing:{
          Local:payload.readUInt16BE(8),
          Remote:payload.readUInt16BE(10),
          Delta:payload.readUInt16BE(10)-payload.readUInt16BE(8)
        },
        'Flags':payload.slice(12,13),
        'Slot':payload.readUInt8(13),
        Length:payload.readUInt16BE(14),
        Padding:payload.length-(payload.readUInt16BE(14)+44),
        Unknown1:payload.slice(16,20),
        NNID:payload.readUInt32BE(20),
        PayloadType:payload.readUInt8(24),
        Unknown2:payload.slice(25,31),
        HMAC:payload.slice(payload.length-12), //used to be 16byte hmac
        Payload:payload.slice(32,32+payload.readUInt16BE(14))
      };
      if(ret.ID===0)
        ret.Timeing.Delta=null;
      return ret;
    }
  },
  {
    Name:'SplatoonDummy',
    Depends:"NinMainAuth",
    Condition:function(proto,payload){
      return proto.Frame.IP.UDP.PayloadType===0;
    },
    Format:function(proto,payload){
      return 'Dummy';
    }
  },
  {
    Name:'SplatoonHandshake',
    Depends:"NinMainAuth",
    Condition:function(proto,payload){
      return proto.Frame.IP.UDP.NinMainAuth.PayloadType===1;
    },
    Format:function(proto,payload){
      var sub=payload.readUInt8(0);
      var seq;
      var ret={};
      if(payload.length>5)
        seq=payload.readUInt32BE(payload.length-4);
      
      switch(sub){
        case 1:
          ret.Type="Handshake (1)";
          ret.Payload=payload.slice(1,payload.length-4);
          ret.SeqId=seq;
          break;
        case 2:
          ret.Type="Handshake (2)";
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
    }       
  },
  {
    Name:'SplatoonCommandControl',
    Depends:"NinMainAuth",
    Condition:function(proto,payload){
      return proto.Frame.IP.UDP.PayloadType===2;
    },
    Format:function(proto,payload){
      return {
        Payload:payload
      };
    }
  },
  {
    Name:'SplatoonPing',
    Depends:"NinMainAuth",
    Condition:function(proto,payload){
      return proto.Frame.IP.UDP.PayloadType===6;
    },
    Format:function(proto,payload){
      return{
        ACK:payload.readUInt32BE(0),
        Seq:payload.slice(payload.length-5,payload.length)
      };
    }
  },
  {
    Name:'SplatoonEvent',
    Depends:"NinMainAuth",
    Condition:function(proto,payload){
      return proto.Frame.IP.UDP.PayloadType===36;
    },
    Format:function(proto,payload){
      var sub=payload.readUint8(1);
      var ret={
        Type:sub,
        Frame:payload.readUint16BE(2),
      }
      
      switch(sub){
        case 0x11:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.splice(12,16);
          break;
        case 0x21:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.splice(12,24);
          break;
        case 0x31:
        case 0x32:
        case 0x33:
          ret.Meta=payload.slice(4,8);
          break;
        case 0x41:
          ret.Meta=payload.slice(4,12);
          break;
        case 0x81:
        case 0x82:
        case 0x83:
        case 0x84:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,16);
          break;
        case 0x91:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,20);
          break;
        case 0xa1:
        case 0xa2:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,24);
          break;
        case 0xd3:
          ret.Type='Player';
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,payload.length);
          break;
        case 0xc1:
          ret.Meta=payload.slice(4,12);
          ret.Payload=payload.slice(12,28);
          break;
 
      }
      return ret;
    }
  },
];