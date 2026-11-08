import data from '../data/model-meshes.json';
import {loadImage} from './render.js';
import {blackGoldStone,greenStone,siltStone,whiteMarble,woodGrain} from './proceduralMaterials.js';
const squareTop=src=>{const c=document.createElement('canvas');c.width=c.height=src.width;c.getContext('2d').drawImage(src,0,0);return c};
const sources=new Map(),cache=new Map();let ready;
export function ensureMaterialMaps(){return ready??=Promise.all(data.textures.map(async t=>{try{const image=await loadImage(t.src),c=document.createElement('canvas');c.width=512;c.height=t.id.includes('metal')?512:1024;const ctx=c.getContext('2d');ctx.drawImage(image,...t.crop,0,0,c.width,c.height);sources.set(t.id,c)}catch{/* The established procedural reference remains available offline. */}}));}
export function photoMaterialTexture(material,color,options={}){
 // Drawn to match the owner's renders (proceduralMaterials.js, 2026-11-07): green stone for D and F (F's disc
 // takes a square crop); white marble for A–E; black with smoky gold (v2, after D's black photo) for A, B and C,
 // C starting lower on the stone where the gold runs; A's woods
 // (北美黃檜 light, 木橫擔 walnut) and its grey 水庫淤泥 base after 公版A-1…A-6. D and E black keep their photos.
 const m=options.modelId||'',wood=material==='wood'&&m==='A'?(options.finish?.includes('木橫擔')?'walnut':'light'):null;
 const drawn=wood?()=>woodGrain(wood):material!=='stone'||!m?null:color==='#24453e'&&'DF'.includes(m)?(m==='F'?()=>squareTop(greenStone()):greenStone):color==='#e5e3db'&&'ABCDE'.includes(m)?whiteMarble:color==='#252a27'&&'ABC'.includes(m)?(m==='C'?()=>blackGoldStone(860):blackGoldStone):color==='#999896'&&m==='A'?siltStone:null;
 if(drawn){const key=['drawn',material,color,wood,'CF'.includes(m)?m:''].join('|');if(!cache.has(key))cache.set(key,drawn());return cache.get(key)}
 let id;
 if(material==='wood')id=options.endgrain?'wood-crossbar-endgrain':options.finish?.includes('木橫擔')?'wood-crossbar-vertical':'wood-heat-vertical';
 if(material==='stone')id=color==='#e5e3db'?'stone-white':color==='#24453e'?'stone-green-gold':color==='#252a27'?(options.modelId==='B'?'stone-black-gold':'stone-black-gold-D'):null;
 // E's plates were photo crops (150 px wide) and looked like sandpaper when enlarged; since the CAD rebuild
 // (2026-11-06) every plate uses drawn metal in the plate's own colour (canonicalRender materialTexture).
 const source=sources.get(id);if(!source)return null;
 const key=[id,color,options.modelId,options.endgrain].join('|');if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');
 if(material==='wood'&&options.modelId==='C'){ctx.translate(c.width/2,c.height/2);ctx.rotate(Math.PI/2);ctx.drawImage(source,-c.height/2,-c.width/2,c.height,c.width);ctx.setTransform(1,0,0,1,0,0)}else ctx.drawImage(source,0,0);
 if(material==='wood'&&options.modelId==='A'&&!options.finish?.includes('木橫擔')){ctx.globalCompositeOperation='color';ctx.fillStyle='#dcb76e';ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='screen';ctx.fillStyle='#f9d57e38';ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='source-over'}
 if(material==='metal'&&color==='#b78c77'){ctx.globalCompositeOperation='color';ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='source-over'}
 cache.set(key,c);return c;
}
