export const BROTHEL_NAMES={hearth:'The Velvet Hearth',fern:'Fern & Lace',lotus:'The Lotus Lantern',aurora:'The Aurora Rose'};
const palettes=[
  {skin:'#e8bd91',hair:'#613c32',shirt:'#aa4f70',longHair:true},
  {skin:'#9e684e',hair:'#302d37',shirt:'#9870b2',curly:true},
  {skin:'#c78b64',hair:'#b98a47',shirt:'#538f92',longHair:true},
];
const names={hearth:['Mira','Sable','Elara'],fern:['Sylvie','Nessa','Vale'],lotus:['Liora','Amara','Dahlia'],aurora:['Freya','Celeste','Anya']};
export function brothelResidents(building){
  return names[building.town].map((name,i)=>({
    id:`${building.id}-resident-${i}`,name,age:27+i*3,role:'brothel',venueId:building.id,layer:building.layer,fixed:true,
    x:[550,245,850][i],y:[345,365,365][i],facing:Math.PI/2,moving:false,
    appearance:{...palettes[i],id:`${building.id}-${i}`,skinLight:i===1?'#bd8966':'#f3caa0',skinShade:i===1?'#78513f':'#bd8866',dress:true,lipstick:true},
    title:i===0?'Hostess':'Companion',
    greeting:[`Welcome, wanderer. Leave the wilds at the door. We keep our company warm and our secrets warmer.`,`That is quite the entrance. Come closer; I would rather hear your stories than guess them.`,`A brave explorer with a shy smile? Stay a while. The evening has only just begun.`][i],
    compliment:[`They warned me you were trouble. I say that is part of your charm.`,`Careful with that smile. You might make me forget the rest of the room.`,`You wear adventure well. Though I could get used to seeing you without all that dust.`][i],
  }));
}
export function loungeVisit(inventory,vitals,action,guest){
  if(!guest||guest.role!=='brothel')return {ok:false,message:'Choose someone to talk to.'};
  if(action==='flirt')return {ok:true,message:`${guest.name} smiles. “${guest.compliment}”`};
  if(!['drink','rest'].includes(action))return {ok:false,message:'Choose a lounge activity.'};
  const cost=action==='drink'?10:25;
  if(action==='rest'&&vitals.health>=vitals.maxHealth)return {ok:false,message:'You are already well rested.'};
  if(inventory.coins<cost)return {ok:false,message:'Not enough coins.'};
  inventory.coins-=cost;
  if(action==='drink')return {ok:true,message:`${guest.name} raises her glass and brushes your hand. “Here is to seeing you again.”`};
  const healed=vitals.heal(40);
  return {ok:true,message:`You settle into the velvet lounge while ${guest.name} keeps you company. Recovered ${healed} health.`};
}
