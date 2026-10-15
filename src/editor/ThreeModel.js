import * as THREE from 'three';
import {materialTexture,renderCanonicalSurface,fDecoration} from './canonicalRender.js';
import {ensureMaterialMaps} from './materialMaps.js';
import {triangulateFace,worldNormal,pointOnSurface,polygonPrism} from './modelGeometry.mjs';
export function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){m.map?.dispose();m.bumpMap?.dispose();m.dispose()}})}
function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
export async function buildModel(scene,documents){
 await ensureMaterialMaps();const group=new THREE.Group(),unit=3/scene.height;
 const world=([x,y,z])=>[(x-scene.width/2)*unit,(scene.height/2-y)*unit,z*unit];
 const material=(kind,endgrain=false)=>{
  const map=texture(materialTexture(kind,scene.fills[kind],{modelId:scene.id,finish:scene.finish,endgrain}));
  const metal=kind==='metal';return new THREE.MeshStandardMaterial({map,roughness:metal?(scene.id==='E'?.62:.4):kind==='wood'?.62:.42,metalness:metal?(scene.id==='E'?.52:.65):.01,flatShading:true,side:THREE.DoubleSide,polygonOffset:kind==='stone',polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 };
 const addMesh=(data,customMaterial=null,uvLocal=null)=>{
  const positions=[],uvs=[],triangles=data.faces.flatMap(face=>triangulateFace(data.vertices,face));
  const all=scene.meshes?.filter(m=>m.material===data.material).flatMap(m=>m.vertices)||data.vertices,ys=all.map(p=>p[1]),top=Math.min(...ys),height=Math.max(...ys)-top||scene.height;
  for(const face of triangles){const normal=worldNormal(data.vertices,face);for(const index of face){const v=data.vertices[index];positions.push(...world(v));if(uvLocal)uvs.push(...uvLocal[index]);else if(Math.abs(normal[0])>.85)uvs.push((v[2]+scene.width)/scene.width,1-(v[1]-top)/height);else if(Math.abs(normal[1])>.85)uvs.push(v[0]/scene.width,(v[2]+scene.width)/scene.width);else uvs.push(v[0]/scene.width,1-(v[1]-top)/height)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,customMaterial||material(data.material));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
 };
 if(scene.id==='F'){
  const stone=new THREE.Mesh(new THREE.CylinderGeometry(500*unit,500*unit,85*unit,96),material('stone'));stone.rotation.x=Math.PI/2;stone.position.z=-45*unit;stone.castShadow=true;group.add(stone);
  const ring=new THREE.Shape();ring.absarc(0,0,480*unit,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,418*unit,0,Math.PI*2,true);ring.holes.push(hole);
  const rm=new THREE.Mesh(new THREE.ExtrudeGeometry(ring,{depth:35*unit,bevelEnabled:true,bevelSize:2*unit,bevelThickness:2*unit,bevelSegments:2,curveSegments:scene.shape==='diamond'?20:72}),material('metal'));rm.position.z=30*unit;rm.castShadow=true;group.add(rm);
  addMesh(polygonPrism([[420,-110],[580,-110],[580,32],[420,32]],65,5,'metal'),new THREE.MeshStandardMaterial({color:'#c2a05d',roughness:.7}));
 }else for(const data of scene.meshes){
  if(data.face_groups?.includes('triangular-corner-cut')&&scene.id==='A'){
   const index=data.face_groups.indexOf('triangular-corner-cut'),body={...data,faces:data.faces.filter((_,i)=>i!==index)};addMesh(body);addMesh({...data,faces:[data.faces[index]]},material(data.material,true));
  }else addMesh(data);
 }
 for(const s of scene.surfaces){
  const polygon=s.polygon,points=polygon.map(([u,v])=>pointOnSurface(s,u,v));
  const p=points[0],normal=new THREE.Vector3(...worldNormal(points,points.map((_,i)=>i)));
  if(normal.z<0)normal.negate();
  const rawNormal=[normal.x,-normal.y,normal.z];
  if(s.material==='metal'||s.material==='acrylic'){
   const depth=s.material==='metal'?(scene.id==='E'?12:8):10;
   const n=points.length,vertices=[...points,...points.map(v=>v.map((x,i)=>x-rawNormal[i]*depth))];
   const winding=worldNormal(vertices,Array.from({length:n},(_,i)=>i))[2]>0?Array.from({length:n},(_,i)=>i):Array.from({length:n},(_,i)=>n-i-1);
   const faces=[winding,[...winding].reverse().map(i=>i+n),...polygon.map((_,i)=>[i,(i+1)%n,(i+1)%n+n,i+n])];
   const mat=s.material==='metal'?material('metal'):new THREE.MeshPhysicalMaterial({color:'#e8efeb',transparent:true,opacity:.22,roughness:.12,metalness:0,side:THREE.DoubleSide,depthWrite:false});
   addMesh({vertices,faces,material:s.material},mat);
  }
  const plate=await renderCanonicalSurface(s,documents[s.id]||[],{withBackground:s.material==='metal'});
  const mat=new THREE.MeshBasicMaterial({map:texture(plate.canvas),transparent:true,alphaTest:.02,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});
  // Mask and content use exactly the same affine surface; no independent floating label.
  const corners=[[0,0],[1,0],[1,1],[0,1]],vertices=corners.map(([u,v])=>pointOnSurface(s,u,v).map((x,i)=>x+rawNormal[i]*1.1));
  const plane=addMesh({vertices,faces:[[0,1,2],[0,2,3]],material:s.material},mat,[[0,1],[1,1],[1,0],[0,0]]);plane.renderOrder=3;plane.castShadow=false;
 }
 if(scene.id==='F'&&scene.shape==='ridge'){
  const d=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({map:texture(await fDecoration(scene)),transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));d.position.z=75*unit;d.renderOrder=4;group.add(d);
 }
 return group;
}
