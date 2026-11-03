import {loadImage} from './render.js';
import {objectBounds} from './geometry.mjs';
import {drawObject,makeCanvas} from './canonicalRender.js';
import {traceContours,simplifyLoop} from './trace.mjs';

// EPS artwork for designers and engravers: every editable surface side by side at the product's
// approximate scale, its outline as a thin red reference line (the colour of the official line
// drawings), text converted to outlines, uploaded graphics embedded and clipped to their own shape.
// Text is traced from the browser's own rendering (glyph outlines are not exposed), so the file
// needs none of the customer's fonts. Scale follows the diagram reconstruction, not CAD.
const PT=72/25.4,GAP=12,MARGIN=10,LABEL=9;
const f=(n,digits=2)=>(Math.round(n*10**digits)/10**digits).toString();

// Millimetres per scene unit, from the product's listed height (or the medal's diameter).
export function mmPerUnit(model,scene){const d=model.dimensions_mm;return Array.isArray(d)?d[2]/scene.height:d.diameter/scene.width}

function rgb(hex){const h=(hex||'#000').replace('#','');const n=h.length===3?h.split('').map(c=>c+c).join(''):h.padEnd(6,'0');return [0,2,4].map(i=>parseInt(n.slice(i,i+2),16)/255)}
// Page paths are in points (two decimals is under 0.004 mm); clip paths in an image's unit square need
// more. Lines stay under 200 characters (DSC readers expect at most 255).
function pathOps(loops,toPage,digits=2){
 const out=[];
 for(const loop of loops){
  let line='';
  loop.forEach(([x,y],k)=>{const [px,py]=toPage(x,y),op=`${f(px,digits)} ${f(py,digits)} ${k?'l':'m'}`;if(line.length+op.length>196){out.push(line);line=''}line+=(line?' ':'')+op});
  out.push(line+' h');
 }
 return out.join('\n');
}

// Draw one text object alone, large enough that every glyph is ~160px tall, and trace its coverage.
function traceText(o){
 const probe=makeCanvas(4,4).getContext('2d'),b=objectBounds(o,probe),r=o.rotation*Math.PI/180;
 const bw=Math.abs(b.width*Math.cos(r))+Math.abs(b.height*Math.sin(r)),bh=Math.abs(b.width*Math.sin(r))+Math.abs(b.height*Math.cos(r));
 const R=Math.max(.5,Math.min(160/o.fontSize,8,4000/Math.max(bw,bh,1)));
 const c=makeCanvas(bw*R+16,bh*R+16),ctx=c.getContext('2d');
 ctx.translate(c.width/2,c.height/2);ctx.scale(R,R);ctx.translate(-o.x,-o.y);drawObject(ctx,{...o,color:'#000',hidden:false},new Map());
 const data=ctx.getImageData(0,0,c.width,c.height).data,alpha=new Float32Array(c.width*c.height);
 for(let k=0;k<alpha.length;k++)alpha[k]=data[k*4+3]/255;
 // Back to surface units around the object's centre.
 return traceContours(alpha,c.width,c.height).map(loop=>simplifyLoop(loop,.3).map(([x,y])=>[o.x+(x-c.width/2)/R,o.y+(y-c.height/2)/R]));
}

function ascii85(bytes){
 let out='';
 for(let k=0;k<bytes.length;k+=4){
  const n=Math.min(4,bytes.length-k);let v=0;for(let q=0;q<4;q++)v=v*256+(q<n?bytes[k+q]:0);
  if(n===4&&v===0){out+='z';continue}
  const chars=[];for(let q=0;q<5;q++){chars.unshift(String.fromCharCode(33+v%85));v=Math.floor(v/85)}
  out+=chars.slice(0,n+1).join('');
 }
 // Short lines; a leading space keeps a line from starting with % (DSC comment syntax).
 return (out.match(/.{1,76}/g)||[]).map(line=>line[0]==='%'?' '+line:line).join('\n')+'~>';
}
async function deflate(bytes){
 if(typeof CompressionStream==='undefined')return null;
 const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
 return new Uint8Array(await new Response(stream).arrayBuffer());
}

