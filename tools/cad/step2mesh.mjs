// step2mesh.mjs — a small STEP (AP203/214/242) B-rep tessellator written for the re.O D/E models.
// Usage: node step2mesh.mjs <in.step> <out.json> [chordTolMm]
// Supports the entities in those files: MANIFOLD_SOLID_BREP → CLOSED_SHELL → ADVANCED_FACE with PLANE,
// CYLINDRICAL_, CONICAL_, SPHERICAL_, (DEGENERATE_)TOROIDAL_ and (rational) B-spline surfaces; edges on
// LINE, CIRCLE, ELLIPSE and (rational) B-spline curves (via SURFACE_CURVE / SEAM_CURVE).
// Each edge is sampled once and shared by both faces that use it, so faces meet without cracks. A face
// is mapped to its surface parameters, triangulated there (three.js Earcut, holes included), then
// refined until no triangle edge strays more than the chord tolerance from the true surface.
// Normals are the surface's own (smooth across fillets, sharp at real edges).
import fs from 'node:fs';

const THREE=await import(new URL('../../node_modules/three/build/three.module.js',import.meta.url).href);
const {ShapeUtils,Vector2}=THREE;
const [input,output,tolArg]=process.argv.slice(2);
const TOL=+(tolArg||.008),ARC_MAX=Math.PI/45; // sagitta tolerance (mm), max 4° per arc step

// ---------- parsing ----------
const text=fs.readFileSync(input,'utf8');
const data=text.slice(text.indexOf('DATA;')+5,text.lastIndexOf('ENDSEC'));
const E=new Map();
{let i=0;const s=data;
 while(i<s.length){const h=s.indexOf('#',i);if(h<0)break;const eq=s.indexOf('=',h);const id=+s.slice(h+1,eq);
  // find the terminating ';' outside strings
  let j=eq+1,inStr=false;for(;j<s.length;j++){const c=s[j];if(c==="'"){if(inStr&&s[j+1]==="'"){j++;continue}inStr=!inStr}else if(c===';'&&!inStr)break}
  E.set(id,s.slice(eq+1,j).trim());i=j+1}}
function parse(s){let i=0;const ws=()=>{while(i<s.length&&/\s/.test(s[i]))i++};
 const val=()=>{ws();const c=s[i];
  if(c==='#'){let j=i+1;while(/\d/.test(s[j]))j++;const v={ref:+s.slice(i+1,j)};i=j;return v}
  if(c==="'"){let j=i+1,o='';for(;;){if(s[j]==="'"){if(s[j+1]==="'"){o+="'";j+=2;continue}break}o+=s[j++]}i=j+1;return o}
  if(c==='('){i++;const a=[];ws();if(s[i]===')'){i++;return a}for(;;){a.push(val());ws();if(s[i]===','){i++;continue}if(s[i]===')'){i++;break}throw new Error('bad list at '+s.slice(i,i+30))}return a}
  if(c==='.'){const j=s.indexOf('.',i+1);const v={enum:s.slice(i+1,j)};i=j+1;return v}
  if(c==='$'||c==='*'){i++;return null}
  if(/[A-Z_]/.test(c)){let j=i;while(/[A-Z_0-9]/.test(s[j]))j++;const type=s.slice(i,j);i=j;ws();return {type,args:val()}}
  let j=i;while(/[-+0-9.Ee]/.test(s[j]))j++;const v=parseFloat(s.slice(i,j));i=j;return v};
 ws();if(s[i]==='('){i++;const parts={};ws();while(s[i]!==')'){const t=val();parts[t.type]=t.args;ws()}return {type:'COMPLEX',parts}}
 return val()}
const cache=new Map();const get=id=>{if(id&&typeof id==='object')id=id.ref;if(!cache.has(id))cache.set(id,parse(E.get(id)));return cache.get(id)};

