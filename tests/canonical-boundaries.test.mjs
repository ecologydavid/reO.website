import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pointInPolygon,objectFits,fitObject} from '../src/editor/constraints.mjs';
import {defaultObjects,objectBounds} from '../src/editor/geometry.mjs';
const models=JSON.parse(readFileSync(new URL('../src/data/canonical-models.json',import.meta.url))).models;
const ctx={font:'',measureText(text){const size=Number(this.font.match(/([\d.]+)px/)?.[1]||12);return {width:Array.from(text).reduce((sum,char)=>sum+size*(/[\u3000-\u9fff]/.test(char)?1:.6),0)}}};
test('D remains a tapered plaque and a separate stone lettering area',()=>{
  const [main,lower]=models.D.surfaces;
  assert.equal(main.material,'metal');assert.equal(lower.material,'stone');
  assert.equal(pointInPolygon(.97,.03,main.polygon),false);
  assert.equal(pointInPolygon(.5,.5,main.polygon),true);
  assert.ok(lower.y>main.y+main.displayHeight);
});
test('E uses two distinct angular silhouettes, never a full rectangular texture area',()=>{
  const [back,front]=models.E.surfaces;
  assert.notDeepEqual(back.polygon,front.polygon);
  for(const s of [back,front])assert.equal(pointInPolygon(.02,.02,s.polygon),false);
  assert.ok(back.y<front.y);assert.ok(back.z<front.z);
});
test('F has three distinct acrylic contours with the original slot exclusions',()=>{
  assert.equal(models.F.shapeVariants.length,3);
  for(const v of models.F.shapeVariants){
    const s=v.surfaces[0];assert.equal(s.material,'acrylic');
    assert.equal(pointInPolygon(.5,.5,s.polygon),true);
    assert.equal(pointInPolygon(0,0,s.polygon),false);
  }
  assert.equal(new Set(models.F.shapeVariants.map(v=>JSON.stringify(v.surfaces[0].polygon))).size,3);
});
test('a rectangle covering a concave notch is rejected even when all corners are inside',()=>{
  const s={width:1000,height:1000,polygon:[[0,0],[.4,0],[.4,.7],[.6,.7],[.6,0],[1,0],[1,1],[0,1]]};
  const o={type:'image',x:500,y:500,width:700,height:900,rotation:0};
  assert.equal(objectFits(o,s,ctx),false);
});
test('dragging and rotating an image cannot cross the custom outline',()=>{
  const s=models.E.surfaces[1],o=fitObject({type:'image',x:500,y:s.height*.5,width:250,height:160,rotation:35},s,ctx);
  assert.equal(objectFits(o,s,ctx),true);
  const moved=fitObject({...o,x:-5000,y:-5000},s,ctx,{previous:o,positionOnly:true});
  assert.equal(objectFits(moved,s,ctx),true);assert.ok(moved.x>0&&moved.y>0);
});
test('all default text objects can be fitted inside every audited silhouette',()=>{
  for(const [id,model] of Object.entries(models))for(const variant of id==='F'?model.shapeVariants:[model])for(const s of variant.surfaces){
    for(const o of defaultObjects(s)){const fitted=fitObject(o,s,ctx);assert.equal(objectFits(fitted,s,ctx),true,`${id}/${variant.id||''}/${s.id}/${o.id}`);}
  }
});
test('an object can slide along a rectangular edge while the pointer remains outside',()=>{
  const s=models.B.surfaces[0],previous={type:'image',width:100,height:100,x:500,y:s.height-53,rotation:0};
  const moved=fitObject({...previous,x:700,y:s.height+200},s,ctx,{previous,positionOnly:true});
  assert.equal(objectFits(moved,s,ctx),true);assert.equal(moved.x,700);assert.equal(moved.y,previous.y);
});
test('long text, italic bounds and large letter spacing are fitted without losing content',()=>{
  const s=models.F.shapeVariants[1].surfaces[0],text='讓材料的新生命成為每一份成就的見證。'.repeat(10);
  const o=fitObject({...defaultObjects(s)[1],text,italic:true,letterSpacing:12,lineHeight:1.8,fontSize:180},s,ctx);
  assert.equal(o.text,text);assert.equal(objectFits(o,s,ctx),true);assert.ok(objectBounds(o,ctx).width<s.width);
});
test('official E product combinations remain restricted and F materials are separate',()=>{
  assert.deepEqual(models.E.variants,['黑金','白銀']);
  assert.equal(models.D.variants.length,9);assert.equal(models.F.variants.length,9);
  assert.equal(models.A.surfaces[0].material,'wood');
});