// An uploaded graphic: RGB over white, at most 1600px, clipped to the outline of its opaque part.
async function imageOps(o,place){
 const image=await loadImage(o.src),s=Math.min(1,1600/Math.max(image.width,image.height));
 const w=Math.max(1,Math.round(image.width*s)),h=Math.max(1,Math.round(image.height*s)),c=makeCanvas(w,h),ctx=c.getContext('2d');
 ctx.drawImage(image,0,0,w,h);const px=ctx.getImageData(0,0,w,h).data;
 const rgbBytes=new Uint8Array(w*h*3),alpha=new Float32Array(w*h);let clear=false;
 for(let k=0;k<w*h;k++){const a=px[k*4+3]/255;alpha[k]=a;if(a<.98)clear=true;for(let q=0;q<3;q++)rgbBytes[k*3+q]=Math.round(px[k*4+q]*a+255*(1-a))}
 const packed=await deflate(rgbBytes),filters=packed?'/ASCII85Decode filter /FlateDecode filter':'/ASCII85Decode filter';
 const clip=clear?traceContours(alpha,w,h).map(loop=>simplifyLoop(loop,.4)):null;
 const [cx,cy,scale]=place(o.x,o.y);
 return ['gsave',`${f(cx)} ${f(cy)} translate ${f(-o.rotation)} rotate ${f(o.width*scale)} ${f(o.height*scale)} scale -0.5 -0.5 translate`,
  clip?.length?pathOps(clip,(x,y)=>[x/w,1-y/h],5)+' eoclip newpath':'',
  '/DeviceRGB setcolorspace',
  `<< /ImageType 1 /Width ${w} /Height ${h} /BitsPerComponent 8 /Decode [0 1 0 1 0 1] /ImageMatrix [${w} 0 0 ${-h} 0 ${h}] /DataSource currentfile ${filters} >> image`,
  ascii85(packed||rgbBytes),'grestore'].filter(Boolean).join('\n');
}

export async function exportEps(model,scene,documents){
 const unit=mmPerUnit(model,scene);
 const sizes=scene.surfaces.map(s=>{const k=unit*s.displayWidth/s.width;return {s,k,w:s.width*k,h:s.height*k}});
 const pageW=MARGIN*2+sizes.reduce((sum,z)=>sum+z.w,0)+GAP*(sizes.length-1),pageH=MARGIN*2+LABEL+Math.max(...sizes.map(z=>z.h));
 const body=[];let left=MARGIN;
 for(const {s,k,w,h} of sizes){
  const bottom=MARGIN+LABEL,toPage=(x,y)=>[(left+x*k)*PT,(bottom+h-y*k)*PT];
  // Artwork is clipped to the outline: whatever was left hanging past the plate is not produced.
  const outline=pathOps([s.polygon.map(([u,v])=>[u*s.width,v*s.height])],toPage);
  body.push(`% ${s.id}: ${f(w)} x ${f(h)} mm`,'gsave',outline,'clip newpath');
  for(const o of (documents[s.id]||[]).filter(o=>!o.hidden)){
   if(o.type==='text'){const loops=traceText(o);if(loops.length)body.push(`gsave ${rgb(o.color).map(f).join(' ')} setrgbcolor`,pathOps(loops,toPage),'eofill grestore')}
   else body.push(await imageOps(o,(x,y)=>[...toPage(x,y),k*PT]));
  }
  body.push('grestore','gsave 1 0 0 setrgbcolor 0.35 setlinewidth 1 setlinejoin',outline,'stroke grestore');
  body.push(`gsave 0.45 setgray /Helvetica findfont 6.5 scalefont setfont ${f(left*PT)} ${f(MARGIN*PT)} moveto (re.O ${model.id} / ${s.id} / ${f(w)} x ${f(h)} mm, approx. scale) show grestore`);
  left+=w+GAP;
 }
 const W=pageW*PT,H=pageH*PT;
 const eps=['%!PS-Adobe-3.0 EPSF-3.0',`%%BoundingBox: 0 0 ${Math.ceil(W)} ${Math.ceil(H)}`,`%%HiResBoundingBox: 0 0 ${f(W)} ${f(H)}`,
  `%%Title: (re.O ${model.id} plaque artwork)`,'%%Creator: (re.O Plaque Studio)',`%%CreationDate: (${new Date().toLocaleDateString('sv')})`,
  '%%LanguageLevel: 3','%%DocumentData: Clean7Bit','%%DocumentNeededResources: font Helvetica','%%EndComments',
  '% Text is converted to outlines. Red lines show the editable outline from the diagram reconstruction;',
  '% sizes are approximate and the production drawing is confirmed by re.O (service@re-o.co).',
  '%%BeginProlog','/m {moveto} bind def /l {lineto} bind def /h {closepath} bind def','%%EndProlog',
  'save',...body,'restore','showpage','%%Trailer','%%EOF',''].join('\n');
 const blob=new Blob([eps],{type:'application/postscript'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`reO-${model.id}${model.id==='F'?'-'+scene.shape:''}-artwork.eps`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
 return sizes.length;
}