// ---------- vectors ----------
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=a=>Math.hypot(a[0],a[1],a[2]),unit=a=>mul(a,1/(len(a)||1)),dist=(a,b)=>len(sub(a,b));
const point=r=>get(r).args[1];const direction=r=>unit(get(r).args[1]);
function frame(r){const a=get(r).args,o=point(a[1]);let z=a[2]?direction(a[2]):[0,0,1],x=a[3]?direction(a[3]):(Math.abs(z[0])<.9?[1,0,0]:[0,1,0]);x=unit(sub(x,mul(z,dot(x,z))));return {o,x,y:cross(z,x),z}}
const local=(f,p)=>{const d=sub(p,f.o);return [dot(d,f.x),dot(d,f.y),dot(d,f.z)]},world=(f,l)=>add(f.o,add(add(mul(f.x,l[0]),mul(f.y,l[1])),mul(f.z,l[2])));
const wrapNear=(a,ref)=>{while(a-ref>Math.PI)a-=2*Math.PI;while(a-ref<-Math.PI)a+=2*Math.PI;return a};

// ---------- B-splines ----------
function expandKnots(mults,knots){const k=[];mults.forEach((m,i)=>{for(let j=0;j<m;j++)k.push(knots[i])});return k}
function basis(p,U,t){const n=U.length-p-1;t=Math.min(Math.max(t,U[p]),U[n]);let span=p;for(let i=p;i<n;i++)if(t>=U[i]&&t<U[i+1])span=i;if(t>=U[n])span=n-1;
 const N=[1],left=[],right=[];for(let j=1;j<=p;j++){left[j]=t-U[span+1-j];right[j]=U[span+j]-t;let saved=0;for(let r=0;r<j;r++){const tmp=N[r]/((right[r+1]+left[j-r])||1e-300);N[r]=saved+right[r+1]*tmp;saved=left[j-r]*tmp}N[j]=saved}return {span,N}}
function bsplineCurve(e){
 let deg,ctrl,mults,knots,w=null;
 if(e.type==='COMPLEX'){const P=e.parts;[deg,ctrl]=P.B_SPLINE_CURVE;[mults,knots]=P.B_SPLINE_CURVE_WITH_KNOTS;if(P.RATIONAL_B_SPLINE_CURVE)w=P.RATIONAL_B_SPLINE_CURVE[0]}
 else{const a=e.args;deg=a[1];ctrl=a[2];mults=a[6];knots=a[7]}
 const pts=ctrl.map(point),U=expandKnots(mults,knots);w=w||pts.map(()=>1);
 const at=t=>{const {span,N}=basis(deg,U,t);let s=[0,0,0],ws=0;for(let i=0;i<=deg;i++){const k=span-deg+i,c=N[i]*w[k];s=add(s,mul(pts[k],c));ws+=c}return mul(s,1/ws)};
 return {at,t0:U[deg],t1:U[U.length-deg-1]}}
function bsplineSurface(e){
 let du,dv,ctrl,um,vm,uk,vk,w=null;
 if(e.type==='COMPLEX'){const P=e.parts;[du,dv,ctrl]=P.B_SPLINE_SURFACE;[um,vm,uk,vk]=P.B_SPLINE_SURFACE_WITH_KNOTS;if(P.RATIONAL_B_SPLINE_SURFACE)w=P.RATIONAL_B_SPLINE_SURFACE[0]}
 else{const a=e.args;du=a[1];dv=a[2];ctrl=a[3];um=a[8];vm=a[9];uk=a[10];vk=a[11]}
 const pts=ctrl.map(row=>row.map(point)),U=expandKnots(um,uk),V=expandKnots(vm,vk);w=w||pts.map(r=>r.map(()=>1));
 const at=(u,v)=>{const a=basis(du,U,u),b=basis(dv,V,v);let s=[0,0,0],ws=0;for(let i=0;i<=du;i++)for(let j=0;j<=dv;j++){const ki=a.span-du+i,kj=b.span-dv+j,c=a.N[i]*b.N[j]*w[ki][kj];s=add(s,mul(pts[ki][kj],c));ws+=c}return mul(s,1/ws)};
 return {at,u0:U[du],u1:U[U.length-du-1],v0:V[dv],v1:V[V.length-dv-1]}}

