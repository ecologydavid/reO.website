import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {materialTexture,renderCanonicalSurface,fDecoration} from './canonicalRender.js';

function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();const materials=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];materials.forEach(m=>{m.map?.dispose();m.dispose()})});}
function shapeFor(points){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return shape;}
function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
async function buildModel(scene,documents){
  const group=new THREE.Group(),unit=3/scene.height;
  const world=([x,y])=>[(x-scene.width/2)*unit,(scene.height/2-y)*unit];
  const extrude=(points,depth,z,material)=>{
    const geometry=new THREE.ExtrudeGeometry(shapeFor(points.map(world)),{depth:depth*unit,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(3,depth/6)*unit,bevelThickness:Math.min(2,depth/8)*unit});
    const position=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)/unit+scene.width/2)/scene.width,(position.getY(i)/unit+scene.height/2)/scene.height);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.z=(z-depth)*unit;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const standard=(kind)=>new THREE.MeshStandardMaterial({map:texture(materialTexture(kind,scene.fills[kind])),roughness:kind==='metal'?.36:.68,metalness:kind==='metal'?.62:.04});
  if(scene.id==='F'){
    const stone=new THREE.Mesh(new THREE.CylinderGeometry(500*unit,500*unit,85*unit,96),standard('stone'));stone.rotation.x=Math.PI/2;stone.position.z=-45*unit;stone.castShadow=true;group.add(stone);
    const ring=new THREE.Shape();ring.absarc(0,0,480*unit,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,418*unit,0,Math.PI*2,true);ring.holes.push(hole);
    const ringMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(ring,{depth:35*unit,bevelEnabled:true,bevelSize:2*unit,bevelThickness:2*unit,bevelSegments:2,curveSegments:scene.shape==='diamond'?20:72}),standard('metal'));ringMesh.position.z=30*unit;ringMesh.castShadow=true;group.add(ringMesh);
    extrude([[420,-110],[580,-110],[580,32],[420,32]],5,65,new THREE.MeshStandardMaterial({color:'#c2a05d',roughness:.7}));
  }else for(const b of scene.bodies)extrude(b.polygon,b.depth,b.z,standard(b.material));
  for(const s of scene.surfaces){
    const points=s.polygon.map(([u,v])=>[s.x+u*s.displayWidth,s.y+v*s.displayHeight]);
    if(s.material==='metal')extrude(points,12,s.z,standard('metal'));
    else if(s.material==='acrylic')extrude(points,10,s.z,new THREE.MeshPhysicalMaterial({color:'#69756f',transparent:true,opacity:.72,roughness:.13,metalness:0,side:THREE.DoubleSide,depthWrite:false}));
    const plate=await renderCanonicalSurface(s,documents[s.id]||[],{withBackground:s.material==='metal'});
    const mat=new THREE.MeshBasicMaterial({map:texture(plate.canvas),transparent:true,alphaTest:.02,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(s.displayWidth*unit,s.displayHeight*unit),mat);
    const [x,y]=world([s.x+s.displayWidth/2,s.y+s.displayHeight/2]);plane.position.set(x,y,(s.z+2)*unit);plane.renderOrder=3;group.add(plane);
  }
  if(scene.id==='F'&&scene.shape==='ridge'){
    const d=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({map:texture(await fDecoration(scene)),transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));d.position.z=75*unit;d.renderOrder=4;group.add(d);
  }
  return group;
}
export default function ThreePreview({scene,documents}){
  const host=useRef(null),runtime=useRef(null),generation=useRef(0);
  const [error,setError]=useState(''),[loading,setLoading]=useState(true);
  useEffect(()=>{
    let renderer,controls,observer,frame;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#eaece5',1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
      const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(2.8,1.1,6.4);
      world.add(new THREE.HemisphereLight('#ffffff','#7b8075',3));
      const key=new THREE.DirectionalLight('#ffffff',4);key.position.set(-3,5,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);world.add(key);
      const fill=new THREE.DirectionalLight('#f3e7ce',2);fill.position.set(4,1,-3);world.add(fill);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({color:'#30362d',opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.53;floor.receiveShadow=true;world.add(floor);
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3.8;controls.maxDistance=9;controls.minPolarAngle=.45;controls.maxPolarAngle=1.75;
      renderer.domElement.setAttribute('aria-label','可旋轉的 3D 獎盃模型，拖曳旋轉、滾輪縮放');renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('tabindex','0');
      host.current.appendChild(renderer.domElement);
      const resize=()=>{const {width,height}=host.current.getBoundingClientRect();renderer.setSize(Math.max(1,width),Math.max(1,height));camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix()};
      observer=new ResizeObserver(resize);observer.observe(host.current);resize();
      runtime.current={renderer,world,camera,controls,group:null};
      const animate=()=>{controls.update();renderer.render(world,camera);frame=requestAnimationFrame(animate)};animate();
    }catch{setError('這個裝置無法開啟 WebGL 3D，請使用正面平面模式。');setLoading(false)}
    return()=>{generation.current++;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(runtime.current?.group)disposeGroup(runtime.current.group);runtime.current?.world.traverse(o=>{if(o!==runtime.current.group){o.geometry?.dispose();o.material?.dispose()}});renderer?.dispose();renderer?.domElement.remove();runtime.current=null};
  },[]);
  useEffect(()=>{
    const token=++generation.current;setLoading(true);
    buildModel(scene,documents).then(group=>{
      if(token!==generation.current||!runtime.current){disposeGroup(group);return;}
      const r=runtime.current;if(r.group){r.world.remove(r.group);disposeGroup(r.group)}if(r.modelId!==scene.id){r.camera.position.set(2.8,1.1,6.4);r.controls.target.set(0,0,0);r.controls.update();r.modelId=scene.id}r.group=group;r.world.add(group);setLoading(false);
    }).catch(()=>{if(token===generation.current){setError('3D 模型載入失敗，請切換正面平面後重試。');setLoading(false)}});
  },[scene,documents]);
  function reset(){const r=runtime.current;if(r){r.camera.position.set(2.8,1.1,6.4);r.controls.target.set(0,0,0);r.controls.update()}}
  return <div className="three-view"><div className="three-stage" ref={host}/>{loading&&!error?<span className="three-loading" role="status">正在建立 3D 模型…</span>:null}{error?<p className="three-error" role="alert">{error}</p>:<><button className="three-reset" onClick={reset}>重設視角</button><p className="three-instruction">拖曳旋轉・滾輪縮放</p></>}</div>;
}
