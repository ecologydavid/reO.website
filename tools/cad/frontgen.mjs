// node frontgen.mjs <model> — render the CAD model straight from the front (near-orthographic: a long lens
// from far away) for every finish, transparent background, and save WebP files the 2D front view and the
// PDF draw. Uses the live studio (dev hook window.__studio3d) so materials and lighting match the 3D view.
import {writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const [model]=process.argv.slice(2),ROOT=fileURLToPath(new URL('../../',import.meta.url)).replaceAll('\\','/');
// Swatch labels to press for each finish, and the file key (must match frontKey in src/editor/canonicalRender.js).
const finishes={
 D:[['白','金'],['白','銀'],['白','銅'],['黑','金'],['黑','銀'],['黑','銅'],['綠','金'],['綠','銀'],['綠','銅']],
 E:[['黑金'],['白銀']],
 A:[['北美黃檜','白再生大理石'],['北美黃檜','黑再生大理石'],['北美黃檜','水庫淤泥'],['木橫擔','白再生大理石'],['木橫擔','黑再生大理石'],['木橫擔','水庫淤泥']],
 B:[['白色石材'],['黑色石材']],C:[['白色石材'],['黑色石材']]
}[model];
const key=f=>model==='A'?(f[0]==='木橫擔'?'x':'h')+(f[1].includes('白')?'w':f[1].includes('黑')?'k':'m'):f.join('').replace('色石材','').replace('白','w').replace('黑','k').replace('綠','g').replace('金','au').replace('銀','ag').replace('銅','cu');
const target=await (await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pending.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true});return r.result?.result?.value??r.result?.exceptionDetails?.exception?.description};
const wait=t=>new Promise(r=>setTimeout(r,t));
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8787/#/preview/'+model});await wait(4500);
await ev("[...document.querySelectorAll('.st-switch button')][1].click(),document.querySelector('.st-pip-swap').click(),1");await wait(6000);
const cad=JSON.parse(readFileSync(ROOT+'src/data/cad-models.json','utf8'));const m=cad.models[model];
const W=m.width,H=m.height,margin=Math.round(H*.03),PX=2200;
for(const f of finishes){
 for(const label of f){const ok=await ev(`(()=>{const b=[...document.querySelectorAll('.st-swatch')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)});b?.click();return !!b})()`);if(!ok)throw new Error('no swatch '+label);await wait(300)}
 await wait(4500);
 const data=await ev(`(()=>{const s=window.__studio3d,r=s.renderer,c=s.camera,unit=3/${H};
  const hide=[];s.world.traverse(o=>{if(o.isMesh&&(o.material?.isShadowMaterial||(!o.userData.part&&o.userData.surfaceId)))if(o.visible){o.visible=false;hide.push(o)}});
  const wW=(${W}+2*${margin})*unit,wH=(${H}+2*${margin})*unit,d=400,old={fov:c.fov,aspect:c.aspect,pos:c.position.clone(),near:c.near,far:c.far};
  const px=Math.round(${PX}*wW/wH),py=${PX};const size=r.getSize(new c.position.constructor());const ratio=r.getPixelRatio();r.setPixelRatio(1);r.setSize(px,py,false);
  c.aspect=wW/wH;c.fov=2*Math.atan(wH/2/d)*180/Math.PI;c.near=d-5;c.far=d+5;c.position.set(0,0,d);c.lookAt(0,0,0);c.updateProjectionMatrix();
  r.setClearColor(0xffffff,0);r.render(s.world,c);const url=r.domElement.toDataURL('image/webp',.9);
  hide.forEach(o=>o.visible=true);c.fov=old.fov;c.aspect=old.aspect;c.near=old.near;c.far=old.far;c.position.copy(old.pos);c.updateProjectionMatrix();r.setPixelRatio(ratio);r.setSize(size.x,size.y,false);s.reframe();s.invalidate();
  return url})()`);
 if(!data?.startsWith('data:image/webp'))throw new Error('capture failed '+String(data).slice(0,200));
 const file=`front-${model}-${key(f)}.webp`;writeFileSync(ROOT+'public/assets/models/'+file,Buffer.from(data.split(',')[1],'base64'));console.log(file,Math.round(data.length*.75/1024)+'KB');
}
m.front={margin,note:'Front view: the CAD model rendered head-on (near-orthographic) for each finish, drawn over the scene box grown by margin on every side.'};
writeFileSync(ROOT+'src/data/cad-models.json',JSON.stringify(cad,null,1));
await fetch('http://127.0.0.1:9333/json/close/'+target.id);ws.close();