// ---------- curves: sample an edge from its start vertex to its end vertex ----------
function curveOf(r){let e=get(r);while(e.type==='SURFACE_CURVE'||e.type==='SEAM_CURVE')e=get(e.args[1]);return e}
const edgeCache=new Map();
function edgePoints(edgeRef){
 const id=edgeRef.ref;if(edgeCache.has(id))return edgeCache.get(id);
 const a=get(id).args,p1=point(get(a[1]).args[1]),p2=point(get(a[2]).args[1]),same=a[4].enum==='T',c=curveOf(a[3]);let pts;
 const arc=(f,rx,ry,ang)=>{ // param by angle on (possibly elliptic) circle
  const t1=ang(p1),t2=ang(p2),closed=dist(p1,p2)<1e-6;let a1=t1,a2=t2;
  if(same){if(closed)a2=a1+2*Math.PI;else while(a2<=a1+1e-9)a2+=2*Math.PI}else{if(closed)a2=a1-2*Math.PI;else while(a2>=a1-1e-9)a2-=2*Math.PI}
  const r=Math.max(rx,ry),step=Math.min(ARC_MAX,2*Math.acos(Math.max(-1,1-TOL/r))),n=Math.max(2,Math.ceil(Math.abs(a2-a1)/step));
  const out=[];for(let i=0;i<=n;i++){const t=a1+(a2-a1)*i/n;out.push(world(f,[rx*Math.cos(t),ry*Math.sin(t),0]))}out[0]=p1;out[n]=p2;return out};
 if(c.type==='LINE')pts=[p1,p2];
 else if(c.type==='CIRCLE'){const f=frame(c.args[1]),R=c.args[2];pts=arc(f,R,R,p=>{const l=local(f,p);return Math.atan2(l[1],l[0])})}
 else if(c.type==='ELLIPSE'){const f=frame(c.args[1]),A=c.args[2],B=c.args[3];pts=arc(f,A,B,p=>{const l=local(f,p);return Math.atan2(l[1]/B,l[0]/A)})}
 else if(c.type==='B_SPLINE_CURVE_WITH_KNOTS'||c.type==='COMPLEX'){
  const s=bsplineCurve(c),N=400,samples=[];for(let i=0;i<=N;i++){const t=s.t0+(s.t1-s.t0)*i/N;samples.push([t,s.at(t)])}
  const near=p=>{let best=samples[0];for(const q of samples)if(dist(q[1],p)<dist(best[1],p))best=q;let t=best[0],h=(s.t1-s.t0)/N;for(let k=0;k<30;k++){const a=s.at(Math.max(s.t0,t-h)),b=s.at(Math.min(s.t1,t+h));t=dist(a,p)<dist(b,p)?Math.max(s.t0,t-h/2):Math.min(s.t1,t+h/2);h/=2}return t};
  let t1=near(p1),t2=near(p2);if(dist(p1,p2)<1e-6){t1=s.t0;t2=s.t1;if(!same)[t1,t2]=[t2,t1]}
  // adaptive sampling by chord deviation
  const out=[p1];const rec=(ta,tb,pa,pb,d)=>{const tm=(ta+tb)/2,pm=s.at(tm);if(d<12&&(dist(pm,mul(add(pa,pb),.5))>TOL||d<3)){rec(ta,tm,pa,pm,d+1);rec(tm,tb,pm,pb,d+1)}else out.push(pb)};
  rec(t1,t2,p1,p2,0);out[out.length-1]=p2;pts=out}
 else throw new Error('curve '+c.type);
 edgeCache.set(id,pts);return pts}
function loopPoints(loopRef,orient){
 const loop=get(loopRef);if(loop.type==='VERTEX_LOOP')return null;
 const out=[];for(const oe of loop.args[1]){const o=get(oe).args;let p=edgePoints(o[3]);if(o[4].enum==='F')p=[...p].reverse();for(const q of p)if(!out.length||dist(out[out.length-1],q)>1e-7)out.push(q)}
 if(out.length>1&&dist(out[0],out[out.length-1])<1e-7)out.pop();
 return orient?out:out.reverse()}

