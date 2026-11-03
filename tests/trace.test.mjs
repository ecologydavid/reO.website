import test from 'node:test';
import assert from 'node:assert/strict';
import {traceContours,simplifyLoop,loopArea} from '../src/editor/trace.mjs';

// Anti-aliased coverage of a shape on a w×h grid (4×4 supersampling per pixel).
function raster(w,h,inside){const a=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=0;for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++)if(inside(x+(sx+.5)/4,y+(sy+.5)/4))n++;a[y*w+x]=n/16}return a}

test('a filled disc traces to one closed loop with the right area',()=>{
 const r=20,a=raster(60,60,(x,y)=>Math.hypot(x-30,y-30)<=r),loops=traceContours(a,60,60);
 assert.equal(loops.length,1);
 assert.ok(Math.abs(Math.abs(loopArea(loops[0]))-Math.PI*r*r)<Math.PI*r*r*.01);
});

test('a ring gives an outer loop and a hole wound the other way',()=>{
 const a=raster(80,80,(x,y)=>{const d=Math.hypot(x-40,y-40);return d<=30&&d>=15}),loops=traceContours(a,80,80);
 assert.equal(loops.length,2);
 const [p,q]=loops.map(loopArea);assert.ok(p*q<0,'opposite winding');
 const net=Math.abs(p+q);assert.ok(Math.abs(net-Math.PI*(900-225))<Math.PI*675*.015);
});

test('simplifying keeps a square to its corners and stays within tolerance',()=>{
 const a=raster(40,40,(x,y)=>x>=10&&x<=30&&y>=10&&y<=30),[loop]=traceContours(a,40,40),s=simplifyLoop(loop,.25);
 assert.ok(s.length<=8&&s.length>=4,`got ${s.length} points`);
 assert.ok(Math.abs(Math.abs(loopArea(s))-400)<8);
});

test('separate shapes stay separate',()=>{
 const a=raster(60,20,(x,y)=>(x>5&&x<15||x>25&&x<35||x>45&&x<55)&&y>5&&y<15);
 assert.equal(traceContours(a,60,20).length,3);
});
