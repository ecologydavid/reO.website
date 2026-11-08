// node applycad.mjs A B C — copy the CAD-derived plate outlines and planes from src/data/cad-models.json
// into the canonical data the editor, front view, 3D and PDF share:
//  canonical-models.json  model height; each surface's position, display size, local height and outline
//  model-meshes.json      each surface's plane (origin + basis with depth); placement overrides removed
// (D and E were applied the same way on 2026-11-06; their D main outline was squared to the plate corners.)
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const ROOT=fileURLToPath(new URL('../../',import.meta.url)).replaceAll('\\','/');
const ids=process.argv.slice(2);
const cad=JSON.parse(fs.readFileSync(ROOT+'src/data/cad-models.json','utf8')).models;
const canonPath=ROOT+'src/data/canonical-models.json',meshPath=ROOT+'src/data/model-meshes.json';
const canon=JSON.parse(fs.readFileSync(canonPath,'utf8')),mesh=JSON.parse(fs.readFileSync(meshPath,'utf8'));
const r3=v=>+v.toFixed(3),r6=v=>+v.toFixed(6);
const file={A:'公版A.step',B:'公版B.step',C:'公版C.step',D:'公版D款.step',E:'公版E.step'};
for(const id of ids){
 const c=cad[id],m=canon.models[id];m.height=c.height;
 mesh.models[id].placement={};
 for(const [sid,o] of Object.entries(c.canon)){
  const s=m.surfaces.find(s=>s.id===sid);const x=Math.max(0,o.x);
  Object.assign(s,{x:r3(x),y:r3(o.y),displayWidth:r3(o.displayWidth),displayHeight:r3(o.displayHeight),height:r3(1000*o.displayHeight/o.displayWidth),polygon:o.polygon,source:`CAD (${file[id]})`});
  const p=c.surfaces[sid],a=p.basis_u[2]/p.basis_u[0],b=p.basis_v[2]/p.basis_v[1],z0=p.plane_origin[2]-a*p.plane_origin[0]-b*p.plane_origin[1];
  mesh.models[id].surfaces[sid]={plane_origin:[s.x,s.y,r3(z0+a*s.x+b*s.y)],basis_u:[s.displayWidth,0,r6(a*s.displayWidth)],basis_v:[0,s.displayHeight,r6(b*s.displayHeight)],note:`CAD ${s.material==='metal'?'plate':'wood'} front face (${file[id]}).`};
  console.log(id,sid,JSON.stringify(s),'\n  plane',JSON.stringify(mesh.models[id].surfaces[sid]));
 }
}
fs.writeFileSync(canonPath,JSON.stringify(canon)+'\n');fs.writeFileSync(meshPath,JSON.stringify(mesh)+'\n');