// ---------- surfaces: eval(u,v), normal(u,v), inverse(p,hint), metric scale ----------
function surfaceOf(r,boundary){
 const s=get(r),t=s.type==='COMPLEX'?(s.parts.B_SPLINE_SURFACE?'BSPLINE':Object.keys(s.parts).join('+')):s.type;
 if(t==='PLANE'){const f=frame(s.args[1]);return {kind:'plane',eval:(u,v)=>world(f,[u,v,0]),normal:()=>f.z,inv:p=>{const l=local(f,p);return [l[0],l[1]]},scale:[1,1],flat:true}}
 if(t==='CYLINDRICAL_SURFACE'){const f=frame(s.args[1]),R=s.args[2];return {kind:'cyl',eval:(u,v)=>world(f,[R*Math.cos(u),R*Math.sin(u),v]),normal:u=>unit(add(mul(f.x,Math.cos(u)),mul(f.y,Math.sin(u)))),inv:(p,h)=>{const l=local(f,p);let u=Math.atan2(l[1],l[0]);if(h)u=wrapNear(u,h[0]);return [u,l[2]]},scale:[R,1],periodic:[true,false]}}
 if(t==='CONICAL_SURFACE'){const f=frame(s.args[1]),R=s.args[2],ang=s.args[3];const r=v=>R+v*Math.tan(ang);return {kind:'cone',eval:(u,v)=>world(f,[r(v)*Math.cos(u),r(v)*Math.sin(u),v]),normal:u=>unit(add(mul(add(mul(f.x,Math.cos(u)),mul(f.y,Math.sin(u))),Math.cos(ang)),mul(f.z,-Math.sin(ang)))),inv:(p,h)=>{const l=local(f,p);let u=Math.atan2(l[1],l[0]);if(h)u=wrapNear(u,h[0]);return [u,l[2]]},scale:[R,1],periodic:[true,false]}}
 if(t==='SPHERICAL_SURFACE'){
  // Put the patch on the equator of its own frame, so a small corner patch never straddles a pole.
  const f0=frame(s.args[1]),R=s.args[2];let c=[0,0,0];for(const p of boundary)c=add(c,unit(sub(p,f0.o)));c=unit(c);
  const z=unit(cross(c,Math.abs(c[2])<.9?[0,0,1]:[1,0,0])),x=c,f={o:f0.o,x,y:cross(z,x),z};
  return {kind:'sph',eval:(u,v)=>world(f,[R*Math.cos(v)*Math.cos(u),R*Math.cos(v)*Math.sin(u),R*Math.sin(v)]),normal:(u,v)=>unit(add(add(mul(f.x,Math.cos(v)*Math.cos(u)),mul(f.y,Math.cos(v)*Math.sin(u))),mul(f.z,Math.sin(v)))),inv:(p,h)=>{const l=local(f,p);let u=Math.atan2(l[1],l[0]);if(h)u=wrapNear(u,h[0]);return [u,Math.asin(Math.max(-1,Math.min(1,l[2]/R)))]},scale:[R,R],periodic:[true,false]}}
 if(t==='TOROIDAL_SURFACE'||t==='DEGENERATE_TOROIDAL_SURFACE'){const f=frame(s.args[1]),A=s.args[2],B=s.args[3];
  return {kind:'tor',eval:(u,v)=>world(f,[(A+B*Math.cos(v))*Math.cos(u),(A+B*Math.cos(v))*Math.sin(u),B*Math.sin(v)]),normal:(u,v)=>unit(add(add(mul(f.x,Math.cos(v)*Math.cos(u)),mul(f.y,Math.cos(v)*Math.sin(u))),mul(f.z,Math.sin(v)))),
   inv:(p,h)=>{const l=local(f,p);let u=Math.atan2(l[1],l[0]);if(h)u=wrapNear(u,h[0]);let v=Math.atan2(l[2],Math.hypot(l[0],l[1])-A);if(h)v=wrapNear(v,h[1]);return [u,v]},scale:[A+B,B],periodic:[true,true]}}
 if(t==='BSPLINE'||t==='B_SPLINE_SURFACE_WITH_KNOTS'){const b=bsplineSurface(s);
  const G=40,grid=[];for(let i=0;i<=G;i++)for(let j=0;j<=G;j++){const u=b.u0+(b.u1-b.u0)*i/G,v=b.v0+(b.v1-b.v0)*j/G;grid.push([u,v,b.at(u,v)])}
  const hu=(b.u1-b.u0)*1e-5,hv=(b.v1-b.v0)*1e-5;
  const du=(u,v)=>mul(sub(b.at(Math.min(b.u1,u+hu),v),b.at(Math.max(b.u0,u-hu),v)),1/(2*hu)),dv=(u,v)=>mul(sub(b.at(u,Math.min(b.v1,v+hv)),b.at(u,Math.max(b.v0,v-hv))),1/(2*hv));
  const inv=(p,h)=>{let best=null;for(const g of grid){const d=dist(g[2],p);if(!best||d<best[0])best=[d,g[0],g[1]]}let u=best[1],v=best[2];
   for(let k=0;k<40;k++){const r=sub(b.at(u,v),p),a=du(u,v),c=dv(u,v),aa=dot(a,a),ac=dot(a,c),cc=dot(c,c),ra=dot(r,a),rc=dot(r,c),det=aa*cc-ac*ac;if(Math.abs(det)<1e-18)break;const su=(cc*ra-ac*rc)/det,sv=(aa*rc-ac*ra)/det;u=Math.min(b.u1,Math.max(b.u0,u-su));v=Math.min(b.v1,Math.max(b.v0,v-sv));if(Math.abs(su)<1e-12&&Math.abs(sv)<1e-12)break}return [u,v]};
  let su=0,sv=0;for(let k=0;k<5;k++){const u=b.u0+(b.u1-b.u0)*(k+.5)/5,v=b.v0+(b.v1-b.v0)*(k+.5)/5;su+=len(du(u,v))/5;sv+=len(dv(u,v))/5}
  return {kind:'bsp',eval:b.at,normal:(u,v)=>unit(cross(du(u,v),dv(u,v))),inv,scale:[su,sv]}}
 throw new Error('surface '+t)}

