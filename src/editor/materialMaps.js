import data from '../data/model-meshes.json';
import {loadImage} from './render.js';
const sources=new Map(),cache=new Map();let ready;
export function ensureMaterialMaps(){return ready??=Promise.all(data.textures.map(async t=>{try{const image=await loadImage(t.src),c=document.createElement('canvas');c.width=512;c.height=t.id.includes('metal')?512:1024;const ctx=c.getContext('2d');ctx.drawImage(image,...t.crop,0,0,c.width,c.height);sources.set(t.id,c)}catch{/* The established procedural reference remains available offline. */}}));}
export function photoMaterialTexture(material,color,options={}){
 let id;
 if(material==='wood')id=options.endgrain?'wood-crossbar-endgrain':options.finish?.includes('木橫擔')?'wood-crossbar-vertical':'wood-heat-vertical';
 if(material==='stone')id=color==='#e5e3db'?'stone-white':color==='#24453e'?'stone-green-gold':color==='#252a27'?(options.modelId==='B'?'stone-black-gold':'stone-black-gold-D'):null;
 if(material==='metal'&&options.modelId==='E')id=color==='#cbd0d0'?'metal-satin-silver':'metal-satin-gold';
 const source=sources.get(id);if(!source)return null;
 const key=[id,color,options.modelId,options.endgrain].join('|');if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');
 if(material==='wood'&&options.modelId==='C'){ctx.translate(c.width/2,c.height/2);ctx.rotate(Math.PI/2);ctx.drawImage(source,-c.height/2,-c.width/2,c.height,c.width);ctx.setTransform(1,0,0,1,0,0)}else ctx.drawImage(source,0,0);
 if(material==='wood'&&options.modelId==='A'&&!options.finish?.includes('木橫擔')){ctx.globalCompositeOperation='color';ctx.fillStyle='#dcb76e';ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='screen';ctx.fillStyle='#f9d57e38';ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='source-over'}
 if(material==='metal'&&color==='#b78c77'){ctx.globalCompositeOperation='color';ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='source-over'}
 cache.set(key,c);return c;
}
