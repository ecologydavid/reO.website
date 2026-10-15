import {loadImage} from './render.js';
import {objectBounds,textLayout} from './geometry.mjs';
import {objectFits} from './constraints.mjs';
export function makeCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
export function polygonPath(ctx,polygon,w=1,h=1){ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath()}
const textureCache=new Map();
export function materialTexture(material,color){
  const key=material+color;if(textureCache.has(key))return textureCache.get(key);
  const c=makeCanvas(512,512),ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,512,512);
  let seed=314159;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  if(material==='wood'){
    for(let i=0;i<550;i++){const x=random()*512;ctx.strokeStyle=i%4?'#32180924':'#f0d3a842';ctx.lineWidth=.3+random()*1.2;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<=512;y+=16)ctx.lineTo(x+Math.sin(y/150+i*.4)*(1+random()*5),y);ctx.stroke();}
  }else if(material==='stone'){
    const dark=['#252a27','#24453e'].includes(color);
    for(let i=0;i<35;i++){const x=random()*512,y=random()*512;ctx.strokeStyle=dark?'#ddd1a328':'#4b545c20';ctx.lineWidth=.3+random()*2;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-80,y+100,x+140,y+100,x-20,y+280);ctx.stroke();}
    for(let i=0;i<14000;i++){ctx.fillStyle=i%2?'#ffffff07':'#00000008';ctx.fillRect(random()*512,random()*512,1,1);}
  }else if(material==='metal'){
    const g=ctx.createLinearGradient(0,0,512,180);g.addColorStop(0,'#ffffff28');g.addColorStop(.4,'#ffffff05');g.addColorStop(1,'#00000010');ctx.fillStyle=g;ctx.fillRect(0,0,512,512);
    for(let y=0;y<512;y+=2){ctx.strokeStyle=y%4?'#ffffff09':'#00000006';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}
  }else{const g=ctx.createLinearGradient(0,0,512,512);g.addColorStop(0,'#ffffff10');g.addColorStop(.5,'#ffffff00');g.addColorStop(1,'#0000000c');ctx.fillStyle=g;ctx.fillRect(0,0,512,512);}
  textureCache.set(key,c);return c;
}
function drawSpaced(ctx,text,x,y,o,measure){
  if(!o.letterSpacing){ctx.fillText(text,x,y);return;}
  let at=x;for(const char of Array.from(text)){ctx.fillText(char,at,y);at+=ctx.measureText(char).width+o.letterSpacing;}
}
export function drawObject(ctx,o,images){
  if(o.hidden)return;
  ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rotation*Math.PI/180);
  if(o.type==='image'){
    const image=images.get(o.src);if(image)ctx.drawImage(image,-o.width/2,-o.height/2,o.width,o.height);
  }else{
    const b=textLayout(o,ctx);ctx.fillStyle=o.color;ctx.textAlign='left';ctx.textBaseline='middle';
    if(o.writingMode==='vertical'){
      b.lines.forEach((line,col)=>{const x=(b.lines.length-1-col-(b.lines.length-1)/2)*b.step,length=Array.from(line).length;Array.from(line).forEach((char,row)=>{ctx.textAlign='center';ctx.fillText(char,x,(row-(length-1)/2)*(o.fontSize+(o.letterSpacing||0)))});if(o.underline){const half=length*(o.fontSize+(o.letterSpacing||0))/2;ctx.strokeStyle=o.color;ctx.lineWidth=Math.max(1,o.fontSize*.045);ctx.beginPath();ctx.moveTo(x+o.fontSize*.5,-half);ctx.lineTo(x+o.fontSize*.5,half);ctx.stroke();}});
    }else b.lines.forEach((line,i)=>{
      const w=b.measure(line),x=o.align==='left'?-b.width/2:o.align==='right'?b.width/2-w:-w/2,y=(i-(b.lines.length-1)/2)*b.step;
      drawSpaced(ctx,line,x,y,o,b.measure);
      if(o.underline){ctx.strokeStyle=o.color;ctx.lineWidth=Math.max(1,o.fontSize*.045);ctx.beginPath();ctx.moveTo(x,y+o.fontSize*.48);ctx.lineTo(x+w,y+o.fontSize*.48);ctx.stroke();}
    });
  }ctx.restore();
}
export async function renderCanonicalSurface(surface,objects,{selection=null,withBackground=true}={}){
  const c=makeCanvas(surface.width,surface.height),ctx=c.getContext('2d');
  const images=new Map(await Promise.all(objects.filter(o=>o.type==='image').map(async o=>[o.src,await loadImage(o.src)])));
  const overflow=objects.some(o=>!objectFits(o,surface,ctx));
  ctx.save();polygonPath(ctx,surface.polygon,c.width,c.height);ctx.clip();
  if(withBackground)ctx.drawImage(materialTexture(surface.material,surface.fill),0,0,c.width,c.height);
  objects.forEach(o=>drawObject(ctx,o,images));
  if(selection){
    const o=objects.find(o=>o.id===selection);
    if(o){const b=objectBounds(o,ctx);ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rotation*Math.PI/180);ctx.strokeStyle='#53614d';ctx.lineWidth=2;ctx.setLineDash([9,6]);ctx.strokeRect(-b.width/2-5,-b.height/2-5,b.width+10,b.height+10);ctx.setLineDash([]);for(const x of [-b.width/2-5,b.width/2+5])for(const y of [-b.height/2-5,b.height/2+5]){ctx.fillStyle='#fff';ctx.fillRect(x-4,y-4,8,8);ctx.strokeRect(x-4,y-4,8,8)}ctx.restore();}
  }ctx.restore();return {canvas:c,overflow};
}
export async function fDecoration(scene){
  const c=makeCanvas(1000,1000);if(scene.shape!=='ridge')return c;
  const source=await loadImage('/assets/reference-F.jpg'),part=makeCanvas(184,151),p=part.getContext('2d');
  p.drawImage(source,140,867,184,151,0,0,184,151);const pixels=p.getImageData(0,0,184,151);
  for(let i=0;i<pixels.data.length;i+=4){const dark=Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2])<135;pixels.data[i+3]=dark?255:0;}
  p.putImageData(pixels,0,0);c.getContext('2d').drawImage(part,(140-57)/350*1000,(867-674)/350*1000,184/350*1000,151/350*1000);return c;
}
export function frontPlacement(scene,width,height,padding=60){const scale=Math.min((width-padding*2)/scene.width,(height-padding*2)/scene.height);return {scale,x:(width-scene.width*scale)/2,y:(height-scene.height*scale)/2}}
export async function renderCanonicalProduct(scene,documents,{width=800,height=1100,activeSurface=null,selection=null}={}){
  const c=makeCanvas(width,height),ctx=c.getContext('2d'),placement=frontPlacement(scene,c.width,c.height);
  ctx.fillStyle='#eaece5';ctx.fillRect(0,0,c.width,c.height);ctx.save();ctx.translate(placement.x,placement.y);ctx.scale(placement.scale,placement.scale);
  const shadow=ctx.createRadialGradient(scene.width*.5,scene.height+12,0,scene.width*.5,scene.height+12,scene.width*.6);shadow.addColorStop(0,'#252d281c');shadow.addColorStop(1,'#252d2800');ctx.save();ctx.translate(0,scene.height*.86);ctx.scale(1,.15);ctx.fillStyle=shadow;ctx.fillRect(-scene.width,0,scene.width*3,scene.height);ctx.restore();
  if(scene.id==='F'){
    ctx.save();ctx.beginPath();ctx.arc(500,500,500,0,Math.PI*2);ctx.clip();ctx.drawImage(materialTexture('stone',scene.fills.stone),0,0,1000,1000);ctx.restore();
    ctx.strokeStyle=scene.fills.metal;ctx.lineWidth=65;ctx.beginPath();ctx.arc(500,500,451,0,Math.PI*2);ctx.stroke();
    const count=scene.shape==='diamond'?20:scene.shape==='ridge'?72:32;
    for(let i=0;i<count;i++){const a=i/count*Math.PI*2;ctx.strokeStyle=i%2?'#ffffff30':'#252d2820';ctx.lineWidth=scene.shape==='diamond'?5:1.7;ctx.beginPath();ctx.moveTo(500+418*Math.cos(a),500+418*Math.sin(a));ctx.lineTo(500+483*Math.cos(a+.04),500+483*Math.sin(a+.04));ctx.stroke();}
    ctx.fillStyle='#c2a05d';ctx.fillRect(420,-110,160,142);ctx.fillStyle='#eaece5';ctx.fillRect(390,50,220,18);
  }else{
    for(const body of scene.bodies){ctx.save();polygonPath(ctx,body.polygon);ctx.clip();ctx.drawImage(materialTexture(body.material,scene.fills[body.material]),0,0,scene.width,scene.height);ctx.restore();ctx.strokeStyle='#252d2824';ctx.lineWidth=2;polygonPath(ctx,body.polygon);ctx.stroke();}
  }
  const rendered=await Promise.all(scene.surfaces.map(async s=>[s.id,await renderCanonicalSurface(s,documents[s.id]||[],{withBackground:['metal','acrylic'].includes(s.material)})]));
  for(const s of scene.surfaces){ctx.drawImage(rendered.find(([id])=>id===s.id)[1].canvas,s.x,s.y,s.displayWidth,s.displayHeight);if(activeSurface===s.id){ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#53614d';ctx.lineWidth=3/placement.scale;ctx.setLineDash([8/placement.scale,5/placement.scale]);polygonPath(ctx,s.polygon,s.displayWidth,s.displayHeight);ctx.stroke();ctx.restore();}}
  if(scene.id==='F')ctx.drawImage(await fDecoration(scene),0,0,1000,1000);
  ctx.restore();return {canvas:c,overflow:rendered.some(([,r])=>r.overflow),placement};
}
