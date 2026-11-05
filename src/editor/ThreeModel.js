import * as THREE from 'three';
import {materialTexture,renderCanonicalSurface,fDecoration,makeCanvas} from './canonicalRender.js';
import {ensureMaterialMaps} from './materialMaps.js';
import {triangulateFace,worldNormal,pointOnSurface,polygonPrism,chamferMesh} from './modelGeometry.mjs';
// The 3D reconstruction. V5 (2026-11-06) aims at the look of the real piece without touching its
// canonical shape: physically based materials lit by a studio environment (set in ThreePreview), a
// sub-millimetre chamfer on every edge so it catches light, and plates whose ink is matte while the
// bare plate stays metal. The body is built once per model and finish; edits only repaint the plate
// textures (group.userData.paint), so typing and dragging never rebuild the model.
export function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const k of ['map','bumpMap','roughnessMap','metalnessMap'])m[k]?.dispose();m.dispose()}})}
function texture(canvas,color=true){const t=new THREE.CanvasTexture(canvas);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=8;return t}
// Surface finish per material. Recycled marble is sanded and sealed (a soft sheen, a faint coat);
// wood is oiled; plates are brushed metal (E satin); acrylic is clear and glossy.
const finish={
 stone:{roughness:.52,clearcoat:.12,clearcoatRoughness:.5,bumpScale:.35},
 wood:{roughness:.66,clearcoat:.06,clearcoatRoughness:.6,bumpScale:.8},
 metal:{metalness:1,roughness:.34},
 metalSatin:{metalness:1,roughness:.48}
};
export async function buildModel(scene){
 await ensureMaterialMaps();const group=new THREE.Group(),unit=3/scene.height,bevel=scene.height*.0025;
 const world=([x,y,z])=>[(x-scene.width/2)*unit,(scene.height/2-y)*unit,z*unit];
 const metalFinish=scene.id==='E'?finish.metalSatin:finish.metal;
 const material=(kind,endgrain=false)=>{
  const map=texture(materialTexture(kind,scene.fills[kind],{modelId:scene.id,finish:scene.finish,endgrain}));
  if(kind==='metal')return new THREE.MeshPhysicalMaterial({map,...metalFinish,side:THREE.DoubleSide});
  if(kind==='acrylic')return new THREE.MeshPhysicalMaterial({color:'#f2f6f4',transparent:true,opacity:.1,roughness:.08,clearcoat:.5,clearcoatRoughness:.1,metalness:0,side:THREE.DoubleSide,depthWrite:false});
  const f=finish[kind]||finish.stone;
  return new THREE.MeshPhysicalMaterial({map,bumpMap:map,bumpScale:f.bumpScale,roughness:f.roughness,clearcoat:f.clearcoat,clearcoatRoughness:f.clearcoatRoughness,metalness:0,side:THREE.DoubleSide,polygonOffset:kind==='stone',polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 };
 const addMesh=(data,customMaterial=null,uvLocal=null)=>{
  const positions=[],uvs=[],triangles=data.faces.flatMap(face=>triangulateFace(data.vertices,face));
  const same=scene.meshes?.filter(m=>m.material===data.material).flatMap(m=>m.vertices),all=same?.length?same:data.vertices,ys=all.map(p=>p[1]),top=Math.min(...ys),height=Math.max(...ys)-top||scene.height;
  for(const face of triangles){const normal=worldNormal(data.vertices,face);for(const index of face){const v=data.vertices[index];positions.push(...world(v));if(uvLocal)uvs.push(...uvLocal[index]);else if(Math.abs(normal[0])>.85)uvs.push((v[2]+scene.width)/scene.width,1-(v[1]-top)/height);else if(Math.abs(normal[1])>.85)uvs.push(v[0]/scene.width,(v[2]+scene.width)/scene.width);else uvs.push(v[0]/scene.width,1-(v[1]-top)/height)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,customMaterial||material(data.material));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
 };
 // A chamfered body; `special` keeps one source face (by index) apart, e.g. A's end-grain corner cut.
 const addBody=(data,d,special=null)=>{
  const c=chamferMesh(data,d),main=[],apart=[];
  c.faces.forEach((f,i)=>(special&&c.source[i]===special.index?apart:main).push(f));
  addMesh({vertices:c.vertices,faces:main,material:data.material});
  if(apart.length)addMesh({vertices:c.vertices,faces:apart,material:data.material},special.material);
 };
 if(scene.id==='F'){
  const disc=new THREE.Shape();disc.absarc(0,0,(500-6)*unit,0,Math.PI*2,false);
  // Extruded shapes carry UVs in world units; map the disc's face onto the texture once, edge to edge.
  const discGeometry=new THREE.ExtrudeGeometry(disc,{depth:(85-12)*unit,bevelEnabled:true,bevelSize:6*unit,bevelThickness:6*unit,bevelSegments:3,curveSegments:120}),p=discGeometry.attributes.position,uv=discGeometry.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/(1000*unit)+.5,p.getY(i)/(1000*unit)+.5);uv.needsUpdate=true;
  const stone=new THREE.Mesh(discGeometry,material('stone'));stone.position.z=-(45+42.5-6)*unit;stone.castShadow=true;stone.receiveShadow=true;group.add(stone);
  const ring=new THREE.Shape();ring.absarc(0,0,480*unit,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,418*unit,0,Math.PI*2,true);ring.holes.push(hole);
  const rm=new THREE.Mesh(new THREE.ExtrudeGeometry(ring,{depth:35*unit,bevelEnabled:true,bevelSize:2*unit,bevelThickness:2*unit,bevelSegments:2,curveSegments:scene.shape==='diamond'?20:72}),material('metal'));rm.position.z=30*unit;rm.castShadow=true;group.add(rm);
  addMesh(polygonPrism([[420,-110],[580,-110],[580,32],[420,32]],65,5,'metal'),new THREE.MeshPhysicalMaterial({color:'#c2a05d',metalness:.85,roughness:.42}));
 }else for(const data of scene.meshes){
  const cut=scene.id==='A'?data.face_groups?.indexOf('triangular-corner-cut'):-1;
  addBody(data,bevel,cut>=0?{index:cut,material:material(data.material,true)}:null);
 }
 // Plates: a metal or acrylic plate body, then the content layer on the same affine surface.
 const plates=[];
 for(const s of scene.surfaces){
  const polygon=s.polygon,points=polygon.map(([u,v])=>pointOnSurface(s,u,v));
  const normal=new THREE.Vector3(...worldNormal(points,points.map((_,i)=>i)));
  if(normal.z<0)normal.negate();
  const rawNormal=[normal.x,-normal.y,normal.z],metal=s.material==='metal';
  if(metal||s.material==='acrylic'){
   const depth=metal?(scene.id==='E'?12:8):10;
   const n=points.length,vertices=[...points,...points.map(v=>v.map((x,i)=>x-rawNormal[i]*depth))];
   const winding=worldNormal(vertices,Array.from({length:n},(_,i)=>i))[2]>0?Array.from({length:n},(_,i)=>i):Array.from({length:n},(_,i)=>n-i-1);
   const faces=[winding,[...winding].reverse().map(i=>i+n),...polygon.map((_,i)=>[i,(i+1)%n,(i+1)%n+n,i+n])];
   if(metal)addBody({vertices,faces,material:'metal'},Math.min(depth*.3,bevel*.35));else addMesh({vertices,faces,material:s.material},material('acrylic'));
  }
  // The content layer: on metal, the plate's own face in that metal with the ink on it; elsewhere the
  // ink alone over stone or wood. Drawn at up to twice the canonical size for sharp type in close-ups.
  // The ink is matte (it is printed), so on a metal plate the bare metal shines and the text does not:
  // a second, ink-only layer sits a hair above the metal face.
  const k=Math.max(1,Math.min(2,2048/Math.max(s.width,s.height))),layer=(lift,mat)=>{
   const corners=[[0,0],[1,0],[1,1],[0,1]],vertices=corners.map(([u,v])=>pointOnSurface(s,u,v).map((x,i)=>x+rawNormal[i]*lift));
   const plane=addMesh({vertices,faces:[[0,1,2],[0,2,3]],material:s.material},mat,[[0,1],[1,1],[1,0],[0,0]]);plane.castShadow=false;plane.userData.surfaceId=s.id;return plane;
  };
  let face=null,faceMap=null;
  if(metal){face=makeCanvas(s.width*k,s.height*k);faceMap=texture(face);layer(.8,new THREE.MeshPhysicalMaterial({map:faceMap,...metalFinish,transparent:true,alphaTest:.5,side:THREE.DoubleSide})).renderOrder=2}
  const color=makeCanvas(s.width*k,s.height*k),map=texture(color);
  const plane=layer(1.4,new THREE.MeshPhysicalMaterial({map,roughness:.8,metalness:0,transparent:true,alphaTest:.02,side:THREE.DoubleSide,depthWrite:false}));plane.renderOrder=3;
  plates.push({s,k,color,map,face,faceMap,plane});
 }
 if(scene.id==='F'&&scene.shape==='ridge'){
  const d=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({map:texture(await fDecoration(scene)),transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));d.position.z=75*unit;d.renderOrder=4;group.add(d);
 }
 // Repaint every plate from the current documents. Overlapping calls: only the latest one lands.
 let token=0;
 group.userData.plates=plates.map(p=>p.plane);
 // The metal face (the plate's outline in its metal texture) never changes with the content.
 await Promise.all(plates.filter(p=>p.face).map(async p=>{const bare=await renderCanonicalSurface(p.s,[],{withBackground:true,scale:p.k});p.face.getContext('2d').drawImage(bare.canvas,0,0);p.faceMap.needsUpdate=true}));
 group.userData.paint=async documents=>{
  const mine=++token;
  const results=await Promise.all(plates.map(async p=>[p,await renderCanonicalSurface(p.s,documents[p.s.id]||[],{withBackground:false,scale:p.k})]));
  if(mine!==token)return false;
  for(const [p,ink] of results){const ctx=p.color.getContext('2d');ctx.clearRect(0,0,p.color.width,p.color.height);ctx.drawImage(ink.canvas,0,0);p.map.needsUpdate=true}
  return true;
 };
 return group;
}
