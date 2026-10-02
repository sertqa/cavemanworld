import {VAPE_RECIPE,VAPE_ID,VAPE_FLAVORS,VAPE_PRICE,REFILL_PRICE,vapeFlavor} from './vape-data.js';
import {buyVape,buyRefill,loadFlavor} from './vaping.js';
import {loungeVisit} from './brothels.js';
import {evolveBow,nextBowForm,bowForm,equipmentRecipe} from './bow-upgrades.js';
import {RESOURCES,RECIPES} from './crafting.js';
import {resourceName} from './item-index.js';
import {itemImage} from './item-art.js';
import {tradeResource,resourcePrice,clubQuality,upgradeCost,upgradeTool,HouseLoot} from './town-services.js';
const $=id=>document.getElementById(id);
export class TownUI{
 constructor({inventory,vitals,npcs,openModal,onChange,onEquip}){Object.assign(this,{vitals,npcs});this.inventory=inventory;this.openModal=openModal;this.onChange=onChange;this.onEquip=onEquip;this.houses=new HouseLoot();
  $('vapeStarter').innerHTML=VAPE_FLAVORS.map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
  $('buyVape').addEventListener('click',()=>this.act(()=>buyVape(inventory,$('vapeStarter').value)));
  $('equipVape').addEventListener('click',()=>{if(inventory.owned.has(VAPE_ID))this.onEquip(VAPE_ID);});
  $('brothelGuest').addEventListener('change',()=>{this.guest=this.npcs.items.find(n=>n.id===$('brothelGuest').value&&n.venueId===this.building?.id);this.render();$('townFeedback').textContent='';});
  for(const action of ['flirt','drink','rest'])$(`brothel${action[0].toUpperCase()+action.slice(1)}`).addEventListener('click',()=>this.act(()=>loungeVisit(this.inventory,this.vitals,action,this.guest)));
  $('shopResource').innerHTML=RESOURCES.map(id=>`<option value="${id}">${resourceName(id)}</option>`).join('');
  $('shopResource').addEventListener('change',()=>this.render());
  for(const buy of [true,false])for(const amount of [1,5])$(`${buy?'buy':'sell'}${amount}`).addEventListener('click',()=>this.act(()=>tradeResource(inventory,$('shopResource').value,amount,buy)));
  $('collectHouseLoot').addEventListener('click',()=>this.act(()=>this.houses.collect(this.building.id,performance.now(),inventory)));
 }
 open(building,guest=null){this.building=building;
  if(building.type==='brothel'){const residents=this.npcs.items.filter(n=>n.venueId===building.id);this.guest=residents.find(n=>n.id===guest?.id)||residents[0];$('brothelGuest').replaceChildren();for(const n of residents){const option=document.createElement('option');option.value=n.id;option.textContent=n.name+' · '+n.title;$('brothelGuest').append(option);}$('brothelGuest').value=this.guest.id;}this.openModal();$('townTitle').textContent=building.name;$('townFeedback').textContent='';for(const type of ['shop','smith','house','brothel','smoke'])$(`${type}View`).classList.toggle('hidden',type!==building.type);this.render();}
 act(action){const result=action();this.onChange({kind:`town-${this.building.type}`,targetId:this.building.id,ok:result.ok});this.render();$('townFeedback').textContent=result.message;}
 render(){if(!this.building)return;const inv=this.inventory;$('townCoins').textContent=`${inv.coins} coins`;
  if(this.building.type==='shop'){const id=$('shopResource').value,price=resourcePrice(id);$('shopStock').textContent=`You carry ${inv.resources[id]} · Buy ${price*2} coins each · Sell ${price} coins each`;
   for(const n of [1,5]){$(`buy${n}`).disabled=inv.coins<price*2*n;$(`sell${n}`).disabled=inv.resources[id]<n;}
  }else if(this.building.type==='smoke'){
   const owned=inv.owned.has(VAPE_ID);$('vapeShowcaseArt').replaceChildren(itemImage(VAPE_RECIPE));$('buyVape').classList.toggle('hidden',owned);$('buyVape').disabled=inv.coins<VAPE_PRICE;$('vapeStarter').disabled=owned;if(owned)$('vapeStarter').value=inv.vape.flavor;$('equipVape').classList.toggle('hidden',!owned);$('vapeFlavors').replaceChildren();
   for(const f of VAPE_FLAVORS){const card=document.createElement('div');card.className='vape-flavor';card.style.setProperty('--flavor',f.color);const title=document.createElement('strong'),note=document.createElement('p'),count=document.createElement('small'),buy=document.createElement('button'),load=document.createElement('button');title.textContent=f.name;note.textContent=f.note;count.textContent=`${inv.vape.charges[f.id]} puffs${inv.vape.flavor===f.id?' · loaded':''}`;buy.className=load.className='bag-action';buy.textContent=`20 puffs · ${REFILL_PRICE} coins`;buy.disabled=!owned||inv.coins<REFILL_PRICE;buy.addEventListener('click',()=>this.act(()=>buyRefill(inv,f.id)));load.textContent=inv.vape.flavor===f.id?'Loaded':'Load flavor';load.disabled=!owned||!inv.vape.charges[f.id]||inv.vape.flavor===f.id;load.addEventListener('click',()=>this.act(()=>loadFlavor(inv,f.id)));card.append(title,note,count,buy,load);$('vapeFlavors').append(card);}
  }else if(this.building.type==='smith'){
   const quality=clubQuality(inv.equippedTool);$('forgeQuality').textContent=quality.rank===0&&inv.equippedTool?.type!=='club'?'Bows evolve with materials. For other tools, equip a club; rare clubs improve forge quality.':`${quality.name} club · Rough ${Math.round(quality.chances[0]*100)}% · Fine ${Math.round(quality.chances[1]*100)}% · Masterwork ${Math.round(quality.chances[2]*100)}%`;
   $('forgeTools').replaceChildren();
   const ammo=document.createElement('button');ammo.className='bag-action';ammo.textContent=`Buy 5 arrows · 10 coins (${inv.resources.arrows} carried)`;ammo.disabled=inv.coins<10;
   ammo.addEventListener('click',()=>this.act(()=>{if(inv.coins<10)return {ok:false,message:'Not enough coins.'};inv.coins-=10;inv.add('arrows',5);return {ok:true,message:'Bought five arrows.'};}));$('forgeTools').append(ammo);for(const [id,item] of inv.owned){const recipe=RECIPES.find(r=>r.id===id);if(recipe?.category!=='tool'||recipe.shopOnly)continue;
    if(item.type==='bow'){
     const next=nextBowForm(item),card=document.createElement('div');card.className='forge-card';card.append(itemImage(equipmentRecipe(recipe,item)));const d=document.createElement('div');const title=document.createElement('strong');title.textContent=bowForm(item).name;const line=document.createElement('p');line.textContent=next?`${item.damage} → ${next.damage} damage · next: ${next.name} · Lv ${next.level}`:'Final form';const price=document.createElement('small');price.textContent=next?Object.entries(next.cost).map(([r,n])=>`${n} ${resourceName(r)}`).join(' · '):'Fully evolved';d.append(title,line,price);card.append(d);const b=document.createElement('button');b.className='bag-action';b.textContent=next?'Evolve bow':'Maxed';b.disabled=!next||inv.progression.level<next.level||Object.entries(next.cost).some(([r,n])=>inv.resources[r]<n);b.addEventListener('click',()=>this.act(()=>evolveBow(inv,id)));card.append(b);$('forgeTools').append(card);continue;
    }
    const cost=upgradeCost(item),card=document.createElement('div');card.className='forge-card';card.append(itemImage(recipe));const detail=document.createElement('div');const title=document.createElement('strong');title.textContent=recipe.name;const line=document.createElement('p');line.textContent=`${item.damage} damage · ${item.upgradeLevel||0}/3 upgrades${item.upgradeQuality?' · '+item.upgradeQuality:''}`;const price=document.createElement('small');price.textContent=`${cost.coins} coins + ${cost.amount} ${resourceName(cost.resource)}`;detail.append(title,line,price);card.append(detail);const button=document.createElement('button');button.className='bag-action';button.textContent=(item.upgradeLevel||0)>=3?'Maxed':'Upgrade';button.disabled=(item.upgradeLevel||0)>=3||inv.equippedTool?.type!=='club'||inv.coins<cost.coins||inv.resources[cost.resource]<cost.amount;button.addEventListener('click',()=>this.act(()=>upgradeTool(inv,id)));card.append(button);$('forgeTools').append(card);
   }if(!$('forgeTools').children.length)$('forgeTools').textContent='Craft a tool, then bring it here.';
  }else if(this.building.type==='brothel'){
   $('brothelName').textContent=this.guest.name+' · '+this.guest.title;
   $('brothelGreeting').textContent='“'+this.guest.greeting+'”';
   $('brothelDrink').disabled=inv.coins<10;$('brothelRest').disabled=inv.coins<25||this.vitals.health>=this.vitals.maxHealth;
   $('brothelHealth').textContent=`Health ${Math.ceil(this.vitals.health)} / ${this.vitals.maxHealth} · resting restores up to 40 health`;
  }else {const state=this.houses.peek(this.building.id,performance.now());$('houseLoot').textContent=state.collected?'The chest is empty.':Object.entries(state.loot).map(([id,n])=>`${n} ${resourceName(id)}`).join(' · ');$('houseTimer').textContent=state.collected?`Refills in ${Math.max(0,Math.ceil((state.readyAt-performance.now())/1000))} seconds`:'Mostly everyday supplies, occasionally a lucky find.';$('collectHouseLoot').disabled=state.collected;}
 }
}
