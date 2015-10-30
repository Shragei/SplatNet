function Route(catchAll){
  var stack={};
  var defaults={};
  this.AddHandler=function AddRoute(type,fn){
    if(!(type in stack))
      stack[type]=[];
    stack[type].push(fn);
  };
  
  this.RemoveHandler=function RemoveRoute(type,fn){
    if(!(type in stack))
      return;
    var idx=stack[type].indexOf(fn);
    stack[type].splice(idx,1);
  };
  
  this.DefaultHandler=function AddDefault(type,fn){
    defaults[type]=fn;
  };
  
  this.Handle=function(packet){
    var frame=packet.IP.UDP.NinFrame;
    
    var payloadType=frame.PayloadType;
    if(stack[payloadType]!==undefined){
      var handlers=stack[payloadType];
      var idx=0;
      
      next();
      
      function next(stop){
        if(stop)
          return;
        if(idx<handlers.length)
          handlers[idx](payloadType,frame,next);
        idx++;
      }
    }else if(defaults[payloadType]!==undefined){
      defaults[payloadType](payloadType,frame);
    }else{
      catchAll(payloadType,frame);
    }
    
    done();
  };
}




module.exports=Route;