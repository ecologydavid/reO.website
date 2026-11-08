// cad2web.mjs — turn the tessellated CAD (Dw.json / Ew.json) into the studio's data:
//  public/models/cad-<id>.bin   positions (Float32, scene units) · normals (Int8, three space) · indices (Uint32)
//  src/data/cad-models.json     per model: mapping, parts (role, ranges), CAD-derived surfaces
// Scene units: X right, Y down, Z toward the viewer (ThreeModel's world() turns them into three space).
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const ROOT=fileURLToPath(new URL('../../',import.meta.url)).replaceAll('\\','/');
const canon=JSON.parse(fs.readFileSync(ROOT+'src/data/canonical-models.json','utf8'));
const out={};
const plane3=pts=>{ // least squares Z = a + bX + cY
 let n=0,sx=0,sy=0,sz=0,sxx=0,syy=0,sxy=0,sxz=0,syz=0;for(const [x,y,z] of pts){n++;sx+=x;sy+=y;sz+=z;sxx+=x*x;syy+=y*y;sxy+=x*y;sxz+=x*z;syz+=y*z}
 const M=[[n,sx,sy],[sx,sxx,sxy],[sy,sxy,syy]],v=[sz,sxz,syz];
 const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
 const D=det(M),col=(i)=>M.map((r,k)=>r.map((x,j)=>j===i?v[k]:x));return [det(col(0))/D,det(col(1))/D,det(col(2))/D]};
const rdp=(pts,eps)=>{if(pts.length<3)return pts;const [a,b]=[pts[0],pts[pts.length-1]];let idx=0,dmax=0;for(let i=1;i<pts.length-1;i++){const p=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,d=Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/L;if(d>dmax){dmax=d;idx=i}}return dmax>eps?[...rdp(pts.slice(0,idx+1),eps).slice(0,-1),...rdp(pts.slice(idx),eps)]:[a,b]};
const rdpClosed=(pts,eps)=>{let far=0,fd=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]);if(d>fd){fd=d;far=i}}const a=rdp(pts.slice(0,far+1),eps),b=rdp([...pts.slice(far),pts[0]],eps);return [...a.slice(0,-1),...b.slice(0,-1)]};
const area=p=>p.reduce((s,q,i)=>{const r=p[(i+1)%p.length];return s+q[0]*r[1]-r[0]*q[1]},0)/2;
const normalise=(poly)=>{const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;return {x,y,displayWidth:w,displayHeight:h,polygon:poly.map(([px,py])=>[+((px-x)/w).toFixed(6),+((py-y)/h).toFixed(6)])}};
const surfacePlane=(s,fit)=>{const Z=(X,Y)=>fit[0]+fit[1]*X+fit[2]*Y;return {plane_origin:[s.x,s.y,+Z(s.x,s.y).toFixed(4)],basis_u:[s.displayWidth,0,+(fit[1]*s.displayWidth).toFixed(6)],basis_v:[0,s.displayHeight,+(fit[2]*s.displayHeight).toFixed(6)],source:'CAD face plane (STEP)'}};

function build(id,file,pick){
 const d=JSON.parse(fs.readFileSync(file,'utf8'));
 const parts=pick.map(([pid,role])=>({...d.parts.find(p=>p.id===pid),role}));
 const P=parts.flatMap(p=>{const o=[];for(let i=0;i<p.positions.length;i+=3)o.push([p.positions[i],p.positions[i+1],p.positions[i+2]]);return o});
 const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),zs=P.map(p=>p[2]);
 const map=id==='D'
  ?{k:canon.models.D.height/(Math.max(...zs)-0),zTop:Math.max(...zs),zBot:0}
  :(()=>{const metal=parts.find(p=>p.role==='metal'),mx=[];for(let i=0;i<metal.positions.length;i+=3)mx.push(metal.positions[i]);const k=1000/(Math.max(...mx)-Math.min(...mx));return {k,zTop:Math.max(...zs),zBot:Math.min(...zs),x0:Math.min(...mx)}})();
 if(id==='D')map.x0=(Math.min(...xs)+Math.max(...xs))/2-canon.models.D.width/2/map.k;
 map.yc=(Math.min(...ys)+Math.max(...ys))/2;
 const S=([x,y,z])=>[(x-map.x0)*map.k,(map.zTop-z)*map.k,(map.yc-y)*map.k];
 const height=+((map.zTop-map.zBot)*map.k).toFixed(3),width=id==='D'?canon.models.D.width:1000;
 // binary
 let vTotal=0,iTotal=0;for(const p of parts){vTotal+=p.positions.length/3;iTotal+=p.indices.length}
 const pos=new Float32Array(vTotal*3),nor=new Int8Array(vTotal*3),idx=new Uint32Array(iTotal);let vo=0,io=0;const ranges=[];
 for(const p of parts){const n=p.positions.length/3;for(let i=0;i<n;i++){const s=S([p.positions[i*3],p.positions[i*3+1],p.positions[i*3+2]]);pos.set(s.map(v=>+v.toFixed(3)),(vo+i)*3);const [nx,ny,nz]=[p.normals[i*3],p.normals[i*3+1],p.normals[i*3+2]];nor.set([Math.round(nx*127),Math.round(nz*127),Math.round(-ny*127)],(vo+i)*3)}
  for(let i=0;i<p.indices.length;i++)idx[io+i]=p.indices[i]+vo;
  ranges.push({role:p.role,name:p.name,vertexStart:vo,vertexCount:n,indexStart:io,indexCount:p.indices.length});vo+=n;io+=p.indices.length}
 const buf=Buffer.concat([Buffer.from(pos.buffer),Buffer.from(nor.buffer),Buffer.alloc((4-(nor.byteLength%4))%4),Buffer.from(idx.buffer)]);
 fs.writeFileSync(ROOT+`public/assets/models/cad-${id}.bin`,buf);
 const facesOf=role=>parts.find(p=>p.role===role).faces.filter(f=>f.normal);
 return {id,map,width,height,parts:ranges,vertexCount:vTotal,indexCount:iTotal,bytes:buf.length,S,facesOf,parts_:parts}}

