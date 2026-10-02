export const VAPE_ID='prism-vape';
export const VAPE_FLAVORS=[
 {id:'berry',name:'Berry Crush',color:'#c69bff',note:'Blackberry · violet clouds'},
 {id:'mint',name:'Glacier Mint',color:'#83efd4',note:'Cool mint · turquoise clouds'},
 {id:'peach',name:'Peach Sunset',color:'#ffb47f',note:'Juicy peach · orange clouds'},
 {id:'cherry',name:'Cherry Heart',color:'#ff8fba',note:'Sweet cherry · pink clouds'},
 {id:'citrus',name:'Solar Citrus',color:'#ffe681',note:'Lemon & lime · golden clouds'},
];
export const VAPE_PRICE=80,REFILL_PRICE=12,REFILL_PUFFS=20;
export const VAPE_RECIPE={id:VAPE_ID,name:'Prism Vape',category:'tool',type:'vape',tier:'quartz',level:1,damage:0,power:0,yield:0,shopOnly:true,cost:{},detail:'Buy at a village smoke shop. Equip, then F or click to inhale and exhale colored clouds. Change flavors in your inventory.'};
export const vapeFlavor=id=>VAPE_FLAVORS.find(f=>f.id===id)||VAPE_FLAVORS[0];
