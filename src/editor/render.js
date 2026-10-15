import {projection,project,invert,objectBounds} from './geometry.mjs';
const cache=new Map();
export function loadImage(src) {
  if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{cache.delete(src);reject(new Error('圖片載入失敗，請重新整理。'))};image.src=src;}));
  return cache.get(src);
}
function canvas(w,h) {const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function drawObject(ctx,o,images) {
  ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rotation*Math.PI/180);
  if(o.type==='image'){
    const image=images.get(o.src);if(image)ctx.drawImage(image,-o.width/2,-o.height/2,o.width,o.height);
  }else{
    objectBounds(o,ctx);ctx.fillStyle=o.color;ctx.textAlign=o.align||'center';ctx.textBaseline='middle';
    const lines=o.text.split('\n'),bounds=objectBounds(o,ctx);
    const x=o.align==='left'?-bounds.width/2:o.align==='right'?bounds.width/2:0;
    lines.forEach((line,i)=>ctx.fillText(line,x,(i-(lines.length-1)/2)*o.fontSize*1.35));
  }
  ctx.restore();
}
export async function renderSurface(surface,objects,{selection=null,withBackground=false}={}) {
  const c=canvas(surface.width,surface.height),ctx=c.getContext('2d');
  const images=new Map(await Promise.all(objects.filter(o=>o.type==='image').map(async o=>[o.src,await loadImage(o.src)])));
  const fill=ctx.createLinearGradient(0,0,c.width,c.height);fill.addColorStop(0,surface.fill);fill.addColorStop(.48,surface.fill);fill.addColorStop(1,surface.fill==='#4b4b49'?'#383b39':'#b9a977');
  if(!surface.transparent||withBackground){ctx.fillStyle=fill;ctx.fillRect(0,0,c.width,c.height);}
  const content=canvas(c.width,c.height),ink=content.getContext('2d');
  objects.forEach(o=>drawObject(ink,o,images));
  let overflow=false;
  for(const o of objects){const b=objectBounds(o,ink),r=o.rotation*Math.PI/180;const ex=Math.abs(b.width/2*Math.cos(r))+Math.abs(b.height/2*Math.sin(r));const ey=Math.abs(b.width/2*Math.sin(r))+Math.abs(b.height/2*Math.cos(r));if(o.x-ex<0||o.x+ex>c.width||o.y-ey<0||o.y+ey>c.height)overflow=true;}
  let mask;
  if(surface.mask||surface.outline){
    mask=canvas(c.width,c.height);const maskContext=mask.getContext('2d');
    if(surface.mask){const image=await loadImage(surface.mask);maskContext.drawImage(image,0,0,c.width,c.height);}
    else{const inverse=invert(projection(surface.quad));maskContext.fillStyle='#fff';maskContext.beginPath();surface.outline.forEach(([x,y],i)=>{const [u,v]=project(inverse,x,y);i?maskContext.lineTo(u*c.width,v*c.height):maskContext.moveTo(u*c.width,v*c.height)});maskContext.closePath();maskContext.fill();}
    const pixels=ink.getImageData(0,0,c.width,c.height).data,allowed=mask.getContext('2d').getImageData(0,0,c.width,c.height).data;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]>50&&allowed[i]<128){overflow=true;break;}
  }
  ctx.drawImage(content,0,0);
  if(selection){
    const o=objects.find(o=>o.id===selection);
    if(o){const b=objectBounds(o,ctx);ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rotation*Math.PI/180);ctx.strokeStyle='#53614d';ctx.lineWidth=Math.max(2,c.width/250);ctx.setLineDash([12,7]);ctx.strokeRect(-b.width/2-8,-b.height/2-8,b.width+16,b.height+16);ctx.setLineDash([]);for(const x of [-b.width/2-8,b.width/2+8])for(const y of [-b.height/2-8,b.height/2+8]){ctx.fillStyle='#fff';ctx.fillRect(x-5,y-5,10,10);ctx.strokeRect(x-5,y-5,10,10);}ctx.restore();}
  }
  if(mask){ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';}
  return {canvas:c,overflow};
}
function triangle(ctx,image,src,dst) {
  const [[x0,y0],[x1,y1],[x2,y2]]=src,[[u0,v0],[u1,v1],[u2,v2]]=dst;
  const d=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);if(Math.abs(d)<1e-9)return;
  const a=(u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/d;
  const b=(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/d;
  const cc=(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/d;
  const dd=(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/d;
  const ee=(u0*(x1*y2-x2*y1)+u1*(x2*y0-x0*y2)+u2*(x0*y1-x1*y0))/d;
  const ff=(v0*(x1*y2-x2*y1)+v1*(x2*y0-x0*y2)+v2*(x0*y1-x1*y0))/d;
  // Overlap clip edges by a fraction of a display pixel so raster anti-aliasing
  // cannot reveal the source lettering between adjacent projection triangles.
  const cx=(u0+u1+u2)/3,cy=(v0+v1+v2)/3;
  const expanded=dst.map(([x,y])=>{const length=Math.hypot(x-cx,y-cy)||1;return [x+(x-cx)/length*.85,y+(y-cy)/length*.85]});
  ctx.save();ctx.beginPath();expanded.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.transform(a,b,cc,dd,ee,ff);ctx.drawImage(image,0,0);ctx.restore();
}
function mapped(ctx,image,quad) {
  const m=projection(quad),n=8;
  for(let x=0;x<n;x++)for(let y=0;y<n;y++){
    const uv=[[x/n,y/n],[(x+1)/n,y/n],[(x+1)/n,(y+1)/n],[x/n,(y+1)/n]];
    const s=uv.map(([u,v])=>[u*image.width,v*image.height]),d=uv.map(([u,v])=>project(m,u,v));
    triangle(ctx,image,[s[0],s[1],s[2]],[d[0],d[1],d[2]]);triangle(ctx,image,[s[0],s[2],s[3]],[d[0],d[2],d[3]]);
  }
}
export function photoQuad(surface,crop,width,height) {
  return surface.quad.map(([x,y])=>[(x-crop[0])/crop[2]*width,(y-crop[1])/crop[3]*height]);
}
export async function renderProduct(model,layout,documents,{width=1000,selectedSurface=null,selectedObject=null,mode='product'}={}) {
  const image=await loadImage(model.previewPhoto);
  const {crop,surfaces}=layout;
  const height=Math.round(width*crop[3]*image.height/(crop[2]*image.width));
  const c=canvas(width,height),ctx=c.getContext('2d');
  const rendered=await Promise.all(surfaces.map(async s=>[s.id,await renderSurface(s,documents[s.id]||[],{selection:selectedSurface===s.id?selectedObject:null,withBackground:mode==='detail'})]));
  if(mode==='detail'){
    const active=surfaces.find(s=>s.id===selectedSurface)||surfaces[0];
    const plate=rendered.find(([id])=>id===active.id)[1].canvas;
    c.height=Math.round(c.width*Math.max(.65,Math.min(1.25,plate.height/plate.width)));
    ctx.fillStyle='#eaece5';ctx.fillRect(0,0,c.width,c.height);
    const scale=Math.min((c.width-100)/plate.width,(c.height-100)/plate.height);
    const w=plate.width*scale,h=plate.height*scale,x=(c.width-w)/2,y=(c.height-h)/2;
    ctx.drawImage(plate,x,y,w,h);
    return {canvas:c,overflow:rendered.some(([,r])=>r.overflow),detail:{x,y,width:w,height:h,surface:active}};
  }
  ctx.drawImage(image,crop[0]*image.width,crop[1]*image.height,crop[2]*image.width,crop[3]*image.height,0,0,c.width,c.height);
  surfaces.forEach(s=>{
    const plate=rendered.find(([id])=>id===s.id)[1].canvas;
    ctx.save();
    const q=photoQuad(s,crop,c.width,c.height);
    if(s.outline){ctx.beginPath();s.outline.forEach(([x,y],i)=>{const px=(x-crop[0])/crop[2]*c.width,py=(y-crop[1])/crop[3]*c.height;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.closePath();ctx.clip();}
    mapped(ctx,plate,q);ctx.restore();
    if(selectedSurface===s.id){ctx.save();ctx.strokeStyle='#657d5e';ctx.lineWidth=2.5;ctx.beginPath();q.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.stroke();ctx.restore();}
  });
  return {canvas:c,overflow:rendered.some(([,r])=>r.overflow)};
}
