import {VIP_ISLAND as I,VIP_PAVILION as P,VIP_DOCK as D,ISLAND_PALMS} from './vip-island.js';
const block=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
export function drawIslandGround(c,b){
 if(b.right<I.x-1400||b.left>I.x+1200||b.bottom<I.y-1400||b.top>I.y+1400)return;
 c.save();
 // The planked bridge extends inland at both ends, with continuous edge posts.
 block(c,D.x-D.width/2,D.y-D.height/2,D.width,D.height,'#a77d50');
 for(let x=D.x-D.width/2;x<D.x+D.width/2;x+=25){block(c,x,D.y-D.height/2,3,D.height,'#634e3c');block(c,x+5,D.y-D.height/2+4,15,2,'#d5b97b');}
 for(let x=D.x-D.width/2+15;x<D.x+D.width/2;x+=160)for(const y of [D.y-45,D.y+45]){block(c,x,y,14,28,'#66523f');block(c,x-2,y-5,18,9,'#e4c891');}
 block(c,P.x-280,P.y-160,560,430,'#e4dfc6');
 for(let y=P.y-145;y<P.y+270;y+=30)block(c,P.x-270,y,540,2,'#c2c0a8');
 block(c,I.x-70,I.y+85,120,570,'#dfcf9d');
 for(const [dx,dy] of [[-420,390],[410,240],[-170,650]]){block(c,I.x+dx,I.y+dy,125,25,'#f0eddd');block(c,I.x+dx+12,I.y+dy+25,17,22,'#466585');block(c,I.x+dx+98,I.y+dy+25,17,22,'#466585');}
 // Small lawn clusters and stones provide detail without new terrain assets.
 for(let j=0;j<40;j++){const a=j*2.4,r=450+(j%4)*55,x=I.x+Math.cos(a)*r,y=I.y+Math.sin(a)*r;block(c,x,y,9,5,j%3?'#87996a':'#ddd1a9');}
 c.restore();
}
function pavilion(c){
 c.save();c.translate(P.x,P.y);
 ellipse(c,0,94,260,88,'#263b3940');
 for(let j=0;j<12;j++){const y=-255+j*29,color=j%2?'#e8e7d8':'#216eac';block(c,-220,y,330,29,color);c.fillStyle=j%2?'#c6c8bf':'#17537f';c.beginPath();c.moveTo(110,y);c.lineTo(220,y-42);c.lineTo(220,y-13);c.lineTo(110,y+29);c.closePath();c.fill();}
 c.fillStyle='#efedde';c.beginPath();c.moveTo(-230,-264);c.lineTo(110,-264);c.lineTo(230,-307);c.lineTo(-105,-307);c.closePath();c.fill();block(c,-230,-264,340,13,'#faf6dd');
 for(let x=-110;x<20;x+=30){block(c,x,-321,15,16,'#858c87');block(c,x,-324,15,5,'#ede7d4');}
 // The tall gold arch and dark doorway are the reference building's focal point.
 c.fillStyle='#c9a264';c.beginPath();c.moveTo(-124,89);c.lineTo(-124,-106);c.quadraticCurveTo(-124,-153,-65,-195);c.quadraticCurveTo(-7,-153,-7,-106);c.lineTo(-7,89);c.closePath();c.fill();
 block(c,-115,-76,100,165,'#edf0e2');block(c,-107,-66,84,155,'#213537');block(c,-102,-59,36,140,'#101f28');block(c,-62,-59,34,140,'#233b43');block(c,-69,-64,5,152,'#d5dacf');block(c,-57,4,4,16,'#dac18a');
 block(c,14,-150,82,225,'#eeeddf');block(c,23,-141,64,205,'#657a85');for(let y=-85;y<64;y+=53)block(c,23,y,64,6,'#dddcd1');block(c,52,-140,6,205,'#dddcd1');
 for(const x of [-163,112]){block(c,x,-25,9,35,'#262b32');block(c,x-4,-22,17,20,'#e7d7a7');}
 block(c,-225,94,450,12,'#b9bcae');block(c,-145,106,155,10,'#ece9cf');
 c.restore();
}
function palm(c,x,y,time,index){
 const sway=Math.sin(time*.001+index)*12;c.save();c.translate(x,y);ellipse(c,20,5,64,20,'#263b392a');
 for(let j=0;j<14;j++)block(c,-10+j*.8,-j*15,18,17,j%2?'#92764e':'#b69662');
 for(let j=0;j<8;j++){const a=j*Math.PI/4;c.strokeStyle=j%2?'#426c43':'#638951';c.lineWidth=12;c.beginPath();c.moveTo(2+sway,-206);c.quadraticCurveTo(Math.cos(a)*85+sway,-220+Math.sin(a)*40,Math.cos(a)*123+sway,-175+Math.sin(a)*68);c.stroke();c.strokeStyle='#8da267';c.lineWidth=3;c.stroke();}ellipse(c,sway,-198,12,10,'#79613d');c.restore();
}
export function islandObjects(c,b,time){
 if(b.right<I.x-1400||b.left>I.x+1200||b.bottom<I.y-1500||b.top>I.y+1500)return [];
 const objects=[{x:P.x,y:P.y+120,draw:()=>pavilion(c)},{x:I.x,y:I.y+690,draw:()=>{block(c,I.x-153,I.y+610,306,70,'#344e52');block(c,I.x-155,I.y+610,310,4,'#ecd394');c.textAlign='center';c.fillStyle='#f5e5be';c.font='bold 20px monospace';c.fillText('PALM VIP ISLAND',I.x,I.y+638);c.font='13px monospace';c.fillText('FICTIONAL COMEDY RETREAT',I.x,I.y+660);}}];
 for(const [j,[dx,dy]] of ISLAND_PALMS.entries())objects.push({x:I.x+dx,y:I.y+dy,draw:()=>palm(c,I.x+dx,I.y+dy,time,j)});
 return objects;
}
export function drawVip(c,art,n,time){
 if(n.prop==='chair'){
  art.player(c,{...n,y:n.y+12},{equippedGear:null,equippedTool:null},time);
  ellipse(c,n.x-24,n.y+7,16,18,'#283846');ellipse(c,n.x+24,n.y+7,16,18,'#283846');ellipse(c,n.x-24,n.y+7,10,12,'#abb9bc');ellipse(c,n.x+24,n.y+7,10,12,'#abb9bc');block(c,n.x-25,n.y-22,50,31,'#405776');block(c,n.x-30,n.y-28,11,8,'#c3c8c0');block(c,n.x+20,n.y-28,11,8,'#c3c8c0');block(c,n.x+10,n.y-47,27,18,'#293f52');block(c,n.x+14,n.y-43,18,5,'#9dc8c9');return;
 }
 art.player(c,n,{equippedGear:null,equippedTool:null},time);
 if(n.prop==='sax'){c.strokeStyle='#dab653';c.lineWidth=8;c.beginPath();c.moveTo(n.x+14,n.y-42);c.lineTo(n.x+26,n.y-24);c.quadraticCurveTo(n.x+30,n.y-5,n.x+9,n.y-11);c.stroke();ellipse(c,n.x+8,n.y-12,10,6,'#edcc69');}
 if(n.prop==='tea'){block(c,n.x+17,n.y-40,13,15,'#efe6cd');block(c,n.x+30,n.y-37,5,8,'#c5c6b9');}
 if(n.prop==='rocket'){block(c,n.x+15,n.y-43,20,26,'#e9e0c9');block(c,n.x+23,n.y-39,4,14,'#d78160');}
 if(n.prop==='chef'){block(c,n.x-12,n.y-119,25,18,'#f3eed8');ellipse(c,n.x-9,n.y-122,10,8,'#f3eed8');ellipse(c,n.x+8,n.y-122,11,8,'#f3eed8');}
 if(n.prop==='star'){ellipse(c,n.x+23,n.y-34,6,8,'#323746');block(c,n.x+21,n.y-26,4,17,'#b8c4c3');}
}
