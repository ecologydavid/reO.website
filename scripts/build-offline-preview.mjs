import {createRequire} from 'node:module';
import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Separate export: the hosted application's source, lazy loading and assets stay intact.
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(process.argv[2]||path.join(root,'..','reO-本機預覽.html'));
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite/package.json'))('esbuild');
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.avif':'image/avif'};
const aliases={},images=[],hashes=new Map(),pages={};
async function collect(directory){
 for(const item of await readdir(directory,{withFileTypes:true})){
  const filename=path.join(directory,item.name);
  if(item.isDirectory()){await collect(filename);continue}
  const type=mime[path.extname(filename).toLowerCase()];if(!type)continue;
  const bytes=await readFile(filename),hash=createHash('sha256').update(bytes).digest('hex');
  let id=hashes.get(hash);if(id===undefined){id=images.length;hashes.set(hash,id);images.push(`data:${type};base64,${bytes.toString('base64')}`)}
  aliases['/'+path.relative(path.join(root,'public'),filename).split(path.sep).join('/')]=id;
 }
}
await collect(path.join(root,'public'));
for(const item of await readdir(path.join(root,'public/content/pages'))){
 if(!item.endsWith('.json'))continue;
 pages[path.basename(item,'.json')]=JSON.parse(await readFile(path.join(root,'public/content/pages',item),'utf8'));
}
const portableAssets=`
const localUrls=new Map();
export function asset(src){
 const data=window.__REO_OFFLINE__,id=data.aliases[src];if(id===undefined)return src;
 if(localUrls.has(id))return localUrls.get(id);
 const uri=data.images[id];
 // Large data URLs exceed browser CSS custom-property limits. Blob URLs keep
 // both CSS material maps and canvas sources local, short and origin-clean.
 if(uri.length>524288){const comma=uri.indexOf(','),binary=atob(uri.slice(comma+1)),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);const url=URL.createObjectURL(new Blob([bytes],{type:uri.slice(5,uri.indexOf(';'))}));localUrls.set(id,url);return url}
 localUrls.set(id,uri);return uri;
}
export function hydrate(value){if(typeof value==='string')return asset(value);if(Array.isArray(value))return value.map(hydrate);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,hydrate(item)]));return value}
`;
const portablePages=`
import {hydrate} from 'portable:assets';
export default function readPage(id){const page=window.__REO_OFFLINE__.pages[id];if(!page)throw new Error('找不到這篇本機內容。');return hydrate(page)}
`;
const bundle=await build({
 absWorkingDir:root,entryPoints:['src/main.jsx'],outfile:'offline-app.js',bundle:true,
 format:'iife',platform:'browser',target:'es2022',jsx:'automatic',minify:true,
 charset:'utf8',write:false,metafile:true,define:{'process.env.NODE_ENV':'"production"'},
 plugins:[{
  name:'reo-offline-export',setup(b){
   b.onResolve({filter:/^portable:/},args=>({path:args.path,namespace:'reo-offline'}));
   b.onLoad({filter:/.*/,namespace:'reo-offline'},args=>({contents:args.path==='portable:assets'?portableAssets:portablePages,loader:'js'}));
   b.onLoad({filter:/\.json$/},async args=>{
    if(!args.path.startsWith(path.join(root,'src')+path.sep))return;
    return {contents:`import {hydrate} from 'portable:assets';export default hydrate(${await readFile(args.path,'utf8')});`,loader:'js',resolveDir:path.dirname(args.path)};
   });
   b.onLoad({filter:/\.[jm]?[jt]sx?$/},async args=>{
    if(!args.path.startsWith(path.join(root,'src')+path.sep))return;
    let source=await readFile(args.path,'utf8');
    // The offline copy embeds page data instead of fetching JSON from file://.
    if(args.path===path.join(root,'src/content/catalogue.js')){
     const loader=/export function loadPage\(id\)\{[^\r\n]*\}/;
     if(!loader.test(source))throw new Error('Content loader changed; review the offline export adapter.');
     source=`import __readOfflinePage from 'portable:pages';\n`+source.replace(loader,"export function loadPage(id){if(!cache.has(id))cache.set(id,Promise.resolve().then(()=>__readOfflinePage(id)).catch(e=>{cache.delete(id);throw e}));return cache.get(id)}");
    }
    source=source.replace(/\s+with\s*\{\s*type\s*:\s*['"]json['"]\s*\}/g,'');
    if(args.path.endsWith('.jsx'))source=source.replace(/\bsrc\s*=\s*((['"])\/(?:assets|content\/images)\/[^'"\r\n]+\2)/g,(_,value)=>`src={${value}}`);
    let usesAsset=false;
    source=source.replace(/(['"`])(\/(?:assets|content\/images)\/[^'"`\r\n]+)\1/g,match=>{usesAsset=true;return `__reoOfflineAsset(${match})`});
    if(usesAsset)source=`import {asset as __reoOfflineAsset} from 'portable:assets';\n`+source;
    return {contents:source,loader:args.path.endsWith('.jsx')?'jsx':'js',resolveDir:path.dirname(args.path)};
   });
  }
 }]
});
const js=bundle.outputFiles.find(f=>f.path.endsWith('.js'))?.text;
const css=bundle.outputFiles.filter(f=>f.path.endsWith('.css')).map(f=>f.text).join('\n');
if(!js||/\bimport\(/.test(js))throw new Error('The offline bundle must contain every module, including 3D and PDF.');
const scriptSafe=text=>text.replace(/<\/script/gi,'<\\/script');
const styleSafe=text=>text.replace(/<\/style/gi,'<\\/style');
const data=scriptSafe(JSON.stringify({aliases,images,pages}));
const icon=images[aliases['/assets/reo-logo.png']];
const html=`<!doctype html>
<html lang="zh-Hant"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="theme-color" content="#f4f1e9"/>
<meta name="description" content="re.O 循環設計。本機離線預覽：公版獎盃、企業案例、循環材料與銘版排版工作室。"/>
<title>re.O｜本機完整預覽</title><link rel="icon" type="image/png" href="${icon}"/>
<style>${styleSafe(css)}</style></head>
<body><div id="root"><div class="app-loading">正在開啟本機預覽…</div></div>
<script type="application/json" id="reo-offline-data">${data}</script>
<script>window.__REO_OFFLINE__=JSON.parse(document.getElementById('reo-offline-data').textContent);document.getElementById('reo-offline-data').remove();</script>
<script>${scriptSafe(js)}</script></body></html>`;
await writeFile(output,html,'utf8');
console.log(JSON.stringify({output,bytes:(await stat(output)).size,images:Object.keys(aliases).length,uniqueImages:images.length,pages:Object.keys(pages).length,bundleBytes:Buffer.byteLength(js),externalScripts:0,externalStylesheets:0},null,2));
