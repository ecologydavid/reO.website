import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projection,project,invert,defaultObjects,hitObject} from '../src/editor/geometry.mjs';
import {getLayout,layouts} from '../src/data/geometry.js';
for(const id of ['A','B','C','D','E','F']) {
  const variants=id==='F'?['ridge','water','diamond']:['ridge'];
  for(const variant of variants)for(const surface of getLayout(id,variant).surfaces){
    test(`${id}/${variant}/${surface.id}: corners match and inverse preserves drag positions`,()=>{
      const m=projection(surface.quad),inverse=invert(m);
      for(const [i,point] of [[0,[0,0]],[1,[1,0]],[2,[1,1]],[3,[0,1]]]){
        const p=project(m,...point);assert.ok(Math.hypot(p[0]-surface.quad[i][0],p[1]-surface.quad[i][1])<1e-9);
      }
      for(const u of [.1,.5,.9])for(const v of [.1,.5,.9]){
        const pixel=project(m,u,v),back=project(inverse,...pixel);assert.ok(Math.hypot(back[0]-u,back[1]-v)<1e-8);
      }
    });
  }
}
test('all source-specific regions and F masks remain distinct',()=>{
  assert.equal(layouts.A.surfaces.length,2);assert.equal(layouts.B.surfaces.length,1);assert.equal(layouts.C.surfaces.length,1);assert.equal(layouts.D.surfaces.length,2);assert.equal(layouts.E.surfaces.length,2);
  assert.equal(new Set(layouts.F.variants.map(v=>v.surfaces[0].mask)).size,3);
});
test('rotated image hit testing follows the local object rather than an axis-aligned box',()=>{
  const o={type:'image',x:200,y:300,width:160,height:30,rotation:90};
  assert.equal(hitObject(o,200,360,{}),true);assert.equal(hitObject(o,260,300,{}),false);
});
test('seed text fits the rectangular editing planes',()=>{
  for(const id of ['A','B','C','D','E'])for(const s of getLayout(id).surfaces)for(const o of defaultObjects(s)){
    assert.ok(o.y-o.fontSize>0&&o.y+o.fontSize<s.height);
    const ems=Array.from(o.text).reduce((n,c)=>n+(/[\u3000-\u9fff]/.test(c)?1:.65),0);
    assert.ok(o.fontSize*ems<s.width);
  }
});
