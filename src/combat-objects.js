import { canWalk, PORTALS, DESCENTS } from './world.js';

const DROP_LIFETIME=300000;
const LANDING_MS=650;

export class LootDrop {
  constructor({id,resource,amount,x,y,layer,spawnAt,angle=0,distance=65}){
    Object.assign(this,{id,resource,amount,x,y,layer,spawnAt,active:true});
    const landingX=x+Math.cos(angle)*distance,landingY=y+Math.sin(angle)*distance;
    this.landX=canWalk(landingX,landingY,layer,12)?landingX:x;
    this.landY=canWalk(landingX,landingY,layer,12)?landingY:y;
  }
  landed(now){return now-this.spawnAt>=LANDING_MS;}
  visual(now){
    const t=Math.max(0,Math.min(1,(now-this.spawnAt)/LANDING_MS));
    const glide=1-(1-t)**3;
    return {x:this.x+(this.landX-this.x)*glide,y:this.y+(this.landY-this.y)*glide,height:Math.sin(Math.PI*t)*32};
  }
}

export class LootRegistry {
  constructor(){this.drops=[];this.serial=0;}
  spawn(loot,x,y,layer,now){
    const entries=Object.entries(loot);
    for(let i=0;i<entries.length;i++){
      const [resource,amount]=entries[i],angle=-Math.PI/2+i*Math.PI*2/entries.length+.35;
      this.drops.push(new LootDrop({id:`drop-${++this.serial}`,resource,amount,x,y,layer,spawnAt:now,angle,distance:53+(i%2)*24}));
    }
  }
  update(now){this.drops=this.drops.filter(d=>d.active&&now-d.spawnAt<DROP_LIFETIME);}
  visible(bounds,layer){return this.drops.filter(d=>d.active&&d.layer===layer&&d.landX>bounds.left-120&&d.landX<bounds.right+120&&d.landY>bounds.top-120&&d.landY<bounds.bottom+120);}
  nearest(x,y,layer,now,range=125){let closest=null,best=range;for(const d of this.drops){if(!d.active||d.layer!==layer||!d.landed(now))continue;const distance=Math.hypot(x-d.landX,y-d.landY);if(distance<best){closest=d;best=distance;}}return closest;}
  collect(drop){if(!drop?.active)return false;drop.active=false;return true;}
}

export class RockProjectile {
  constructor({x,y,angle,speed,damage,layer,sourceId,createdAt,kind='rock',radius=12,lifetime=2800,landingDistance=Infinity}){
    Object.assign(this,{x,y,angle,speed,damage,layer,sourceId,createdAt,kind,radius,lifetime,remaining:landingDistance,travelDistance:landingDistance,active:true});
    this.vx=Math.cos(angle)*speed;this.vy=Math.sin(angle)*speed;
  }
  stop(splat=true){this.active=false;this.splatted=splat&&this.kind==='feces';}
  update(dt,now,player,creatures,structures){
    if(!this.active)return null;
    if(player.layer!==this.layer){this.stop(false);return null;}
    if(now-this.createdAt>this.lifetime){this.stop();return null;}
    const steps=Math.max(1,Math.ceil(this.speed*dt/12));
    for(let i=0;i<steps;i++){
      const step=Math.min(this.speed*dt/steps,this.remaining);
      const x=this.x+Math.cos(this.angle)*step,y=this.y+Math.sin(this.angle)*step;
      if(!canWalk(x,y,this.layer,9,true)||structures?.blocks(x,y,this.layer,9)||[...PORTALS,...DESCENTS].some(p=>p[this.layer]&&Math.hypot(x-p[this.layer].x,y-p[this.layer].y)<210)){this.stop();return null;}
      this.x=x;this.y=y;this.remaining-=step;
      const playerSafe=[...PORTALS,...DESCENTS].some(p=>p[player.layer]&&Math.hypot(player.x-p[player.layer].x,player.y-p[player.layer].y)<225);
      if(!playerSafe&&Math.hypot(player.x-x,player.y-y)<18+this.radius){this.stop();return {damage:this.damage,sourceId:this.sourceId,kind:this.kind};}
      if(this.remaining<.001){this.stop();return null;}
    }
    return null;
  }
}