// ---------- faces ----------
function tessellateFace(faceId){
 const a=get(faceId).args,sense=a[3].enum==='T';
 const loops=[];for(const b of a[1]){const B=get(b);const pts=loopPoints(B.args[1],B.args[2].enum==='T');if(pts&&pts.length>=3)loops.push({pts,outer:B.type==='FACE_OUTER_BOUND'})}
 if(!loops.length)return null;
 const surf=surfaceOf(a[2],loops.flatMap(l=>l.pts));
 for(const l of loops){let h=null;l.uv=l.pts.map(p=>{const q=surf.inv(p,h);h=q;return q})}
 // close periodic loops consistently: shift holes into the outer loop's range
 const area=uv=>uv.reduce((s,p,i)=>{const q=uv[(i+1)%uv.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2;
 let outer=loops.find(l=>l.outer)||loops.reduce((m,l)=>Math.abs(area(l.uv))>Math.abs(area(m.uv))?l:m);
 if(surf.periodic){const mid=k=>outer.uv.reduce((s,p)=>s+p[k],0)/outer.uv.length;for(const l of loops)if(l!==outer)for(const k of [0,1])if(surf.periodic[k]){const m=l.uv.reduce((s,p)=>s+p[k],0)/l.uv.length,shift=Math.round((mid(k)-m)/(2*Math.PI))*2*Math.PI;if(shift)l.uv=l.uv.map(p=>{const q=[...p];q[k]+=shift;return q})}}
 const holes=loops.filter(l=>l!==outer);
 const S=surf.scale,toV=p=>new Vector2(p[0]*S[0],p[1]*S[1]);
 const tris=ShapeUtils.triangulateShape(outer.uv.map(toV),holes.map(h=>h.uv.map(toV)));
 const uv=[outer,...holes].flatMap(l=>l.uv),pos=[outer,...holes].flatMap(l=>l.pts);
 const boundary=new Set();let base=0;for(const l of [outer,...holes]){const n=l.uv.length;for(let i=0;i<n;i++){const x=base+i,y=base+(i+1)%n;boundary.add(x<y?x+'_'+y:y+'_'+x)}base+=n}
 let T=tris.map(t=>[...t]);
 if(process.env.DIAG){const A=uv=>Math.abs(uv.reduce((s,p,i)=>{const q=uv[(i+1)%uv.length];return s+p[0]*S[0]*q[1]*S[1]-q[0]*S[0]*p[1]*S[1]},0)/2);const want=A(outer.uv)-holes.reduce((s,h)=>s+A(h.uv),0);let got=0;for(const [p,q,r] of T){const a=uv[p],b=uv[q],c=uv[r];got+=Math.abs(((b[0]-a[0])*S[0]*(c[1]-a[1])*S[1]-(c[0]-a[0])*S[0]*(b[1]-a[1])*S[1])/2)}if(Math.abs(got-want)>Math.max(.01,want*.01))console.log('  face',faceId,surf.kind,'loops',loops.length,'pts',loops.map(l=>l.pts.length).join('/'),'area',want.toFixed(3),'tri',got.toFixed(3),'tris',T.length)}
 // refine curved faces: split interior edges whose midpoint leaves the chord by more than TOL
 if(!surf.flat){for(let pass=0;pass<14;pass++){
  const mids=new Map();const want=(x,y)=>{const k=x<y?x+'_'+y:y+'_'+x;if(boundary.has(k))return -1;if(mids.has(k))return mids.get(k);
   const m=[(uv[x][0]+uv[y][0])/2,(uv[x][1]+uv[y][1])/2],P=surf.eval(m[0],m[1]),C=mul(add(pos[x],pos[y]),.5);
   if(dist(P,C)>TOL||dist(pos[x],pos[y])>40){uv.push(m);pos.push(P);mids.set(k,uv.length-1);return uv.length-1}mids.set(k,-1);return -1};
  const next=[];let split=0;
  for(const [p,q,r] of T){const a=want(p,q),b=want(q,r),c=want(r,p),n=(a>=0)+(b>=0)+(c>=0);split+=n;
   if(!n)next.push([p,q,r]);
   else if(n===3)next.push([p,a,c],[a,q,b],[c,b,r],[a,b,c]);
   else if(n===1){if(a>=0)next.push([p,a,r],[a,q,r]);else if(b>=0)next.push([p,q,b],[p,b,r]);else next.push([p,q,c],[c,q,r])}
   else{if(c<0)next.push([p,a,b],[a,q,b],[p,b,r]);else if(a<0)next.push([p,q,b],[p,b,c],[c,b,r]);else next.push([p,a,c],[a,q,r],[a,r,c])}}
  T=next;if(!split)break}}
 if(process.env.DIAG3){const c=new Map();for(const t of T)for(let k=0;k<3;k++){const x=t[k],y=t[(k+1)%3],kk=x<y?x+'_'+y:y+'_'+x;c.set(kk,(c.get(k)||0)+(c.get(kk)||0)+1)}let bad1=0,bad2=0,dup=0;for(const [k,n] of c){if(boundary.has(k)){if(n!==1)bad1++}else if(n!==2)bad2++}const seen=new Set();for(const p of pos){const q=p.map(v=>v.toFixed(4)).join();if(seen.has(q))dup++;seen.add(q)}const missingB=[...boundary].filter(k=>!c.has(k)).length;if(bad1||bad2||missingB||dup)console.log('  F',faceId,surf.kind,'boundaryBad',bad1,'interiorBad',bad2,'boundaryMissing',missingB,'dupPts',dup,'loops',loops.map(l=>l.pts.length).join('/'))}
 const nrm=uv.map(([u,v])=>mul(surf.normal(u,v),sense?1:-1));
 // wind every triangle to face along the surface normal (times the face sense)
 for(const t of T){const g=cross(sub(pos[t[1]],pos[t[0]]),sub(pos[t[2]],pos[t[0]]));const n=add(add(nrm[t[0]],nrm[t[1]]),nrm[t[2]]);if(dot(g,n)<0)[t[1],t[2]]=[t[2],t[1]]}
 return {pos,nrm,tris:T,kind:surf.kind,info:{kind:surf.kind,normal:surf.flat?mul(surf.normal(),sense?1:-1):null,loops:surf.flat?loops.map(l=>l.pts.map(p=>p.map(v=>+v.toFixed(3)))):null}}}

// ---------- solids, colours ----------
const colourOf=new Map();
const firstColour=(r,seen=new Set())=>{const id=r.ref??r;if(seen.has(id))return null;seen.add(id);const e=get(id);if(e.type==='COLOUR_RGB')return e.args.slice(1);const walk=v=>{if(!v)return null;if(v.ref)return firstColour(v,seen);if(Array.isArray(v)){for(const x of v){const c=walk(x);if(c)return c}}else if(v.args)return walk(v.args);return null};return walk(e.args||e.parts)};
for(const [id,s] of E)if(/^STYLED_ITEM|^OVER_RIDING_STYLED_ITEM/.test(s)){const e=get(id),c=firstColour({ref:e.args[1][0].ref});if(c)colourOf.set(e.args[2].ref,c)}
const decode=s=>s.replace(/\\X2\\([0-9A-F]+)\\X0\\/g,(_,h)=>h.match(/.{4}/g).map(c=>String.fromCharCode(parseInt(c,16))).join(''));
const parts=[];
for(const [id,s] of E){if(!/^MANIFOLD_SOLID_BREP/.test(s))continue;const e=get(id),name=decode(e.args[0]),shell=get(e.args[1]);
 const P=[],N=[],I=[],stats={};let failed=0;
 for(const f of shell.args[1]){let r;try{r=tessellateFace(f.ref)}catch(err){failed++;console.error('face',f.ref,err.message);continue}if(!r)continue;stats[r.kind]=(stats[r.kind]||0)+1;
  (globalThis.FI??=[]).push(r.info);const o=P.length/3;(globalThis.FK??=[]).push([I.length/3,f.ref,r.kind]);for(const p of r.pos)P.push(...p);for(const n of r.nrm)N.push(...n);for(const t of r.tris)I.push(t[0]+o,t[1]+o,t[2]+o);
  const fc=colourOf.get(f.ref);if(fc)(stats.faceColours??=new Set()).add(fc.map(c=>c.toFixed(2)).join(','))}
 // watertightness: weld by position and count edges not shared by exactly two triangles
 const key=i=>P.slice(i*3,i*3+3).map(v=>v.toFixed(3)).join(','),cnt=new Map();
 for(let t=0;t<I.length;t+=3)for(let k=0;k<3;k++){const a=key(I[t+k]),b=key(I[t+(k+1)%3]);if(a===b)continue;const kk=a<b?a+'|'+b:b+'|'+a;cnt.set(kk,(cnt.get(kk)||0)+1)}
 const open=[...cnt.values()].filter(n=>n===1).length,over=[...cnt.values()].filter(n=>n>2).length;
 if(process.env.DIAG2&&open){const owner=t=>{let k=null;for(const x of globalThis.FK)if(x[0]<=t)k=x;return k};const byFace=new Map();for(let t=0;t<I.length;t+=3)for(let k=0;k<3;k++){const a=key(I[t+k]),b=key(I[t+(k+1)%3]);if(a===b)continue;const kk=a<b?a+'|'+b:b+'|'+a;if(cnt.get(kk)!==2){const f=owner(t/3);const fk=f[1]+':'+f[2];byFace.set(fk,(byFace.get(fk)||0)+1)}}console.log('   open by face',[...byFace].map(([k,v])=>k+'='+v).join(' '))}
 globalThis.FK=[];
 const lo=[0,1,2].map(k=>Math.min(...P.filter((_,i)=>i%3===k))),hi=[0,1,2].map(k=>Math.max(...P.filter((_,i)=>i%3===k)));
 const colour=colourOf.get(id)||null;
 console.log(`#${id} "${name}" colour ${colour?.map(c=>c.toFixed(2))} tris ${I.length/3} faces ${JSON.stringify(Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,v instanceof Set?[...v]:v])))} failed ${failed} holeEdges ${open} sharedBy3+ ${over}\n   min ${lo.map(v=>v.toFixed(2))} max ${hi.map(v=>v.toFixed(2))} size ${hi.map((v,k)=>(v-lo[k]).toFixed(2)).join(' × ')}`);
 const faceColour=stats.faceColours?[...stats.faceColours][0].split(",").map(Number):null;const faces=globalThis.FI;globalThis.FI=[];parts.push({id,name,colour,faceColour,faces,positions:P,normals:N,indices:I,bbox:[lo,hi]})}
fs.writeFileSync(output,JSON.stringify({source:input.split(/[\\/]/).pop(),unit:'mm',parts}));