// ---------- D ----------
const D=build('D','Dw.json',[[7633,'stone'],[364,'metal']]);
// The lower text area sits on the stone's own front face below the plate (it starts at the bottom edge,
// z ≈ 0.5 mm, and reaches the plate), not on the 1 mm recessed foot under it.
{const plate=D.facesOf('metal').find(f=>f.normal[1]<-.9),stoneFront=D.facesOf('stone').filter(f=>f.normal[1]<-.9).find(f=>{const z=f.loops[0].map(p=>p[2]);return Math.min(...z)>=0&&Math.min(...z)<2&&Math.max(...z)>30});
 const [main,lower]=canon.models.D.surfaces;
 D.surfaces={main:surfacePlane(main,plane3(plate.loops[0].map(D.S))),lower:surfacePlane(lower,plane3(stoneFront.loops[0].map(D.S)))};
 console.log('D plate outline (scene)',plate.loops[0].map(D.S).map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' | '));
 console.log('D canonical main', [[0,0],[1,0],[1,1],[0,1]].map(()=>0)&&main.polygon.map(([u,v])=>[(main.x+u*main.displayWidth).toFixed(1),(main.y+v*main.displayHeight).toFixed(1)].join(',')).join(' | '));
}
// ---------- E ----------
const E=build('E','Ew.json',[[9934,'stone'],[5586,'metal']]);
{const metal=E.parts_.find(p=>p.role==='metal'),stone=E.parts_.find(p=>p.role==='stone');
 const panel=E.facesOf('metal').filter(f=>f.normal[1]<-.99).sort((a,b)=>b.loops[0].length-a.loops[0].length)[0];
 const flap=E.facesOf('metal').filter(f=>f.normal[1]<-.9&&f.normal[1]>-.999&&f.normal[2]>.05).sort((a,b)=>b.loops[0].length-a.loops[0].length)[0];
 const panelPoly=panel.loops[0].map(E.S),panelZ=panelPoly[0][2];
 // Visible part of the back panel: rasterise panel minus everything in front of it (stone, flap, base).
 const R=1.5,xs=panelPoly.map(p=>p[0]),ys=panelPoly.map(p=>p[1]),X0=Math.min(...xs)-4,Y0=Math.min(...ys)-4,W=Math.ceil((Math.max(...xs)-X0+4)/R),H=Math.ceil((Math.max(...ys)-Y0+4)/R);
 const inside=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
 const mask=new Uint8Array(W*H);for(let j=0;j<H;j++)for(let i=0;i<W;i++)if(inside(panelPoly,X0+(i+.5)*R,Y0+(j+.5)*R))mask[j*W+i]=1;
 const occlude=(p,test)=>{const P=p.positions,I=p.indices;for(let t=0;t<I.length;t+=3){const v=[0,1,2].map(k=>E.S([P[I[t+k]*3],P[I[t+k]*3+1],P[I[t+k]*3+2]]));if(!test(v))continue;
  const minx=Math.max(0,Math.floor((Math.min(...v.map(q=>q[0]))-X0)/R)),maxx=Math.min(W-1,Math.ceil((Math.max(...v.map(q=>q[0]))-X0)/R)),miny=Math.max(0,Math.floor((Math.min(...v.map(q=>q[1]))-Y0)/R)),maxy=Math.min(H-1,Math.ceil((Math.max(...v.map(q=>q[1]))-Y0)/R));
  for(let j=miny;j<=maxy;j++)for(let i=minx;i<=maxx;i++){const x=X0+(i+.5)*R,y=Y0+(j+.5)*R;if(inside(v,x,y))mask[j*W+i]=0}}};
 occlude(stone,()=>true);occlude(metal,v=>(v[0][2]+v[1][2]+v[2][2])/3>panelZ+3);
 // a 1-cell erosion keeps the outline off hairline gaps, then the largest region is traced
 const er=new Uint8Array(W*H);for(let j=1;j<H-1;j++)for(let i=1;i<W-1;i++)er[j*W+i]=mask[j*W+i]&&mask[j*W+i-1]&&mask[j*W+i+1]&&mask[(j-1)*W+i]&&mask[(j+1)*W+i]?1:0;
 const lab=new Int32Array(W*H);let best=0,bestN=0,cur=0;for(let s=0;s<W*H;s++)if(er[s]&&!lab[s]){cur++;let n=0;const st=[s];lab[s]=cur;while(st.length){const q=st.pop();n++;for(const r of [q-1,q+1,q-W,q+W])if(r>=0&&r<W*H&&er[r]&&!lab[r]){lab[r]=cur;st.push(r)}}if(n>bestN){bestN=n;best=cur}}
 // boundary trace (Moore neighbour) on the cell grid
 const on=(i,j)=>i>=0&&j>=0&&i<W&&j<H&&lab[j*W+i]===best;let sx=-1,sy=-1;for(let j=0;j<H&&sx<0;j++)for(let i=0;i<W;i++)if(on(i,j)){sx=i;sy=j;break}
 const dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];const contour=[];let cx=sx,cy=sy,dir=7,guard=0;
 do{contour.push([X0+(cx+.5)*R,Y0+(cy+.5)*R]);let k=(dir+6)%8,found=false;for(let n=0;n<8;n++){const [dx,dy]=dirs[(k+n)%8];if(on(cx+dx,cy+dy)){dir=(k+n)%8;cx+=dx;cy+=dy;found=true;break}}if(!found)break}while((cx!==sx||cy!==sy)&&++guard<1e6);
 let back=rdpClosed(contour,2.2);if(area(back)<0)back.reverse();
 let front=rdpClosed(flap.loops[0].map(E.S).map(p=>[p[0],p[1]]),1.2);if(area(front)<0)front.reverse();
 const b=normalise(back),f=normalise(front);
 E.canon={back:b,front:f};
 E.surfaces={back:surfacePlane(b,[panelZ,0,0]),front:surfacePlane(f,plane3(flap.loops[0].map(E.S)))};
 console.log('E back points',back.length,'front points',front.length,'panelZ',panelZ.toFixed(1),'front plane',JSON.stringify(E.surfaces.front));
}
// ---------- A, B, C (2026-11-07) ----------
// One set of solids per file (the files hold several finishes of the same shape). Width 1000 = the reference
// solid's width (A: the wooden column, B and C: the wooden board). front '+y' mirrors X so the CAD's +Y side
// faces the viewer (C is drawn with its plate on +Y).
function buildSimple(id,file,pick,{ref,front='-y'}){
 const d=JSON.parse(fs.readFileSync(file,'utf8'));
 const parts=pick.map(([pid,role])=>({...d.parts.find(p=>p.id===pid),role}));
 const P=parts.flatMap(p=>{const o=[];for(let i=0;i<p.positions.length;i+=3)o.push([p.positions[i],p.positions[i+1],p.positions[i+2]]);return o});
 const rp=parts.find(p=>p.id===ref),rx=[];for(let i=0;i<rp.positions.length;i+=3)rx.push(rp.positions[i]);
 const zs=P.map(p=>p[2]),ys=P.map(p=>p[1]),k=1000/(Math.max(...rx)-Math.min(...rx)),flip=front==='+y';
 const map={k,zTop:Math.max(...zs),zBot:Math.min(...zs),x0:flip?Math.max(...rx):Math.min(...rx),yc:(Math.min(...ys)+Math.max(...ys))/2,front};
 const S=flip?([x,y,z])=>[(map.x0-x)*k,(map.zTop-z)*k,(y-map.yc)*k]:([x,y,z])=>[(x-map.x0)*k,(map.zTop-z)*k,(map.yc-y)*k];
 const N=flip?([nx,ny,nz])=>[-nx,nz,ny]:([nx,ny,nz])=>[nx,nz,-ny];
 const height=+((map.zTop-map.zBot)*k).toFixed(3),width=1000;
 let vTotal=0,iTotal=0;for(const p of parts){vTotal+=p.positions.length/3;iTotal+=p.indices.length}
 const pos=new Float32Array(vTotal*3),nor=new Int8Array(vTotal*3),idx=new Uint32Array(iTotal);let vo=0,io=0;const ranges=[];
 for(const p of parts){const n=p.positions.length/3;for(let i=0;i<n;i++){pos.set(S([p.positions[i*3],p.positions[i*3+1],p.positions[i*3+2]]).map(v=>+v.toFixed(3)),(vo+i)*3);nor.set(N([p.normals[i*3],p.normals[i*3+1],p.normals[i*3+2]]).map(v=>Math.round(v*127)),(vo+i)*3)}
  for(let i=0;i<p.indices.length;i++)idx[io+i]=p.indices[i]+vo;
  ranges.push({role:p.role,name:p.name,vertexStart:vo,vertexCount:n,indexStart:io,indexCount:p.indices.length});vo+=n;io+=p.indices.length}
 const buf=Buffer.concat([Buffer.from(pos.buffer),Buffer.from(nor.buffer),Buffer.alloc((4-(nor.byteLength%4))%4),Buffer.from(idx.buffer)]);
 fs.writeFileSync(ROOT+`public/assets/models/cad-${id}.bin`,buf);
 // The face of a part that looks at the viewer, largest first (three-space normal z).
 const facing=role=>parts.find(p=>p.role===role).faces.filter(f=>f.normal&&N(f.normal)[2]>.9).map(f=>({f,poly:f.loops[0].map(S)})).sort((a,b)=>Math.abs(area(b.poly))-Math.abs(area(a.poly)));
 return {id,map,width,height,parts:ranges,vertexCount:vTotal,indexCount:iTotal,bytes:buf.length,S,facing};
}
// The plate's own outline (rounded corners kept) and its plane.
const plateSurface=(M,eps=1.2)=>{const {poly}=M.facing('metal')[0];let o=rdpClosed(poly.map(p=>[p[0],p[1]]),eps);if(area(o)<0)o.reverse();const n=normalise(o);return {canon:n,plane:surfacePlane(n,plane3(poly))}};
// Clip a polygon to minY <= y <= maxY (Sutherland–Hodgman, two half-planes).
const clipY=(poly,lo,hi)=>{const cut=(pts,inside,at)=>{const o=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ia=inside(a),ib=inside(b);if(ia)o.push(a);if(ia!==ib){const y=at,t=(y-a[1])/(b[1]-a[1]);o.push([a[0]+(b[0]-a[0])*t,y])}}return o};return cut(cut(poly,p=>p[1]>=lo,lo),p=>p[1]<=hi,hi)};
const A=buildSimple('A','Aw.json',[[13606,'wood'],[13033,'stone'],[495,'metal']],{ref:13606});
{const lower=plateSurface(A);
 // Upper text area: the column's flat front face (the corner cut is its own face) from the old top line
 // (1641.2 / 5091 of the height) down to 60 units above the plate's highest point.
 const {poly}=A.facing('wood')[0],top=A.height*1641.2/5091,bottom=lower.canon.y-60;
 let up=rdpClosed(clipY(poly.map(p=>[p[0],p[1]]),top,bottom),1);if(area(up)<0)up.reverse();const u=normalise(up);
 A.canon={upper:u,lower:lower.canon};A.surfaces={upper:surfacePlane(u,plane3(poly)),lower:lower.plane};}
