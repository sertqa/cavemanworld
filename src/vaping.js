import {Tool} from './spawnables.js';
import {heldItemPointWorld} from './player-animation.js';
import {worldToScreen} from './camera.js';
import {VAPE_ID,VAPE_RECIPE,VAPE_PRICE,REFILL_PRICE,REFILL_PUFFS,vapeFlavor,VAPE_FLAVORS} from './vape-data.js';

export function buyVape(inventory,flavor){
 if(!VAPE_FLAVORS.some(f=>f.id===flavor))return {ok:false,message:'Choose a flavor.'};
 if(inventory.owned.has(VAPE_ID))return {ok:false,message:'You already own a Prism Vape.'};
 if(inventory.coins<VAPE_PRICE)return {ok:false,message:'You need 80 coins. Sell supplies at a general shop.'};
 inventory.coins-=VAPE_PRICE;inventory.owned.set(VAPE_ID,new Tool(VAPE_RECIPE));inventory.vape.flavor=flavor;inventory.vape.charges[flavor]+=REFILL_PUFFS;
 return {ok:true,message:'Prism Vape purchased with 20 puffs. Equip it below, then press F or click to take a hit.'};
}
export function buyRefill(inventory,flavor){
 if(!inventory.owned.has(VAPE_ID)||!VAPE_FLAVORS.some(f=>f.id===flavor))return {ok:false,message:'Buy a vape and choose a flavor first.'};
 if(inventory.coins<REFILL_PRICE)return {ok:false,message:'Not enough coins for a refill.'};
 inventory.coins-=REFILL_PRICE;inventory.vape.charges[flavor]+=REFILL_PUFFS;inventory.vape.flavor=flavor;
 return {ok:true,message:`Loaded ${vapeFlavor(flavor).name} · 20 more puffs.`};
}
export function loadFlavor(inventory,flavor){
 if(!inventory.owned.has(VAPE_ID)||!(inventory.vape.charges[flavor]>0))return {ok:false,message:'Buy a refill for that flavor first.'};
 inventory.vape.flavor=flavor;return {ok:true,message:`Loaded ${vapeFlavor(flavor).name}.`};
}
const thoughts=[
 ['That guy has a really nice smile.','I wonder if he likes adventurers.','Handsome guys make this village better.'],
 ['I could hold his hand all the way home.','A sunset, a campfire... and a handsome guy.','Maybe I should ask him on a date.'],
 ['Okay. I definitely want to kiss him.','My next quest: ask that handsome guy out.','Forget treasure. I want a boyfriend.'],
];
export class VapeSession{
 constructor(){this.clouds=[];this.hits=[];this.nextHitAt=0;this.pending=null;this.thought=null;}
 hit(inventory,player,now){
  if(inventory.equippedTool?.id!==VAPE_ID)return {ok:false,message:'Equip your Prism Vape first.'};
  if(player.swimming||player.underwater)return {ok:false,message:'Get out of the water before taking a hit.'};
  if(now<this.nextHitAt)return {ok:false,cooldown:true};
  const flavor=vapeFlavor(inventory.vape.flavor);
  if(!inventory.vape.charges[flavor.id])return {ok:false,message:'Empty tank. Buy a refill or load another flavor in your inventory.'};
  inventory.vape.charges[flavor.id]--;this.hits=this.hits.filter(t=>now-t<45000);this.hits.push(now);
  const count=this.hits.length,tier=count>=7?2:count>=4?1:0;
  this.pending={at:now+650,layer:player.layer,flavor,count,text:count>=2?thoughts[tier][(count-2)%3]:null};
  this.nextHitAt=now+1800;player.vapeUntil=now+1250;
  return {ok:true,flavor:flavor.id,hits:count};
 }
 update(now,player,inventory,elevation=0){
  this.clouds=this.clouds.filter(c=>now-c.at<3800&&c.layer===player.layer);
  if(this.thought&&(now>=this.thought.until||this.thought.layer!==player.layer))this.thought=null;
  if(!this.pending)return;
  if(player.layer!==this.pending.layer||player.swimming||player.underwater||inventory.equippedTool?.id!==VAPE_ID){this.pending=null;player.vapeUntil=0;return;}
  if(now<this.pending.at)return;
  const p=this.pending,mouth=heldItemPointWorld(player,now,'vape',{x:46,y:5});
  for(let i=0;i<18;i++){const seed=i*2.39996,spread=10+i*.8;this.clouds.push({x:mouth.x,y:mouth.y-elevation,dx:Math.cos(player.facing)*65+Math.cos(seed)*spread,dy:Math.sin(player.facing)*38+Math.sin(seed)*spread,at:now,layer:player.layer,color:p.flavor.color,radius:7+i%5*2+Math.min(p.count,8)});}
  this.clouds=this.clouds.slice(-90);
  if(p.text)this.thought={text:p.text,color:p.flavor.color,until:now+6000,layer:player.layer};
  this.pending=null;
 }
 clear(player){this.clouds=[];this.hits=[];this.pending=null;this.thought=null;this.nextHitAt=0;player.vapeUntil=0;}
 draw(ctx,camera,zoom,width,height,now){
  ctx.save();ctx.imageSmoothingEnabled=true;
  for(const c of this.clouds){const t=Math.max(0,(now-c.at)/3800),s=worldToScreen(c.x+c.dx*t*2,c.y+c.dy*t*2-55*t,camera,zoom,width,height),r=(c.radius+42*t)*zoom;
   ctx.globalAlpha=.15*(1-t)**1.4;ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);ctx.fill();
   ctx.globalAlpha=.055*(1-t);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x-r*.12,s.y-r*.15,r*.78,0,Math.PI*2);ctx.fill();
  }ctx.restore();
 }
}
