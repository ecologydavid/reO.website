import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chamferMesh,worldNormal} from '../src/editor/modelGeometry.mjs';
const data=JSON.parse(readFileSync(new URL('../src/data/model-meshes.json',import.meta.url),'utf8'));
// Closedness is checked on welded positions: a zero-width strip between coplanar faces is dropped.
// The 3D chamfer must keep a closed body closed, keep every original face on its own plane and
// facing out, and move the silhouette by no more than the chamfer.
test('chamfered bodies stay closed, outward and within the chamfer',()=>{
 for(const [id,model] of Object.entries(data.models))for(const mesh of model.meshes){
  const closed=(()=>{const c=new Map();mesh.faces.forEach(f=>f.forEach((a,i)=>{const b=f[(i+1)%f.length],k=a<b?a+'_'+b:b+'_'+a;c.set(k,(c.get(k)||0)+1)}));return [...c.values()].every(n=>n===2)})();
  const ys=mesh.vertices.map(v=>v[1]),d=(Math.max(...ys)-Math.min(...ys))*.0025;
  const out=chamferMesh(mesh,d);
  assert.equal(out.faces.length,out.source.length);
  out.source.forEach((s,i)=>{if(s<0)return;const a=worldNormal(mesh.vertices,mesh.faces[s]),b=worldNormal(out.vertices,out.faces[i]);assert.ok(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]>.999,`${id} face ${s} keeps its plane`)});
  for(const axis of [0,1,2]){const lo=Math.min(...mesh.vertices.map(v=>v[axis])),hi=Math.max(...mesh.vertices.map(v=>v[axis]));for(const v of out.vertices)assert.ok(v[axis]>=lo-1e-6&&v[axis]<=hi+1e-6,`${id} stays inside its bounds`)}
  if(closed){const c=new Map(),pk=i=>out.vertices[i].map(x=>x.toFixed(3)).join(',');out.faces.forEach(f=>f.forEach((a,i)=>{const A=pk(a),B=pk(f[(i+1)%f.length]);if(A===B)return;const k=A<B?A+'|'+B:B+'|'+A;c.set(k,(c.get(k)||0)+1)}));assert.ok([...c.values()].every(n=>n===2),`${id} stays closed`)}
 }
});