const B=buildSimple('B','Bw.json',[[2250,'wood'],[1954,'stone'],[316,'metal']],{ref:2250});
{const m=plateSurface(B);B.canon={main:m.canon};B.surfaces={main:m.plane}}
const C=buildSimple('C','Cw.json',[[6339,'wood'],[3379,'stone'],[254,'metal']],{ref:6339,front:'+y'});
{const m=plateSurface(C);C.canon={main:m.canon};C.surfaces={main:m.plane}}
for(const M of [A,B,C])console.log(M.id,'height',M.height,'map',JSON.stringify(M.map),'\n canon',JSON.stringify(M.canon),'\n planes',JSON.stringify(M.surfaces));

const strip=({S,facesOf,facing,parts_,...rest})=>rest;
// Front-view margins come from frontgen; keep them when the geometry is rebuilt.
const prev=fs.existsSync(ROOT+'src/data/cad-models.json')?JSON.parse(fs.readFileSync(ROOT+'src/data/cad-models.json','utf8')).models:{};
const models=Object.fromEntries([D,E,A,B,C].map(M=>[M.id,{...strip(M),...(prev[M.id]?.front?{front:prev[M.id].front}:{})}]));
fs.writeFileSync(ROOT+'src/data/cad-models.json',JSON.stringify({note:'Generated from the owner-supplied STEP files (公版D款.step, 公版E.step 2026-11-06; 公版A.step, 公版B.step, 公版C.step 2026-11-07) by step2mesh + cad2web. Geometry lives in public/assets/models/cad-<id>.bin.',models},null,1));
for(const M of [D,E,A,B,C])console.log(M.id,M.vertexCount,'verts',M.indexCount/3,'tris',(M.bytes/1024).toFixed(0)+'KB','height',M.height);
