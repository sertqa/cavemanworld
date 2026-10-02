// Flight follows actual movement, so stopping against a wall also lands the pilot.
export function updateGliding(player,dt){
  player.gliding=!!(player.vehicle?.glider&&player.moving&&!player.swimming&&!player.underwater);
  const target=player.gliding?46:0;
  player.flightHeight=(player.flightHeight||0)+(target-(player.flightHeight||0))*(1-Math.exp(-dt*12));
  if(player.flightHeight<.2)player.flightHeight=0;
}
