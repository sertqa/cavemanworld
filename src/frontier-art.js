import {gliderSideRig} from './glider-pose.js';
import {vehiclePoint} from './vehicle-pose.js';
import {MOUNTAINS,elevationOffset,altitudeAt,coastline} from './frontier-world.js';
import {distanceToSegment} from './world.js';
import {fishSpecies} from './fish-species.js';
import {grain} from './pixel-art.js';
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();};
const oval=(c,x,y,rx,ry,color)=>{for(let yy=-ry;yy<=ry;yy+=2){const r=Math.round(rx*Math.sqrt(Math.max(0,1-yy*yy/ry**2)));rect(c,x-r,y+yy,r*2,2,color);}};
function make(w=96,h=96){const image=document.createElement('canvas');image.width=w;image.height=h;return {image,c:image.getContext('2d'),ax:w/2,ay:h-8};}
export function frontierNode(art,ctx,n,time){
 const sprite=art.sprite('frontier:'+n.kind,()=>{const s=make(80,80),c=s.c;
 if(n.kind==='marijuana'){rect(c,38,29,4,42,'#50774a');for(const [x,y] of [[40,29],[40,45],[40,57]]){for(const [dx,dy] of [[-20,-7],[-13,-18],[0,-23],[13,-18],[20,-7]])poly(c,[[x,y],[x+dx,y+dy],[x+dx*.75,y+dy+9]],'#4caa65');rect(c,x-3,y-8,6,8,'#b3ce70');}}
 else if(n.kind==='treasure'){rect(c,16,39,48,31,'#514b3e');rect(c,18,42,44,25,'#9f703f');rect(c,20,32,40,15,'#b98a51');rect(c,22,31,36,4,'#d1a66a');rect(c,25,34,5,32,'#e1bc65');rect(c,51,34,5,32,'#e1bc65');rect(c,37,48,8,9,'#f9d87d');rect(c,39,50,3,4,'#655e43');}
 else if(n.kind==='crystal'){poly(c,[[22,70],[19,40],[30,23],[41,41],[43,70]],'#81b8ca');poly(c,[[34,68],[38,25],[51,10],[61,29],[58,67]],'#bdc9f1');poly(c,[[38,25],[51,10],[49,58]],'#e8e8fa');}
 else if(n.kind==='coral'){for(const [x,h] of [[19,25],[35,40],[52,30]]){rect(c,x,70-h,7,h,'#de9e8b');rect(c,x-9,69-h,14,5,'#f2c0a0');rect(c,x-9,63-h,5,10,'#efb392');rect(c,x+6,66-h,11,5,'#cb8fa5');}}
 else if(n.kind==='pearl'){oval(c,40,64,24,8,'#817b96');poly(c,[[18,63],[26,46],[39,40],[53,47],[62,63]],'#c3b0bb');oval(c,40,56,9,8,'#eef0d8');rect(c,36,51,4,3,'#ffffff');}
 else if(n.resource==='eagleFeather'){oval(c,40,65,25,8,'#99785c');oval(c,40,63,18,5,'#655d49');poly(c,[[36,62],[43,39],[49,39],[45,58]],'#eee3c8');}
 else {for(let i=0;i<6;i++)poly(c,[[37,71],[18+i*8,30+(i%3)*8],[42,67]],i%2?'#acb79b':'#d7d5af');}
 return s;});art.shadow(ctx,n.x,n.y,22);art.draw(ctx,sprite,n.x,n.y,1.5);
 if(n.kind==='treasure'){const phase=Math.floor(time/260)%4;if(phase<2){rect(ctx,n.x+23,n.y-45,3,8,'#eee0ad');rect(ctx,n.x+20,n.y-42,9,2,'#eee0ad');}}
}
export function aquaticOrBoss(art,ctx,m,time){
 if(!m.aquatic&&m.kind!=='bigfoot')return false;
 const f=fishSpecies(m.kind),throwing=m.windupUntil>time,phase=m.kind==='bigfoot'&&!m.moving?0:Math.floor(time/(m.kind==='bigfoot'?165:180))%4;
 const sprite=art.sprite(`frontier-mob:${m.kind}:${phase}:${throwing}`,()=>{const s=make(112,112),c=s.c;
 if(m.kind==='bigfoot'){
  const fur='#755b46',dark='#50483c',light='#a78a61';
  for(let i=0;i<2;i++){const x=i?67:35,stride=m.alive?[0,2,0,-2][(phase+i*2)%4]:0;rect(c,x,76,15,23+stride,dark);rect(c,x-3,98+stride,22,7,fur);rect(c,x+2,78,6,18,fur);}
  oval(c,56,62,27,29,fur);rect(c,35,48,12,35,light);rect(c,25,44,12,43,dark);if(throwing){rect(c,76,24,12,37,fur);rect(c,73,16,18,14,light);}else{rect(c,76,44,12,43,fur);rect(c,76,84,18,12,light);}rect(c,22,84,18,12,light);
  oval(c,56,32,22,23,dark);oval(c,56,36,17,16,light);rect(c,36,22,40,9,fur);rect(c,40,32,13,6,'#f3d6a0');rect(c,59,32,13,6,'#f3d6a0');rect(c,47,33,4,5,'#af5a47');rect(c,60,33,4,5,'#af5a47');rect(c,53,39,6,6,dark);rect(c,45,48,23,4,dark);rect(c,48,48,17,2,'#e4c49c');
  for(let i=0;i<18;i++)rect(c,31+grain(i,3)*48,52+grain(i,4)*32,3,5,i%2?fur:light);
 }else if(m.kind==='reefCrab'){
  for(let i=0;i<3;i++){const y=73+i*7;rect(c,23-i*3,y,19,4,'#bf745b');rect(c,69,y,20+i*3,4,'#bf745b');}oval(c,56,78,25,14,'#d69772');oval(c,27,62,10,9,'#eeb580');oval(c,86,62,10,9,'#eeb580');rect(c,44,58,5,13,'#d69772');rect(c,65,58,5,13,'#d69772');rect(c,43,57,7,6,'#f9efbe');rect(c,64,57,7,6,'#f9efbe');rect(c,46,58,3,4,'#464c47');rect(c,65,58,3,4,'#464c47');
 }else if(m.kind==='seaTurtle'){
  oval(c,56,74,28,24,'#489c8f');for(const x of [25,78]){oval(c,x,59+phase%2*3,13,6,'#85c5a2');oval(c,x,91,12,5,'#85c5a2');}oval(c,90,74,12,9,'#b4d4a5');rect(c,93,70,3,3,'#365b59');poly(c,[[42,58],[62,52],[75,70],[68,91],[46,94],[32,75]],'#63875c');poly(c,[[46,63],[60,58],[69,73],[61,85],[44,83],[38,73]],'#a4b67a');
 }else if(['jellyfish','giantSquid'].includes(m.kind)){
  const squid=m.kind==='giantSquid';for(let i=0;i<6;i++){rect(c,31+i*9+([0,2,0,-2][(phase+i)%4]),72,4,25+(i%2)*8,squid?'#976caa':'#99c5d3');}oval(c,56,67,squid?28:25,squid?28:20,squid?'#ba8db6':'#c5e5e6');rect(c,42,66,8,6,'#edeacb');rect(c,64,66,8,6,'#edeacb');rect(c,47,67,3,4,'#4c6174');rect(c,65,67,3,4,'#4c6174');
 }else if(m.kind==='mantaRay'||f?.name==='Giant Ray'){
  poly(c,[[12,66],[46,76],[56,53],[66,76],[103,66],[77,94],[56,87],[33,94]],f?.color||'#749cac');rect(c,54,84,4,24,'#638096');rect(c,46,75,3,4,'#eee4bc');rect(c,65,75,3,4,'#eee4bc');
 }else if(m.kind==='morayEel'){
  for(let i=0;i<10;i++)oval(c,16+i*8,78+Math.sin(i*.7+phase)*6,10,6,i%2?'#609789':'#93b693');rect(c,95,72,4,4,'#eddbb1');
 }else{
  const color=f?.color||(m.kind==='dolphin'?'#7fb6c4':'#679eaf');
  poly(c,[[27,79],[9,64+phase],[13,90-phase]],'#5e899c');oval(c,61,76,33,17,f?.color||color);oval(c,64,71,23,8,'#ffffff25');poly(c,[[43,60],[55,43],[67,62]],f?.color||'#74aab6');poly(c,[[49,86],[59,99],[69,86]],'#567f8e');rect(c,83,70,7,6,'#f0ead1');rect(c,87,71,3,4,'#385369');
  if(m.kind==='reefShark'){poly(c,[[90,68],[108,78],[91,87]],'#7aabb7');rect(c,79,85,14,2,'#ecdbc0');}
  if(f?.name==='Swordfish')poly(c,[[88,76],[111,73],[90,80]],'#adc6c9');
  if(f?.name==='Sunfish')oval(c,65,75,22,24,f.color);
 }
 return s;});
 const scale=m.kind==='bigfoot'?2.3:f?.rank?(.55+f.rank*.045):m.kind==='giantSquid'?1.5:1.1;
 art.shadow(ctx,m.x,m.y,m.radius);art.draw(ctx,sprite,m.x,m.y,scale,1,m.kind!=='bigfoot'&&Math.cos(m.facing)<0);
 if(m.kind==='giantSquid'&&m.inkWindupUntil>time){const pulse=52+Math.sin(time*.02)*6;ctx.strokeStyle='#d0b0ea';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(m.x,m.y,pulse,pulse*.65,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#eed5f4';ctx.font='bold 17px monospace';ctx.textAlign='center';ctx.fillText('INK!',m.x,m.y-95);}
 return true;
}
export function drawStructure(art,ctx,s,time){
 const phase=s.fuel>0?Math.floor(time/220)%4:0;
 const sprite=art.sprite('structure:'+s.kind+':'+(s.open?'open':'closed')+':'+(s.kind==='ore-extractor'?phase:0),()=>{const v=make(128,128),c=v.c;
 switch(s.kind){
 case 'wood-floor':v.ay=64;for(let y=0;y<128;y+=13){rect(c,0,y,128,12,'#b79567');rect(c,0,y+10,128,2,'#856b50');for(let x=15;x<118;x+=35)rect(c,x,y+3,2,2,'#77624a');}break;
 case 'stone-wall':for(let y=69;y<120;y+=15)for(let x=(y%2?0:9);x<125;x+=25){rect(c,x,y,24,14,'#7e9796');rect(c,x+2,y+1,20,3,'#adc0b3');}break;
 case 'wood-gate':rect(c,10,43,10,78,'#7d6247');rect(c,108,43,10,78,'#7d6247');if(!s.open){for(let x=24;x<105;x+=12)rect(c,x,52,9,65,'#b59766');rect(c,22,63,85,7,'#846349');rect(c,22,99,85,7,'#846349');}break;
 case 'storage-chest':rect(c,20,67,88,48,'#77583f');rect(c,20,60,88,19,'#b28b55');rect(c,28,62,7,51,'#d1b276');rect(c,93,62,7,51,'#d1b276');rect(c,58,80,13,12,'#e5c88a');break;
 case 'drying-shack':rect(c,19,50,90,67,'#99734d');rect(c,24,54,80,63,'#bea070');poly(c,[[7,51],[64,12],[121,51]],'#748864');rect(c,18,49,92,6,'#516c59');rect(c,30,70,67,5,'#6d5840');for(let i=0;i<4;i++){rect(c,39+i*15,75,2,23,'#c4b382');poly(c,[[34+i*15,79],[46+i*15,84],[39+i*15,103]],'#82ac65');}rect(c,23,112,84,5,'#805d43');break;
 case 'fish-trap':oval(c,64,96,48,20,'#7f9071');for(let x=26;x<106;x+=10)rect(c,x,75,4,35,'#bdac78');rect(c,23,83,84,4,'#d0bd8b');rect(c,29,104,70,4,'#d0bd8b');rect(c,59,69,9,43,'#626b58');break;
 case 'ore-extractor':rect(c,24,101,82,18,'#657b85');rect(c,35,39,10,66,'#a8babe');rect(c,86,39,10,66,'#a8babe');rect(c,31,38,70,13,'#718593');rect(c,50,51,30,42,'#62778b');poly(c,[[54,58],[64,48],[76,61],[69,77],[55,74]],'#acbee5');rect(c,61,91,8,27,'#d7d1c2');for(let y=94;y<118;y+=7)rect(c,57+(phase%2)*2,y,16,3,'#829b9f');break;
 case 'timber-rig':rect(c,15,102,98,15,'#8b7251');rect(c,35,20,12,89,'#ad905b');rect(c,35,20,65,11,'#bd9f6b');rect(c,93,28,3,49,'#b2bb9d');rect(c,78,76,28,10,'#829aa0');rect(c,21,91,20,12,'#78928c');break;
 case 'healing-totem':rect(c,52,51,23,65,'#8e795b');rect(c,42,94,43,9,'#6b6e58');poly(c,[[45,47],[64,22],[83,47],[64,74]],'#9bced1');poly(c,[[51,45],[63,31],[69,47],[64,65]],'#e0e8c2');break;
 }
 return v;});
 art.shadow(ctx,s.x,s.y,s.radius*.6);ctx.save();ctx.translate(s.x,s.y);if(s.rotation&&['wood-floor','stone-wall','wood-gate'].includes(s.kind))ctx.rotate(s.rotation);art.draw(ctx,sprite,0,0,['wood-floor','stone-wall','wood-gate'].includes(s.kind)?1:1.3);ctx.restore();
 if(s.kind==='healing-totem'&&s.fuel){ctx.strokeStyle='#b7e4c15a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x,s.y,240,200,0,0,Math.PI*2);ctx.stroke();}
}
export function drawMountains(ctx,b,time){
 for(const m of MOUNTAINS){
  if(m.x+m.rx<b.left||m.x-m.rx>b.right||m.y+m.ry<b.top||m.y-m.ry-elevationOffset(m.x,m.y)-1600>b.bottom)continue;
  const snow=m.id==='frostpeak',segments=72;
  const point=(r,a)=>{const x=m.x+Math.cos(a)*m.rx*r,y=m.y+Math.sin(a)*m.ry*r;return [x,y-elevationOffset(x,y)];};
  const outline=r=>Array.from({length:segments},(_,i)=>point(r,i*Math.PI*2/segments));
  // Opaque, angular rock faces cover the entire impassable slope, including its back.
  poly(ctx,outline(1),'#394b4c');
  for(const [band,outer] of [1,.80,.59].entries()){
   const inner=[.80,.59,.36][band];
   for(let i=0;i<segments;i++){
    const a=i*Math.PI*2/segments,next=(i+1)*Math.PI*2/segments;
    const light=(Math.cos(a-3.8)+1)/2,noise=grain(i,band+91)*12;
    const base=snow?[104,126,135]:[84,96,96];
    const color=`rgb(${base.map(v=>Math.round(v+light*40+noise-band*4)).join(',')})`;
    const p=point(outer,a),q=point(outer,next),r=point(inner,next),s=point(inner,a);
    poly(ctx,[p,q,r,s],color);
    poly(ctx,[p,r,s],snow?'#d6e5df20':'#d9dfbc15');
    // Long, broken seams and dark clefts give the slopes a readable rock structure.
    if(i%3===0){ctx.strokeStyle='#35484988';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...s);ctx.stroke();}
   }
  }
  ctx.strokeStyle='#364948';ctx.lineWidth=9;ctx.beginPath();outline(1).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.stroke();
  // Summit meadow/snow and its rock rim share the actual plateau boundary.
  poly(ctx,outline(.36),snow?'#d9e5df':m.id==='cloudspine'?'#9eafa0':'#92aa76');
  ctx.strokeStyle=snow?'#eff7ed':'#c3cfaa';ctx.lineWidth=8;ctx.beginPath();outline(.36).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.stroke();
  // Trail edges are projected from the same 175-unit corridor used by collision.
  for(let i=1;i<m.trail.length;i++){
   const a=m.trail[i-1],z=m.trail[i],length=Math.hypot(z[0]-a[0],z[1]-a[1]),nx=-(z[1]-a[1])/length,ny=(z[0]-a[0])/length;
   const edge=side=>Array.from({length:25},(_,j)=>{const t=j/24,x=a[0]+(z[0]-a[0])*t+nx*175*side,y=a[1]+(z[1]-a[1])*t+ny*175*side;return [x,y-elevationOffset(x,y)];});
   const left=edge(1),right=edge(-1).reverse();
   poly(ctx,[...left,...right],snow?'#b4b6aa':'#c1ae82');
   for(const points of [left,right]){ctx.strokeStyle='#544f4388';ctx.lineWidth=6;ctx.beginPath();points.forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
   // Exposed trail stones, fixed in world space.
   for(let j=1;j<24;j+=2){const t=j/24,x=a[0]+(z[0]-a[0])*t,y=a[1]+(z[1]-a[1])*t;rect(ctx,x-18,y-elevationOffset(x,y),36,5,'#e3d1a088');}
  }
  for(let i=0;i<330;i++){
   const a=grain(i,119)*Math.PI*2,r=.38+grain(i,121)*.61,x=m.x+Math.cos(a)*m.rx*r,y=m.y+Math.sin(a)*m.ry*r;
   if(x<b.left-100||x>b.right+100||y-elevationOffset(x,y)<b.top-100||y-elevationOffset(x,y)>b.bottom+100||m.trail.slice(1).some((v,j)=>distanceToSegment(x,y,...m.trail[j],...v)<205))continue;
   const py=y-elevationOffset(x,y),size=18+grain(i,123)*40;
   poly(ctx,[[x-size,py+8],[x-size*.7,py-size*.5],[x,py-size],[x+size,py+7]],snow?'#758b92':'#596c69');
   poly(ctx,[[x-size*.7,py-size*.5],[x,py-size],[x+size*.4,py-8],[x-size*.4,py]],snow?'#b8cfcc':'#aab4a0');
  }
  for(let gy=Math.floor(b.top/85);gy<=Math.ceil((b.bottom+elevationOffset(m.x,m.y))/85);gy++)for(let gx=Math.floor(b.left/85);gx<=Math.ceil(b.right/85);gx++){
   const x=gx*85+grain(gx,gy,31)*35,y=gy*85+grain(gx,gy,33)*35,r=Math.hypot((x-m.x)/m.rx,(y-m.y)/m.ry),py=y-elevationOffset(x,y);
   if(r<.365||r>.99||py<b.top-30||py>b.bottom+30||m.trail.slice(1).some((v,j)=>distanceToSegment(x,y,...m.trail[j],...v)<190))continue;
   const w=18+grain(gx,gy,35)*40;ctx.strokeStyle=snow?'#526d7970':'#364c4b70';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-w/2,py-9);ctx.lineTo(x,py-15);ctx.lineTo(x+w/2,py-6);ctx.lineTo(x+w/3,py+11);ctx.stroke();
   rect(ctx,x-w/2,py-12,w*.6,3,snow?'#daece675':'#b6c1a875');
  }
  // Serrated side ridges rise above the rear slopes; the central plateau stays open.
  for(let i=0;i<7;i++){
   const a=Math.PI+i*Math.PI/6,r=.64+grain(i,73)*.15,x=m.x+Math.cos(a)*m.rx*r,y=m.y+Math.sin(a)*m.ry*r,py=y-elevationOffset(x,y),w=500+grain(i,75)*420,h=850+grain(i,77)*700;
   poly(ctx,[[x-w,py+90],[x-w*.55,py-h*.30],[x-w*.10,py-h],[x+w*.32,py-h*.48],[x+w,py+90]],snow?'#647d89':'#526563');
   poly(ctx,[[x-w,py+90],[x-w*.55,py-h*.30],[x-w*.10,py-h],[x+w*.05,py-h*.38],[x,py+70]],snow?'#a8c3c6':'#96a396');
   poly(ctx,[[x-w*.10,py-h],[x+w*.32,py-h*.48],[x+w,py+90],[x+w*.05,py-h*.38]],snow?'#829da7':'#728883');
   if(snow||m.id==='cloudspine')poly(ctx,[[x-w*.32,py-h*.65],[x-w*.1,py-h],[x+w*.17,py-h*.68],[x+w*.02,py-h*.73],[x-w*.05,py-h*.64]],snow?'#edf5ed':'#d9e3d9');
  }
  const [tx,ty]=m.trail[0];rect(ctx,tx-120,ty-82,240,38,'#314a46');ctx.fillStyle='#f3dfae';ctx.font='bold 19px monospace';ctx.textAlign='center';ctx.fillText('↑ SUMMIT TRAIL',tx,ty-55);
 }
}
export function drawTransport(ctx,p,time){
 if(!p.vehicleId||p.underwater)return;ctx.save();ctx.translate(p.x,p.y);
 const point=(f,r=0,h=0)=>vehiclePoint(p.facing,f,r,h),shape=(points,color)=>poly(ctx,points.map(v=>point(...v)),color);
 const line=(points,color,width=3)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(...point(...v)):ctx.moveTo(...point(...v)));ctx.stroke();};
 if(p.vehicleId==='reed-raft'&&p.swimming){
  for(let i=0;i<6;i++){const r=-46+i*16;shape([[-36,r],[-36,r+14],[38,r+14],[50-Math.abs(r)*.25,r+7],[38,r]],'#b3aa65');line([[-34,r+3],[38,r+3]],'#dbc786',5);}
  line([[-22,-47],[-22,48]],'#76664d',3);line([[23,-47],[23,48]],'#76664d',3);
  // A reed prow and wake make the raft's heading readable even at rest.
  shape([[45,-9],[58,0],[45,9]],'#e0d095');
  if(p.moving){line([[-49,-33],[-65,-42]],'#b9e5d599',3);line([[-49,33],[-65,42]],'#b9e5d599',3);}
 }else if(p.vehicleId==='wood-scooter'){
  shape([[-30,-7],[32,-7],[32,7],[-30,7]],'#b88e56');
  line([[-27,-5],[29,-5]],'#e1b77d',3);
  for(const f of [-21,23]){const [x,y]=point(f,0,-6);oval(ctx,x,y,3+Math.abs(Math.cos(p.facing))*4,7,'#394b50');oval(ctx,x,y,2,3,'#89989b');}
  // The front stem moves around the rider but remains vertical when turning.
  line([[27,0,3],[27,0,49]],'#8da9a5',5);line([[27,-15,49],[27,15,49]],'#d8b880',5);
 }else if(p.vehicleId==='crystal-glider'){
  ctx.translate(0,-(p.flightHeight||0));
  if(Math.abs(Math.cos(p.facing))>.7){
   const rig=gliderSideRig(p.facing),s=Math.cos(p.facing)<0?-1:1;
   poly(ctx,rig.sail,'#a8c3dc');
   poly(ctx,[rig.sail[0],rig.sail[1],rig.sail[2],[15*s,-143]],'#7296bd');
   poly(ctx,[rig.sail[2],rig.sail[3],rig.sail[4],[15*s,-143]],'#537da7');
   poly(ctx,[rig.sail[0],[15*s,-143],rig.sail[4],rig.sail[5]],'#b8d6dc');
   ctx.strokeStyle='#cee6e5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(...rig.sail[0]);ctx.lineTo(...rig.nose);ctx.stroke();
   const grips=p.gliding?rig.grips:rig.grips.map(([x,y])=>[x,y-25]);
   ctx.strokeStyle='#c2ae80';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(...rig.rear);ctx.lineTo(...rig.apex);ctx.lineTo(...grips[1]);ctx.lineTo(...rig.rear);ctx.stroke();
   ctx.strokeStyle='#52707c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(grips[0][0]-9*s,grips[0][1]-3);ctx.lineTo(...grips[0]);ctx.lineTo(...grips[1]);ctx.lineTo(grips[1][0]+7*s,grips[1][1]+2);ctx.stroke();
   poly(ctx,[[110*s,-154],[119*s,-151],[111*s,-145]],'#e2edf2');
  }else{
   shape([[0,-100,120],[58,0,120],[0,100,120],[20,0,120]],'#a9b8d6');
   shape([[0,-100,120],[58,0,120],[20,0,120]],'#7f93bd');
   line([[55,0,120],[6,0,120]],'#c2a571',3);
   const grip=p.gliding?78:88;
   line([[10,-32,126],[10,-25,grip],[10,25,grip],[10,32,126]],'#d0b886',4);
   shape([[51,-5,120],[61,0,120],[51,5,120]],'#e2edf2');
  }
 }
 ctx.restore();
}
export function drawSeafloor(art,ctx,b,time){
 for(let gy=Math.floor(b.top/230);gy<=Math.ceil(b.bottom/230);gy++)for(let gx=Math.floor(b.left/220);gx<=Math.ceil(b.right/220);gx++){
  if(grain(gx,gy,71)<.60)continue;const x=gx*220+grain(gx,gy,73)*150,y=gy*230+grain(gx,gy,75)*150;if(x<coastline(y)+20)continue;
  const sprite=art.sprite('kelp:'+gx%3,()=>{const s=make(48,70),c=s.c;for(let i=0;i<4;i++){const px=12+i*8;rect(c,px,22+i*3,3,41-i*3,'#397b77');for(let j=0;j<3;j++)poly(c,[[px,34+j*11],[px+(i%2?-8:10),25+j*11],[px+3,41+j*11]],i%2?'#6bb59d':'#559e8e');}return s;});art.draw(ctx,sprite,x,y,1.4);
 }
 // Bubbles shimmer within fixed cells; they do not scroll the water texture.
 for(let i=0;i<12;i++){const x=b.left+grain(i,82)*(b.right-b.left),y=b.top+grain(i,83)*(b.bottom-b.top),phase=(Math.floor(time/350)+i)%4;ctx.strokeStyle='#b7e4dc45';ctx.lineWidth=1;ctx.strokeRect(x,y+(phase%2),phase<2?4:3,phase<2?4:3);}
}
