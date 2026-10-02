import test from 'node:test';
import assert from 'node:assert/strict';
import {ProjectileRegistry} from '../src/combat-objects.js';
import {DivingSession} from '../src/expeditions.js';
import {coastline} from '../src/frontier-world.js';
import {updateGliding} from '../src/gliding.js';

const shot={x:13000,y:8500,angle:0,speed:340,damage:25,layer:'surface',kind:'feces',landingDistance:340};
test('dodged feces lands at its aim point, damages entrants at most once a second and expires',()=>{
  const registry=new ProjectileRegistry(),player={x:14000,y:8500,layer:'surface'};
  registry.launch(shot,'bigfoot',0);
  assert.deepEqual(registry.update(1,1000,player),[]);
  assert.equal(registry.projectiles.length,0);assert.equal(registry.puddles.length,1);
  const puddle=registry.puddles[0];assert.ok(Math.abs(puddle.x-13340)<.001);
  player.x=puddle.x;
  assert.equal(registry.update(.1,1100,player)[0].damage,8);
  assert.deepEqual(registry.update(.1,1200,player),[]);
  assert.equal(registry.update(.1,2100,player)[0].kind,'feces-puddle');
  player.jumpHeight=20;assert.deepEqual(registry.update(.1,3100,player),[]);
  player.jumpHeight=0;player.gliding=true;assert.deepEqual(registry.update(.1,4100,player),[]);
  player.gliding=false;player.layer='ocean';assert.deepEqual(registry.update(.1,5100,player),[]);
  player.layer='surface';player.x+=200;assert.deepEqual(registry.update(.1,6100,player),[]);
  player.x=puddle.x;assert.deepEqual(registry.update(.1,9000,player),[]);assert.equal(registry.puddles.length,0);
});
test('direct feces hits and wall impacts splat once; logs never create puddles',()=>{
  const player={x:13100,y:8500,layer:'surface'},registry=new ProjectileRegistry();
  registry.launch(shot,'bigfoot',0);
  assert.equal(registry.update(.5,500,player)[0].damage,25);assert.equal(registry.puddles.length,1);
  registry.update(.1,600,player);assert.equal(registry.puddles.length,1);
  registry.clear();assert.equal(registry.puddles.length,0);
  player.x=14000;registry.launch(shot,'bigfoot',1000);
  registry.update(.5,1500,player,null,{blocks:x=>x>13080});assert.equal(registry.puddles.length,1);assert.ok(registry.puddles[0].x<=13080);
  registry.clear();registry.launch({...shot,kind:'log'},'bigfoot',2000);
  registry.update(1,3000,player);assert.equal(registry.puddles.length,0);
});
test('manual ascent keeps offshore swimmers on the surface until they return toward shore',()=>{
  const diving=new DivingSession(),player={x:coastline(14500)+1800,y:14500,layer:'surface'},inventory={};
  diving.update(5,player,inventory);assert.ok(diving.wetTime>4);
  diving.surfaced();diving.update(30,player,inventory);assert.equal(diving.wetTime,0);assert.equal(diving.surfaceLock,true);assert.equal(diving.breath,35);
  player.x=coastline(player.y)+300;diving.update(1,player,inventory);assert.equal(diving.surfaceLock,false);
  player.x+=1500;diving.update(5,player,inventory);assert.ok(diving.wetTime>4);
});
test('glider takes off while moving, lands when blocked or stopped, and cannot fly underwater',()=>{
  const player={vehicle:{glider:true},moving:true};updateGliding(player,.5);assert.equal(player.gliding,true);assert.ok(player.flightHeight>45);
  player.moving=false;updateGliding(player,1);assert.equal(player.gliding,false);assert.equal(player.flightHeight,0);
  player.moving=true;player.swimming=true;updateGliding(player,1);assert.equal(player.gliding,false);
  player.swimming=false;player.underwater=true;updateGliding(player,1);assert.equal(player.gliding,false);
  player.underwater=false;player.vehicle=null;updateGliding(player,1);assert.equal(player.gliding,false);
});
