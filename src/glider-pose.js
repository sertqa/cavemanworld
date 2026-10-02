import {CAMERA_TILT} from './camera.js';

export const GLIDER_PILOT_SCALE=1.65;
export const GLIDER_SIDE_HANDS=[{x:95,y:47},{x:101,y:50}];
export function gliderSideRig(facing){
  const sign=Math.cos(facing)<0?-1:1;
  const mirror=points=>points.map(([x,y])=>[x*sign,y]);
  // A side elevation of the sail, rather than rotating its top view vertically.
  const sail=mirror([[-126,-139],[-100,-157],[55,-176],[117,-151],[100,-116],[-75,-129]]);
  const grips=GLIDER_SIDE_HANDS.map(p=>[(p.x-48)*GLIDER_PILOT_SCALE*sign,(p.y-61)*GLIDER_PILOT_SCALE/CAMERA_TILT-12]);
  return {sail,grips,nose:[117*sign,-151],apex:[8*sign,-143],rear:[-13*sign,-58]};
}
