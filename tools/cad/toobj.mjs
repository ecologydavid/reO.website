// node toobj.mjs <mesh.json> <out.obj> — write the tessellated parts as OBJ + MTL (millimetres, Z up as in
// the STEP), one object per part, one material per part colour, with vertex normals.
import fs from 'node:fs';
import path from 'node:path';
const [input,output]=process.argv.slice(2);
const {source,parts}=JSON.parse(fs.readFileSync(input,'utf8'));
const mtlName=path.basename(output).replace(/\.obj$/i,'.mtl');
const hex=c=>c.map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
const lines=[`# ${source} → OBJ by re.O step2mesh (millimetres, Z up)`,`mtllib ${mtlName}`],mats=new Map();let base=1;
parts.forEach((p,k)=>{
 const colour=p.colour||p.faceColour||[.8,.8,.8],mat='m_'+hex(colour);mats.set(mat,colour);
 lines.push(`o ${(p.label||p.name||'part').replace(/\s+/g,'_')}_${k+1}`,`usemtl ${mat}`);
 for(let i=0;i<p.positions.length;i+=3)lines.push(`v ${p.positions[i].toFixed(4)} ${p.positions[i+1].toFixed(4)} ${p.positions[i+2].toFixed(4)}`);
 for(let i=0;i<p.normals.length;i+=3)lines.push(`vn ${p.normals[i].toFixed(5)} ${p.normals[i+1].toFixed(5)} ${p.normals[i+2].toFixed(5)}`);
 for(let i=0;i<p.indices.length;i+=3){const [a,b,c]=[p.indices[i]+base,p.indices[i+1]+base,p.indices[i+2]+base];lines.push(`f ${a}//${a} ${b}//${b} ${c}//${c}`)}
 base+=p.positions.length/3;
});
fs.writeFileSync(output,lines.join('\n')+'\n');
fs.writeFileSync(path.join(path.dirname(output),mtlName),[...mats].map(([m,c])=>`newmtl ${m}\nKd ${c.map(v=>v.toFixed(4)).join(' ')}\nKa 0 0 0\nKs 0.2 0.2 0.2\nNs 60\nd 1\nillum 2\n`).join('\n'));
console.log('wrote',output,parts.length,'parts',mats.size,'materials',(fs.statSync(output).size/1e6).toFixed(1)+'MB');
