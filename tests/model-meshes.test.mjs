import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {triangulateFace,worldNormal,pointOnSurface} from '../src/editor/modelGeometry.mjs';
const data=JSON.parse(readFileSync(new URL('../src/data/model-meshes.json',import.meta.url),'utf8'));
function edges(faces){const counts=new Map();for(const f of faces)for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length],key=[Math.min(a,b),Math.max(a,b)].join(':');counts.set(key,(counts.get(key)||0)+1)}return [...counts.values()]}
test('photo-audited A/D triangular cuts are real closed solids',()=>{for(const id of ['A','D']){const m=data.models[id].meshes[0];assert(m.face_groups.includes('triangular-corner-cut'));const f=m.faces[m.face_groups.indexOf('triangular-corner-cut')];assert.equal(f.length,3);assert(new Set(f.map(i=>m.vertices[i][2])).size>1);assert(edges(m.faces).every(n=>n===2));}});
test('triangulation keeps every audited solid closed including concave faces',()=>{for(const [id,model] of Object.entries(data.models))for(const m of model.meshes){if(m.thickness)continue;const triangles=m.faces.flatMap(f=>triangulateFace(m.vertices,f));assert(triangles.length>0,id);assert(triangles.every(t=>t.length===3&&worldNormal(m.vertices,t).every(Number.isFinite)),id);assert(edges(triangles).every(n=>n===2),id+' triangle boundary');}});
test('C stone base has24 physical-depth facets and descends toward right',()=>{const c=data.models.C.meshes[1];assert.equal(c.front_triangle_face_count,24);assert(c.vertices[0][1]<c.vertices[6][1]);assert(new Set(c.vertices.slice(0,21).map(v=>v[2])).size>=4);});
// Since 2026-11-07 B's plate comes from the owner's CAD (公版B.step): 110 × 70 mm, flush with the board's
// left edge, entirely above the stone (the old hand placement override is gone).
test('B plate follows the CAD and clears the stone',()=>{const canon=JSON.parse(readFileSync(new URL('../src/data/canonical-models.json',import.meta.url),'utf8')).models.B,cad=JSON.parse(readFileSync(new URL('../src/data/cad-models.json',import.meta.url),'utf8')).models.B;
 const s=canon.surfaces.find(s=>s.id==='main');assert.deepEqual(data.models.B.placement,{});assert(Math.abs(s.displayWidth/s.displayHeight-110/70)<.01);assert.equal(s.x,0);
 const buf=readFileSync(new URL('../public/assets/models/cad-B.bin',import.meta.url)),pos=new Float32Array(buf.buffer.slice(buf.byteOffset,buf.byteOffset+cad.vertexCount*12)),stone=cad.parts.find(p=>p.role==='stone');
 let top=1e9;for(let i=stone.vertexStart;i<stone.vertexStart+stone.vertexCount;i++)if(pos[i*3]<=s.x+s.displayWidth)top=Math.min(top,pos[i*3+1]);assert(s.y+s.displayHeight<top,"plate bottom above stone top "+(s.y+s.displayHeight)+" "+top);});
// Since 2026-11-06 E's planes come from the owner's CAD: the rear panel is a vertical sheet, the front
// flap leans toward the viewer (about 7°). Content keeps each plane's affine mapping.
test('E content planes follow the CAD: vertical rear panel, tilted front flap',()=>{const e=data.models.E;for(const s of Object.values(e.surfaces)){const a=pointOnSurface({plane:s},0,0),b=pointOnSurface({plane:s},1,1);assert.equal(a[0],s.plane_origin[0]);assert(Math.abs(b[0]-a[0]-s.basis_u[0])<1e-7);assert(Math.abs(b[1]-a[1]-s.basis_v[1])<1e-7)}
 assert(Math.abs(e.surfaces.back.basis_v[2])<1e-6&&Math.abs(e.surfaces.back.basis_u[2])<1e-6);const lean=Math.atan2(e.surfaces.front.basis_v[2],e.surfaces.front.basis_v[1])*180/Math.PI;assert(lean>5&&lean<9,'front flap lean '+lean);});
// The CAD meshes (public/assets/models) match their index: sizes, part ranges, and a plate under every content plane.
test('CAD meshes for A–E are complete and carry the content planes',()=>{const cad=JSON.parse(readFileSync(new URL('../src/data/cad-models.json',import.meta.url),'utf8')).models;
 for(const [id,m] of Object.entries(cad)){const buf=readFileSync(new URL(`../public/assets/models/cad-${id}.bin`,import.meta.url)),v=m.vertexCount;assert.equal(buf.length,v*12+v*3+(4-(v*3)%4)%4+m.indexCount*4,id+' size');
  const idx=new Uint32Array(buf.buffer.slice(buf.byteOffset+buf.length-m.indexCount*4));assert(idx.every(i=>i<v),id+' indices');assert.deepEqual(m.parts.map(p=>p.role).sort(),'ABC'.includes(id)?['metal','stone','wood']:['metal','stone'],id+' parts');
  let covered=0;for(const p of m.parts){assert.equal(p.vertexStart,covered);covered+=p.vertexCount}assert.equal(covered,v);
  const pos=new Float32Array(buf.buffer.slice(buf.byteOffset,buf.byteOffset+v*12));for(const s of Object.values(data.models[id].surfaces)){const c=pointOnSurface({plane:s},.5,.5);let best=1e9;for(let i=0;i<v;i++)best=Math.min(best,Math.hypot(pos[i*3]-c[0],pos[i*3+1]-c[1],pos[i*3+2]-c[2]));assert(best<Math.max(m.width,m.height)*.5,id+' plane near mesh')}}});
