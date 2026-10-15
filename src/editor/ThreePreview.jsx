import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {buildModel,disposeGroup} from './ThreeModel.js';

export default function ThreePreview({scene,documents}){
  const host=useRef(null),runtime=useRef(null),generation=useRef(0);
  const [error,setError]=useState(''),[loading,setLoading]=useState(true);
  useEffect(()=>{
    let renderer,controls,observer,frame;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#eaece5',1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
      const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(2.8,1.1,6.4);
      world.add(new THREE.HemisphereLight('#ffffff','#7b8075',2.2));
      const key=new THREE.DirectionalLight('#ffffff',3);key.position.set(-3,5,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.001;key.shadow.normalBias=.02;world.add(key);
      const fill=new THREE.DirectionalLight('#f3e7ce',1.2);fill.position.set(4,1,-3);world.add(fill);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({color:'#30362d',opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.53;floor.receiveShadow=true;world.add(floor);
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3.8;controls.maxDistance=18;controls.minPolarAngle=.45;controls.maxPolarAngle=1.75;
      renderer.domElement.setAttribute('aria-label','可旋轉的 3D 獎盃模型，拖曳旋轉、滾輪縮放');renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('tabindex','0');
      host.current.appendChild(renderer.domElement);
      const reframe=()=>{const r=runtime.current,ratio=r?.sceneRatio||1;const distance=Math.max(7.07,3*ratio/(2*Math.tan(camera.fov*Math.PI/360)*camera.aspect)*1.2);camera.position.set(2.8,1.1,6.4).normalize().multiplyScalar(distance);controls.target.set(0,0,0);controls.update()};
      const resize=()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();renderer.setSize(Math.max(1,width),Math.max(1,height));camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();if(runtime.current)reframe()};
      observer=new ResizeObserver(resize);observer.observe(host.current);resize();
      runtime.current={renderer,world,camera,controls,group:null,reframe};
      const animate=()=>{controls.update();renderer.render(world,camera);frame=requestAnimationFrame(animate)};animate();
    }catch{setError('這個裝置無法開啟 WebGL 3D，請使用正面平面模式。');setLoading(false)}
    return()=>{generation.current++;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(runtime.current?.group)disposeGroup(runtime.current.group);runtime.current?.world.traverse(o=>{if(o!==runtime.current.group){o.geometry?.dispose();o.material?.dispose()}});renderer?.dispose();renderer?.domElement.remove();runtime.current=null};
  },[]);
  useEffect(()=>{
    const token=++generation.current;setLoading(true);
    buildModel(scene,documents).then(group=>{
      if(token!==generation.current||!runtime.current){disposeGroup(group);return;}
      const r=runtime.current;if(r.group){r.world.remove(r.group);disposeGroup(r.group)}if(r.modelId!==scene.id){r.sceneRatio=scene.width/scene.height;r.reframe();r.modelId=scene.id}r.group=group;r.world.add(group);setLoading(false);
    }).catch(()=>{if(token===generation.current){setError('3D 模型載入失敗，請切換正面平面後重試。');setLoading(false)}});
  },[scene,documents]);
  function reset(){runtime.current?.reframe()}
  return <div className="three-view"><div className="three-stage" ref={host}/>{loading&&!error?<span className="three-loading" role="status">正在建立 3D 模型…</span>:null}{error?<p className="three-error" role="alert">{error}</p>:<><button className="three-reset" onClick={reset}>重設視角</button><p className="three-instruction">拖曳旋轉・滾輪縮放</p></>}</div>;
}
