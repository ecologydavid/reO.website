export function polygonPrism(polygon,front=0,depth=12,material='stone'){
 const area=polygon.reduce((a,p,i)=>a+p[0]*polygon[(i+1)%polygon.length][1]-polygon[(i+1)%polygon.length][0]*p[1],0);if(area<0)polygon=[...polygon].reverse();
 const z=typeof front==='function'?front:()=>front,n=polygon.length;
 const vertices=[...polygon.map(([x,y])=>[x,y,z(x,y)]),...polygon.map(([x,y])=>[x,y,z(x,y)-depth])];
 return {vertices,faces:[Array.from({length:n},(_,i)=>n-1-i),Array.from({length:n},(_,i)=>n+i),...polygon.map((_,i)=>[i,(i+1)%n,(i+1)%n+n,i+n])],material};
}
export function worldNormal(vertices,face){
 let nx=0,ny=0,nz=0;
 for(let i=0;i<face.length;i++){const a=vertices[face[i]],b=vertices[face[(i+1)%face.length]],ay=-a[1],by=-b[1];nx+=(ay-by)*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(ay+by)}
 const len=Math.hypot(nx,ny,nz)||1;return [nx/len,ny/len,nz/len];
}
export function triangulateFace(vertices,face){
 if(face.length===3)return [face];
 const normal=worldNormal(vertices,face),drop=normal.map(Math.abs).indexOf(Math.max(...normal.map(Math.abs))),axes=[0,1,2].filter(i=>i!==drop);
 const points=face.map(i=>[vertices[i][axes[0]],vertices[i][axes[1]]]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const area=points.reduce((a,p,i)=>a+p[0]*points[(i+1)%points.length][1]-points[(i+1)%points.length][0]*p[1],0),sign=area>=0?1:-1;
 const remaining=face.map((_,i)=>i),triangles=[];let guard=face.length*face.length;
 while(remaining.length>3&&guard-->0){let cut=false;for(let i=0;i<remaining.length;i++){
   const a=remaining[(i+remaining.length-1)%remaining.length],b=remaining[i],c=remaining[(i+1)%remaining.length];
   if(sign*cross(points[a],points[b],points[c])<1e-8)continue;
   if(remaining.some(p=>![a,b,c].includes(p)&&sign*cross(points[a],points[b],points[p])>1e-8&&sign*cross(points[b],points[c],points[p])>1e-8&&sign*cross(points[c],points[a],points[p])>1e-8))continue;
   triangles.push([face[a],face[b],face[c]]);remaining.splice(i,1);cut=true;break;
  }if(!cut)break;
 }
 for(let i=1;i<remaining.length-1;i++)triangles.push([face[remaining[0]],face[remaining[i]],face[remaining[i+1]]]);
 return triangles;
}
export function pointOnSurface(surface,u,v){const p=surface.plane;return p?p.plane_origin.map((x,i)=>x+p.basis_u[i]*u+p.basis_v[i]*v):[surface.x+surface.displayWidth*u,surface.y+surface.displayHeight*v,surface.z];}
export function meshFrontFaces(meshes){return meshes.flatMap(mesh=>mesh.faces.map((face,i)=>({points:face.map(n=>mesh.vertices[n]),normal:worldNormal(mesh.vertices,face),material:mesh.material,group:mesh.face_groups?.[i],z:face.reduce((sum,n)=>sum+mesh.vertices[n][2],0)/face.length}))).filter(f=>f.normal[2]>.001).sort((a,b)=>a.z-b.z)}
// A small chamfer on every real edge, so the 3D body catches a line of light along its edges the way
// a sanded stone or wood piece does. The silhouette moves in by `d` (under 1 mm); faces keep their
// planes, so plates and canonical surfaces stay where they are. Edges between near-coplanar faces and
// open boundaries are left sharp. Works in world orientation [x,-y,z]; returns raw coordinates and,
// per face, the source face index (or -1 for a bevel strip or corner).
export function chamferMesh(mesh,d,minAngle=12){
 const P=mesh.vertices.map(([x,y,z])=>[x,-y,z]),faces=mesh.faces;
 const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1));
 const newell=pts=>{let n=[0,0,0];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];n=add(n,[(a[1]-b[1])*(a[2]+b[2]),(a[2]-b[2])*(a[0]+b[0]),(a[0]-b[0])*(a[1]+b[1])])}return n};
 const normals=faces.map(f=>unit(newell(f.map(i=>P[i]))));
 const edges=new Map(),key=(a,b)=>a<b?a+'_'+b:b+'_'+a;
 faces.forEach((f,fi)=>f.forEach((a,i)=>{const k=key(a,f[(i+1)%f.length]);if(!edges.has(k))edges.set(k,[]);edges.get(k).push(fi)}));
 const cos=Math.cos(minAngle*Math.PI/180);
 const offset=(a,b)=>{const list=edges.get(key(a,b));return list.length===2&&dot(normals[list[0]],normals[list[1]])<cos?d:0};
 const vertices=[],corner=faces.map(()=>[]),out=[],source=[];
 faces.forEach((f,fi)=>{
  const n=normals[fi],c=mul(f.reduce((s,i)=>add(s,P[i]),[0,0,0]),1/f.length);
  const inward=(a,b)=>{let m=unit(cross(n,sub(P[b],P[a])));if(dot(m,sub(c,P[a]))<0)m=mul(m,-1);return m};
  f.forEach((v,i)=>{
   const prev=f[(i+f.length-1)%f.length],next=f[(i+1)%f.length],m1=inward(prev,v),m2=inward(v,next),d1=offset(prev,v),d2=offset(v,next);
   const k=dot(m1,m2),den=1-k*k;let x=den<1e-6?mul(m1,d1):add(mul(m1,(d1-k*d2)/den),mul(m2,(d2-k*d1)/den));
   const len=Math.hypot(...x);if(len>d*4)x=mul(x,d*4/len);
   corner[fi][i]=vertices.length;vertices.push(add(P[v],x));
  });
  out.push(f.map((_,i)=>corner[fi][i]));source.push(fi);
 });
 const at=(fi,v)=>corner[fi][faces[fi].indexOf(v)];
 const area=poly=>Math.hypot(...newell(poly.map(i=>vertices[i])));
 const outward=(poly,dir)=>dot(newell(poly.map(i=>vertices[i])),dir)<0?[...poly].reverse():poly;
 for(const [k,list] of edges){
  if(list.length!==2)continue;const [a,b]=k.split('_').map(Number),[F,G]=list;
  const quad=[at(F,a),at(G,a),at(G,b),at(F,b)];
  if(area(quad)>d*d*1e-3){out.push(outward(quad,add(normals[F],normals[G])));source.push(-1)}
 }
 P.forEach((p,v)=>{
  const around=faces.map((f,fi)=>f.includes(v)?fi:-1).filter(fi=>fi>=0);if(around.length<3)return;
  const dir=unit(around.reduce((s,fi)=>add(s,normals[fi]),[0,0,0])),u=unit(cross(dir,Math.abs(dir[0])<.9?[1,0,0]:[0,1,0])),w=cross(dir,u);
  const pts=around.map(fi=>at(fi,v)).filter((i,j,all)=>all.findIndex(o=>Math.hypot(...sub(vertices[o],vertices[i]))<1e-6)===j);
  if(pts.length<3)return;
  pts.sort((i,j)=>{const a=sub(vertices[i],p),b=sub(vertices[j],p);return Math.atan2(dot(a,w),dot(a,u))-Math.atan2(dot(b,w),dot(b,u))});
  if(area(pts)>d*d*1e-3){out.push(outward(pts,dir));source.push(-1)}
 });
 // A closed body must stay closed; where it would not (a finely triangulated wave), keep it sharp.
 const sealed=list=>{const c=new Map(),pk=i=>list.v[i].map(x=>x.toFixed(3)).join(',');list.f.forEach(f=>f.forEach((a,i)=>{const A=pk(a),B=pk(f[(i+1)%f.length]);if(A===B)return;const k=A<B?A+'|'+B:B+'|'+A;c.set(k,(c.get(k)||0)+1)}));return [...c.values()].every(n=>n===2)};
 if(sealed({v:P,f:faces})&&!sealed({v:vertices,f:out}))return {vertices:mesh.vertices,faces,source:faces.map((_,i)=>i),material:mesh.material};
 return {vertices:vertices.map(([x,y,z])=>[x,-y,z]),faces:out,source,material:mesh.material};
}
