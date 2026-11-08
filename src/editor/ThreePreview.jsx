import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildModel,disposeGroup} from './ThreeModel.js';

// The rotatable 3D reconstruction. V5: a studio environment (generated in the browser, nothing to
// download) gives metal and stone their reflections; neutral tone mapping keeps the finishes' colours;
// soft shadows ground the piece. It draws only when something changed (orbiting, a repaint, a resize),
// so an idle view costs nothing. The model is rebuilt when the model or finish changes; edits only
// repaint the plates. Tapping a plate (without dragging) picks it for editing.
export default function ThreePreview({scene,documents,onSurface}){
  const host=useRef(null),runtime=useRef(null),generation=useRef(0),latest=useRef(documents),pickRef=useRef(onSurface);
  const [error,setError]=useState(''),[loading,setLoading]=useState(true);
  latest.current=documents;pickRef.current=onSurface;
  useEffect(()=>{
    let renderer,controls,observer,frame,pmrem;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#ffffff',0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
      const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.01,100);camera.position.set(2.8,1.1,6.4);
      // The studio: three's neutral room plus a large soft box in front, as in product photography, so a
      // plate facing the viewer shows a bright metal reflection rather than the grey wall behind us.
      pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment(),box=new THREE.Mesh(new THREE.PlaneGeometry(16,10),new THREE.MeshBasicMaterial({color:new THREE.Color(2.6,2.55,2.45),side:THREE.DoubleSide}));box.position.set(2,5,13);box.lookAt(0,2,0);room.add(box);
      world.environment=pmrem.fromScene(room,.035).texture;world.environmentIntensity=.95;box.geometry.dispose();box.material.dispose();room.dispose?.();
            const key=new THREE.DirectionalLight('#fffaf0',.8);key.position.set(-3,5,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0008;key.shadow.normalBias=.02;key.shadow.radius=6;world.add(key);
      const rim=new THREE.DirectionalLight('#f3ead8',.45);rim.position.set(4,2,-4);world.add(rim);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({color:'#2a2f28',opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.53;floor.receiveShadow=true;world.add(floor);
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3.2;controls.maxDistance=18;controls.minPolarAngle=.45;controls.maxPolarAngle=1.75;
      renderer.domElement.setAttribute('aria-label','可旋轉的 3D 獎盃模型，拖曳旋轉、滾輪縮放，點銘版可切換編輯區域');renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('tabindex','0');
      host.current.appendChild(renderer.domElement);
      let dirty=true;const invalidate=()=>{dirty=true};controls.addEventListener('change',invalidate);
      const reframe=()=>{const r=runtime.current,ratio=r?.sceneRatio||1;const distance=Math.max(6.4,3*ratio/(2*Math.tan(camera.fov*Math.PI/360)*camera.aspect)*1.15,3/(2*Math.tan(camera.fov*Math.PI/360))*1.18);camera.position.set(2.8,1.1,6.4).normalize().multiplyScalar(distance);controls.target.set(0,0,0);controls.update();invalidate()};
      const resize=()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();renderer.setSize(Math.max(1,width),Math.max(1,height));camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();if(runtime.current)reframe();invalidate()};
      observer=new ResizeObserver(resize);observer.observe(host.current);
      // A tap (not a drag) on a plate picks that plate.
      const ray=new THREE.Raycaster(),down={x:0,y:0};
      const press=e=>{down.x=e.clientX;down.y=e.clientY};
      const release=e=>{
        const r=runtime.current;if(!r?.group||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5||!pickRef.current)return;
        const box=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1),camera);
        const hit=ray.intersectObjects(r.group.userData.plates||[],false)[0];if(hit)pickRef.current(hit.object.userData.surfaceId);
      };
      renderer.domElement.addEventListener('pointerdown',press);renderer.domElement.addEventListener('pointerup',release);
      runtime.current={renderer,world,camera,controls,group:null,reframe,invalidate,press,release};resize();
      // Development only: lets the multi-angle render checks drive the camera. Stripped from builds.
      if(import.meta.env.DEV)window.__studio3d=runtime.current;
      const animate=()=>{controls.update();if(dirty){dirty=false;renderer.render(world,camera)}frame=requestAnimationFrame(animate)};animate();
    }catch{setError('這個裝置無法開啟 WebGL 3D，請使用正面平面模式。');setLoading(false)}
    return()=>{generation.current++;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();const r=runtime.current;if(r){renderer.domElement.removeEventListener('pointerdown',r.press);renderer.domElement.removeEventListener('pointerup',r.release);if(r.group)disposeGroup(r.group);r.world.environment?.dispose();r.world.traverse(o=>{if(o!==r.group){o.geometry?.dispose();o.material?.dispose()}})}pmrem?.dispose();renderer?.dispose();renderer?.domElement.remove();runtime.current=null};
  },[]);
  // Model or finish changed: rebuild, paint, then swap in.
  useEffect(()=>{
    const token=++generation.current;setLoading(true);
    buildModel(scene).then(async group=>{
      await group.userData.paint(latest.current);
      if(token!==generation.current||!runtime.current){disposeGroup(group);return;}
      const r=runtime.current;if(r.group){r.world.remove(r.group);disposeGroup(r.group)}if(r.modelId!==scene.id){r.sceneRatio=scene.width/scene.height;r.reframe();r.modelId=scene.id}r.group=group;r.painted=latest.current;r.world.add(group);r.invalidate();setLoading(false);
    }).catch(()=>{if(token===generation.current){setError('3D 模型載入失敗，請切換正面平面後重試。');setLoading(false)}});
  },[scene]);
  // Content changed: repaint the plates only, a beat after the last change while dragging.
  useEffect(()=>{
    const r=runtime.current;if(!r?.group||r.painted===documents)return;
    const timer=setTimeout(()=>{const g=runtime.current?.group;if(!g)return;g.userData.paint(documents).then(done=>{if(done&&runtime.current?.group===g){runtime.current.painted=documents;runtime.current.invalidate()}})},90);
    return()=>clearTimeout(timer);
  },[documents]);
  function reset(){runtime.current?.reframe()}
  return <div className="three-view"><div className="three-stage" ref={host}/>{loading&&!error?<span className="three-loading" role="status">正在建立 3D 模型…</span>:null}{error?<p className="three-error" role="alert">{error}</p>:<><button className="three-reset" onClick={reset}>重設視角</button><p className="three-instruction">拖曳旋轉・滾輪縮放・點銘版切換區域</p></>}</div>;
}
