import test from 'node:test';
import assert from 'node:assert/strict';
import {vehiclePoint} from '../src/vehicle-pose.js';
import {drawTransport} from '../src/frontier-art.js';
import {TRANSPORT} from '../src/frontier-items.js';
import {Creature} from '../src/creatures.js';
import {OceanInkRegistry} from '../src/ocean-ink.js';
import {coastline} from '../src/frontier-world.js';

test('all vehicle art rotates with heading while vertical stems remain upright',()=>{
  for(const facing of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    const origin=vehiclePoint(facing,0),nose=vehiclePoint(facing,58);
    assert.ok(Math.abs((nose[0]-origin[0])*Math.cos(facing)+(nose[1]-origin[1])*Math.sin(facing)-58)<1e-9);
    const ground=vehiclePoint(facing,27),handle=vehiclePoint(facing,27,0,49);
    assert.equal(handle[0],ground[0]);assert.equal(handle[1],ground[1]-49);
  }
  function artwork(id,facing){
    const points=[],ctx={save(){},restore(){},translate(){},beginPath(){},closePath(){},fill(){},stroke(){},fillRect(){},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);}};
    drawTransport(ctx,{x:0,y:0,facing,vehicleId:id,swimming:id==='reed-raft',moving:true,gliding:id==='crystal-glider'},0);
    return points;
  }
  for(const id of Object.keys(TRANSPORT)){
    const east=artwork(id,0),west=artwork(id,Math.PI),north=artwork(id,Math.PI*1.5),south=artwork(id,Math.PI/2);
    assert.ok(east.length>0,id);assert.equal(east.length,west.length);
    for(let i=0;i<east.length;i++)assert.ok(Math.abs(east[i][0]+west[i][0])<1e-8,`${id} mirrors east/west`);
    assert.notDeepEqual(north,south,`${id} distinguishes forward/reverse`);
  }
});

test('squid telegraphs ink, commits to the original aim, and keeps its melee attack during cooldown',()=>{
  const squid=new Creature({id:'ink-test',kind:'giantSquid',x:coastline(14500)+1400,y:14500,layer:'ocean'});
  const player={x:squid.x+300,y:squid.y,layer:'ocean'};
  assert.equal(squid.update(.1,1000,player),null);assert.equal(squid.inkWindupUntil,1650);
  player.y+=200;assert.equal(squid.update(.1,1600,player),null);
  const attack=squid.update(.1,1650,player);
  assert.ok(attack.ink);assert.equal(attack.ink.targetY,14500);assert.equal(attack.ink.targetX,squid.x+300);
  assert.equal(squid.nextInkAt,9650);
  player.x=squid.x+50;player.y=squid.y;
  assert.equal(squid.update(.1,2000,player).damage,24);
  player.x=squid.x+300;assert.equal(squid.update(.1,9650,player),null);assert.equal(squid.inkWindupUntil,10300);
  player.layer='surface';assert.equal(squid.update(.1,10300,player),null);
});

test('ink clouds travel and expand, obscure only swimmers inside, then clear without stacking',()=>{
  const ink=new OceanInkRegistry(),player={x:0,y:0,layer:'ocean'};
  ink.spray({x:0,y:0,targetX:300,targetY:0},0);
  ink.update(.1,100,player);assert.ok(ink.clouds[0].x>0&&ink.clouds[0].x<300);assert.ok(ink.clouds[0].radius>40);assert.ok(player.inkExposure>0);
  player.x=300;ink.update(1,1100,player);assert.equal(ink.clouds[0].x,300);assert.equal(ink.clouds[0].radius,230);assert.equal(player.inkExposure,1);
  ink.spray({x:300,y:0,targetX:300,targetY:0},1100);ink.update(1,2100,player);assert.equal(player.inkExposure,1);
  player.x=1000;ink.update(1,3100,player);assert.ok(player.inkExposure>0&&player.inkExposure<.3);
  ink.update(3,6100,player);assert.equal(player.inkExposure,0);
  ink.update(1,7100,player);assert.equal(ink.clouds.length,0);
});

test('surfacing immediately removes ink and blindness',()=>{
  const ink=new OceanInkRegistry(),player={x:0,y:0,layer:'ocean'};
  ink.spray({x:0,y:0,targetX:0,targetY:0},0);ink.update(1,1100,player);assert.equal(player.inkExposure,1);
  player.layer='surface';ink.update(.01,1150,player);assert.equal(player.inkExposure,0);assert.equal(ink.clouds.length,0);
  ink.spray({x:0,y:0,targetX:0,targetY:0},2000);player.inkExposure=1;ink.clear(player);assert.equal(player.inkExposure,0);assert.equal(ink.clouds.length,0);
});
