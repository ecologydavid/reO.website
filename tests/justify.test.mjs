import test from 'node:test';
import assert from 'node:assert/strict';
import {justifyRows} from '../src/content/justify.js';
const rowWidth=(row,ratios,width,gap)=>{const h=(width-gap*(row.items.length-1))/row.sum;return row.items.reduce((w,i)=>w+ratios[i]*h,0)+gap*(row.items.length-1)};
test('justified rows keep every photo index once and fill closed rows to the measure',()=>{
 const ratios=[.67,1.5,1.35,1.55,2,.59,1,1.78,.75];const rows=justifyRows(ratios,1320,340,12);
 assert.deepEqual(rows.flatMap(r=>r.items),ratios.map((_,i)=>i));
 for(const row of rows.filter(r=>!r.open))assert(Math.abs(rowWidth(row,ratios,1320,12)-1320)<.5);
});
test('a lone short last row joins the previous row instead of leaving a gap',()=>{
 const ratios=[1.5,1.5,1,.6],rows=justifyRows(ratios,1320,340,12);
 assert.equal(rows.length,1);assert(!rows[0].open);assert.deepEqual(rows[0].items,[0,1,2,3]);
 assert((1320-12*3)/rows[0].sum>=340*.6);
});
test('a last row that would get too short stays open at the target height',()=>{
 const rows=justifyRows([2,2,.9,1.6],1320,340,12);assert.equal(rows.length,2);assert.equal(rows[1].open,true);assert.deepEqual(rows[1].items,[2,3]);
});
test('a nearly full last row is justified instead of left short',()=>{const rows=justifyRows([.67,1.5,1.33,1.55,2,.59],1320,356,12);assert.equal(rows.length,2);assert(!rows.some(r=>r.open));});
