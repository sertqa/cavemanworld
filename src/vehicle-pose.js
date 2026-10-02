// Rotate a vehicle's ground plane while keeping its raised parts upright.
// Forward follows the player's heading; height always points up the screen.
export function vehiclePoint(facing,forward,right=0,height=0){
  const c=Math.cos(facing),s=Math.sin(facing);
  return [c*forward-s*right,s*forward+c*right-height];
}
