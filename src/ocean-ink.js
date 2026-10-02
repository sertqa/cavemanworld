const clamp=v=>Math.max(0,Math.min(1,v));

export class InkCloud {
  constructor({x,y,targetX,targetY,layer='ocean'},now){
    Object.assign(this,{originX:x,originY:y,targetX,targetY,layer,createdAt:now,expiresAt:now+6000,x,y,radius:40});
  }
  update(now){
    const age=Math.max(0,now-this.createdAt),travel=clamp(age/850);
    this.x=this.originX+(this.targetX-this.originX)*travel;
    this.y=this.originY+(this.targetY-this.originY)*travel;
    this.radius=40+190*clamp(age/1100);
    this.opacity=clamp((this.expiresAt-now)/1200);
  }
  contains(player){return player.layer===this.layer&&this.opacity>.15&&Math.hypot(player.x-this.x,player.y-this.y)<this.radius;}
}

export class OceanInkRegistry {
  constructor(){this.clouds=[];}
  spray(data,now){this.clouds.push(new InkCloud(data,now));}
  update(dt,now,player){
    this.clouds=this.clouds.filter(c=>now<c.expiresAt);
    for(const cloud of this.clouds)cloud.update(now);
    if(player.layer!=='ocean'){this.clear(player);return;}
    const inside=this.clouds.some(c=>c.contains(player));
    player.inkExposure=inside?Math.min(1,(player.inkExposure||0)+dt*3):(player.inkExposure||0)*Math.exp(-dt*1.5);
    if(player.inkExposure<.015)player.inkExposure=0;
  }
  visible(bounds,layer){return this.clouds.filter(c=>c.layer===layer&&c.x+c.radius>bounds.left&&c.x-c.radius<bounds.right&&c.y+c.radius>bounds.top&&c.y-c.radius<bounds.bottom);}
  clear(player){this.clouds.length=0;if(player)player.inkExposure=0;}
}
