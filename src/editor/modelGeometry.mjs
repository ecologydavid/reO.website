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
