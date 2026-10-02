import test from 'node:test';
import assert from 'node:assert/strict';
import {Inventory,RECIPES} from '../src/crafting.js';
import {buyVape,buyRefill,loadFlavor,VapeSession} from '../src/vaping.js';
import {VAPE_ID,VAPE_FLAVORS} from '../src/vape-data.js';
import {TOWNS,TOWN_BUILDINGS,canWalk,BUILDING_PORTALS} from '../src/world.js';
import {upgradeTool} from '../src/town-services.js';
import {heldItemPointWorld,playerArmPose} from '../src/player-animation.js';
import {itemSvg} from '../src/item-art.js';
function setup(){const inv=new Inventory();inv.coins=200;buyVape(inv,'berry');inv.equip(VAPE_ID);return {inv,p:{x:550,y:445,layer:'hearth-smoke',facing:0}};}
test('every village has a reachable smoke shop with a usable counter and exit',()=>{
 for(const t of TOWNS){const b=TOWN_BUILDINGS.find(b=>b.town===t.id&&b.type==='smoke');assert.ok(b);const portal=BUILDING_PORTALS.find(p=>p.id===b.id);assert.ok(canWalk(portal.surface.x,portal.surface.y,'surface'));assert.ok(canWalk(550,445,b.layer));assert.ok(canWalk(550,755,b.layer));assert.equal(canWalk(550,225,b.layer),false);}
});
test('the shop sells one device, flavor refills and rejects free crafting and invalid transactions',()=>{
 const inv=new Inventory(),recipe=RECIPES.find(r=>r.id===VAPE_ID);assert.equal(inv.canCraft(recipe),false);assert.equal(inv.craft(VAPE_ID).ok,false);assert.equal(buyVape(inv,'berry').ok,false);
 inv.coins=100;assert.equal(buyVape(inv,'invalid').ok,false);assert.equal(inv.coins,100);assert.equal(buyVape(inv,'berry').ok,true);assert.equal(inv.coins,20);assert.equal(inv.vape.charges.berry,20);assert.equal(buyVape(inv,'berry').ok,false);assert.equal(inv.coins,20);
 assert.equal(loadFlavor(inv,'mint').ok,false);assert.equal(buyRefill(inv,'mint').ok,true);assert.equal(inv.coins,8);assert.equal(inv.vape.flavor,'mint');assert.equal(inv.vape.charges.mint,20);assert.equal(buyRefill(inv,'cherry').ok,false);assert.equal(inv.coins,8);assert.equal(loadFlavor(inv,'berry').ok,true);assert.equal(upgradeTool(inv,VAPE_ID).ok,false);
});
test('hits consume one puff, respect cooldown and cannot run underwater or with an empty tank',()=>{
 const {inv,p}=setup(),v=new VapeSession();assert.equal(v.hit(inv,p,1000).ok,true);assert.equal(inv.vape.charges.berry,19);assert.equal(v.hit(inv,p,1100).cooldown,true);assert.equal(inv.vape.charges.berry,19);
 p.swimming=true;assert.equal(v.hit(inv,p,3000).ok,false);p.swimming=false;p.underwater=true;assert.equal(v.hit(inv,p,3000).ok,false);p.underwater=false;inv.vape.charges.berry=0;assert.equal(v.hit(inv,p,3000).ok,false);inv.equippedTool=null;assert.equal(v.hit(inv,p,3000).ok,false);
});
test('exhalation follows the held mouthpiece, uses loaded colors and creates escalating, temporary thoughts',()=>{
 const {inv,p}=setup(),v=new VapeSession();buyRefill(inv,'mint');
 for(let i=0;i<7;i++){const now=1000+i*2000;assert.ok(v.hit(inv,p,now).ok);v.update(now+649,p,inv);v.update(now+650,p,inv);assert.ok(v.clouds.length<=90);assert.ok(v.clouds.every(c=>c.color===VAPE_FLAVORS[1].color));if(i===0)assert.equal(v.thought,null);if(i===1)assert.match(v.thought.text,/smile|adventurers|guys/);if(i===3)assert.match(v.thought.text,/date|hand|campfire/);}
 assert.match(v.thought.text,/boyfriend|kiss|quest/);v.update(23000,p,inv);assert.equal(v.thought,null);assert.equal(v.clouds.length,0);v.hit(inv,p,70000);assert.equal(v.hits.length,1);
});
test('changing layers, equipping another tool or entering water cancels delayed exhalation',()=>{
 for(const mutate of [p=>p.layer='surface',p=>p.swimming=true,(_,inv)=>inv.equippedTool=null]){const {inv,p}=setup(),v=new VapeSession();v.hit(inv,p,1000);mutate(p,inv);v.update(1800,p,inv);assert.equal(v.clouds.length,0);assert.equal(v.pending,null);assert.equal(p.vapeUntil,0);v.clear(p);assert.equal(v.hits.length,0);}
});
test('the vape raises to the face for each direction and its illustrated tank has actual detail',()=>{
 for(const facing of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const p={x:0,y:0,facing,moving:false,vapeUntil:2000};const point=heldItemPointWorld(p,1000,'vape',{x:46,y:5});assert.ok(point.y< -65);assert.ok(Math.abs(point.x)<25);const pose=playerArmPose(p,1000,'vape');assert.ok(pose.arms[pose.heldArm].hand.y<45);const idle=playerArmPose(p,3000,'vape');assert.ok(idle.arms[idle.heldArm].hand.y>48);}
 const svg=itemSvg(RECIPES.find(r=>r.id===VAPE_ID),{background:false});assert.match(svg,/linearGradient id="prism"/);assert.match(svg,/linearGradient id="glass"/);assert.match(svg,/#c69bff/);
});
