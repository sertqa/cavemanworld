import test from 'node:test';
import assert from 'node:assert/strict';
import {gliderSideRig,GLIDER_SIDE_HANDS,GLIDER_PILOT_SCALE} from '../src/glider-pose.js';
import {CAMERA_TILT} from '../src/camera.js';
import {TOWNS,TOWN_BUILDINGS,BUILDING_PORTALS,canWalk,portalDestination,PATHS} from '../src/world.js';
import {NpcRegistry,QuestBook} from '../src/expeditions.js';
import {brothelResidents,loungeVisit} from '../src/brothels.js';
import {Inventory} from '../src/crafting.js';
import {PlayerVitals} from '../src/combat.js';

test('side glider has a wide overhead canopy and both reaching hands attach to the control bar',()=>{
  const east=gliderSideRig(0),west=gliderSideRig(Math.PI);
  const xs=east.sail.map(p=>p[0]),ys=east.sail.map(p=>p[1]);
  assert.ok(Math.max(...xs)-Math.min(...xs)>3*(Math.max(...ys)-Math.min(...ys)));
  assert.ok(Math.max(...ys)<Math.min(...east.grips.map(p=>p[1]))-60);
  for(let i=0;i<2;i++){
    const hand=GLIDER_SIDE_HANDS[i];assert.ok(hand.x>90);assert.ok(east.grips[i][0]>75);
    assert.equal(east.grips[i][0],(hand.x-48)*GLIDER_PILOT_SCALE);
    assert.equal(east.grips[i][1],(hand.y-61)*GLIDER_PILOT_SCALE/CAMERA_TILT-12);
    assert.equal(west.grips[i][0],-east.grips[i][0]);assert.equal(west.grips[i][1],east.grips[i][1]);
  }
  assert.ok(east.nose[0]>east.apex[0]);assert.ok(west.nose[0]<west.apex[0]);
});
test('every town has a reachable brothel, a return exit and adult residents on clear floor',()=>{
  const registry=new NpcRegistry(),quests=new QuestBook();
  for(const town of TOWNS){
    const building=TOWN_BUILDINGS.find(b=>b.town===town.id&&b.type==='brothel');assert.ok(building);
    const portal=BUILDING_PORTALS.find(p=>p.id===building.id);assert.ok(portal);
    assert.ok(PATHS.some(p=>p.name===building.name+' Lane'));
    assert.equal(portalDestination(portal,'surface'),building.layer);assert.equal(portalDestination(portal,building.layer),'surface');
    assert.ok(canWalk(portal.surface.x,portal.surface.y,'surface'));assert.ok(canWalk(550,755,building.layer));
    const residents=registry.items.filter(n=>n.venueId===building.id);assert.equal(residents.length,3);
    for(const guest of residents){assert.ok(guest.age>=21);assert.ok(guest.appearance.dress);assert.ok(canWalk(guest.x,guest.y,guest.layer,24));assert.equal(quests.task(guest),null);}
  }
});
test('lounge drinks and rest spend the shared wallet, reject overspending, and cap healing',()=>{
  const inv=new Inventory(),vitals=new PlayerVitals(),guest=brothelResidents(TOWN_BUILDINGS.find(b=>b.type==='brothel'))[1];
  inv.coins=9;assert.equal(loungeVisit(inv,vitals,'drink',guest).ok,false);assert.equal(inv.coins,9);
  assert.ok(loungeVisit(inv,vitals,'flirt',guest).ok);assert.equal(inv.coins,9);
  inv.coins=60;assert.ok(loungeVisit(inv,vitals,'drink',guest).ok);assert.equal(inv.coins,50);
  assert.equal(loungeVisit(inv,vitals,'rest',guest).ok,false);assert.equal(inv.coins,50);
  vitals.health=85;assert.ok(loungeVisit(inv,vitals,'rest',guest).ok);assert.equal(vitals.health,100);assert.equal(inv.coins,25);
  vitals.health=20;assert.ok(loungeVisit(inv,vitals,'rest',guest).ok);assert.equal(vitals.health,60);assert.equal(inv.coins,0);
  assert.equal(loungeVisit(inv,vitals,'rest',guest).ok,false);assert.equal(vitals.health,60);
  assert.equal(loungeVisit(inv,vitals,'invalid',guest).ok,false);assert.equal(loungeVisit(inv,vitals,'flirt',null).ok,false);
});
