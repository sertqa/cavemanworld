import {coastline} from './frontier-world.js';
// A fictional comedy retreat. Cameos and dialogue do not describe actual visits.
export const VIP_ISLAND={id:'vip-island',name:'Palm VIP Island',x:88700,y:19500,rx:880,ry:1080};
export const VIP_PAVILION={x:88670,y:19280,width:440,height:240};
const bridgeY=19800,bridgeHeight=110;
// Overlap both shorelines so the player's full collision circle can cross.
const bridgeWest=Math.min(...[-55,0,55].map(dy=>coastline(bridgeY+dy)))-160;
const bridgeEast=VIP_ISLAND.x-VIP_ISLAND.rx+220;
export const VIP_DOCK={x:(bridgeWest+bridgeEast)/2,y:bridgeY,width:bridgeEast-bridgeWest,height:bridgeHeight};
export function islandDistance(x,y){
 const i=VIP_ISLAND,dx=(x-i.x)/i.rx,dy=(y-i.y)/i.ry,a=Math.atan2(dy,dx),edge=1+.035*Math.sin(a*5)+.02*Math.cos(a*9);
 return (edge-Math.hypot(dx,dy))*Math.min(i.rx,i.ry);
}
export function dockDistance(x,y){return Math.min(VIP_DOCK.width/2-Math.abs(x-VIP_DOCK.x),VIP_DOCK.height/2-Math.abs(y-VIP_DOCK.y));}
export function pavilionBlocks(x,y,radius=0){const p=VIP_PAVILION;return Math.abs(x-p.x)<p.width/2+radius&&Math.abs(y-p.y)<p.height/2+radius;}
export const ISLAND_PALMS=[[-580,-260],[-390,-640],[260,-650],[560,-300],[-560,500],[480,510],[250,780],[-240,800],[620,90],[-640,110]];
export function vipResidents(){
 const cameos=[
  ['andrew','Prince Andrew',-270,140,'#8f929a','#365d91','tea','The tea committee has rejected my application. Apparently I forgot the biscuits.'],
  ['clinton','Bill Clinton',70,190,'#e8e1cc','#456584','sax','I brought a saxophone. Nobody asked, but I brought it anyway.'],
  ['musk','Elon Musk',310,10,'#514039','#383c48','rocket','The coconut dispenser needs a subscription. The first coconut is a free trial.'],
  ['hawking','Stephen Hawking',-300,-350,'#8b7560','#526d89','chair','The stars are fascinating. The telescope is currently pointing at a palm tree.'],
  ['chef','Celebrity Chef',-110,520,'#8b593b','#e9d9a8','chef','This coconut is RAW! Actually, that is how coconuts work.'],
  ['popstar','Pop Star',330,400,'#d9b46f','#b570ad','star','I came for a quiet holiday. My entourage brought three fog machines.'],
 ];
 return cameos.map(([id,name,dx,dy,hair,shirt,prop,greeting])=>({id:'vip-'+id,name,title:'Fictional adult cameo',age:40,role:'vip',layer:'surface',x:VIP_ISLAND.x+dx,y:VIP_ISLAND.y+dy,homeX:VIP_ISLAND.x+dx,homeY:VIP_ISLAND.y+dy,facing:Math.PI/2,moving:false,fixed:prop==='chair',prop,greeting,appearance:{id:'vip-'+id,skin:'#e5b998',skinLight:'#f5cfaf',skinShade:'#be896c',hair,shirt}}));
}