export class PlayerProjectile {
 constructor({x,y,point,damage,layer,type,createdAt}){Object.assign(this,{x,y,damage,layer,type,createdAt,active:true,owner:'player'});this.angle=Math.atan2(point.y-y,point.x-x);this.speed=type==='bow'?720:540;this.remaining=Math.min(1100,Math.max(80,Math.hypot(point.x-x,point.y-y)+50));}
 update(dt,now,player,creatures,structures){
  if(!this.active)return null;
  if(player.layer!==this.layer||now-this.createdAt>2300){this.active=false;return null;}
  const distance=Math.min(this.remaining,this.speed*dt),steps=Math.max(1,Math.ceil(distance/10));
  for(let i=0;i<steps;i++){
   this.x+=Math.cos(this.angle)*distance/steps;this.y+=Math.sin(this.angle)*distance/steps;
   if(!canWalk(this.x,this.y,this.layer,5,true)||structures?.blocks(this.x,this.y,this.layer,5)){this.active=false;return null;}
   const target=creatures?.nearby(this.x,this.y,this.layer,70).find(c=>c.active!==false&&c.health>0&&Math.hypot(c.x-this.x,c.y-this.y)<(c.radius||22)+8);
   if(target){this.active=false;return {target,result:target.hit(this.damage,now),damage:this.damage};}
  }
  this.remaining-=distance;if(this.remaining<=0)this.active=false;return null;
 }
}
export class FecesPuddle {
  constructor(projectile,now){
    Object.assign(this,{x:projectile.x,y:projectile.y,layer:projectile.layer,sourceId:projectile.sourceId,createdAt:now,expiresAt:now+8000,radius:90,damage:8});
  }
  contains(player){return player.layer===this.layer&&!player.gliding&&(player.jumpHeight||0)<12&&Math.hypot(player.x-this.x,player.y-this.y)<this.radius+18;}
}
export class ProjectileRegistry {
  constructor(){this.projectiles=[];this.puddles=[];this.nextHazardHitAt=0;}
  launch(data,sourceId,now){this.projectiles.push(new RockProjectile({...data,sourceId,createdAt:now}));}
  shoot(data,now){this.projectiles.push(new PlayerProjectile({...data,createdAt:now}));}
  update(dt,now,player,creatures,structures){
    const hits=[];
    this.puddles=this.puddles.filter(p=>now<p.expiresAt);
    // One tick per second across overlapping splats; jumping or gliding avoids them.
    if(now>=this.nextHazardHitAt){const puddle=this.puddles.find(p=>p.contains(player));if(puddle){hits.push({damage:puddle.damage,sourceId:puddle.sourceId,kind:'feces-puddle'});this.nextHazardHitAt=now+1000;}}
    for(const projectile of this.projectiles){
      const hit=projectile.update(dt,now,player,creatures,structures);if(hit)hits.push(hit);
      if(projectile.splatted){this.puddles.push(new FecesPuddle(projectile,now));projectile.splatted=false;}
    }
    this.projectiles=this.projectiles.filter(p=>p.active);return hits;
  }
  visible(bounds,layer){return this.projectiles.filter(p=>p.active&&p.layer===layer&&p.x>bounds.left-60&&p.x<bounds.right+60&&p.y>bounds.top-60&&p.y<bounds.bottom+60);}
  visiblePuddles(bounds,layer){return this.puddles.filter(p=>p.layer===layer&&p.x>bounds.left-p.radius&&p.x<bounds.right+p.radius&&p.y>bounds.top-p.radius&&p.y<bounds.bottom+p.radius);}
  clear(){this.projectiles.length=0;this.puddles.length=0;this.nextHazardHitAt=0;}
}
