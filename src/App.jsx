import React,{lazy,Suspense,useEffect,useState} from 'react';
import Home from './components/Home.jsx';
import {setPageMeta} from './seo.js';
import {useRoute,navigate} from './router.js';
import {BrandLogo,openStudio} from './components/site/ui.jsx';
const loaders={editor:()=>import('./editor/Editor.jsx'),content:()=>import('./content/ContentSite.jsx'),admin:()=>import('./admin/AdminSite.jsx')};
const LazyEditor=lazy(loaders.editor),LazyContent=lazy(loaders.content),LazyAdmin=lazy(loaders.admin),ready={};
// A prerendered page already shows its content. Before React takes over, main.jsx loads what that route needs (its
// code and, for an article, its data), so the first render is the page itself and not a loading screen.
export async function preloadRoute(name){
 const r=readRoute(name);if(r.kind==='home'||r.kind==='admin')return;
 const key=r.kind==='editor'?'editor':'content';ready[key]=(await loaders[key]()).default;
 if(r.kind==='read'){const {findPage,loadPage}=await import('./content/catalogue.js'),p=findPage(r.path);if(p)await loadPage(p.id).catch(()=>{})}
}
// #/brands is the brand wall on the home page; the hash is kept so existing links still land on it.
function readRoute(hash){const m=hash.match(/^#\/preview\/([A-E])$/);if(m)return {kind:'editor',modelId:m[1]};if(hash.startsWith('#/read/'))return {kind:'read',path:hash.split('?')[0]};if(hash.startsWith('#/explore/')){const [category,query='']=hash.slice(10).split('?');return {kind:'explore',category,filter:new URLSearchParams(query).get('filter')||''}}
if(hash==='#/brands')return {kind:'home',section:'brands'};if(hash.split('?')[0]==='#/admin')return {kind:'admin',open:new URLSearchParams(hash.split('?')[1]||'').get('case')||''};return {kind:'home'};}
export default function App(){
  const name=useRoute(),route=React.useMemo(()=>readRoute(name),[name]),first=React.useRef(true);
  // A new page starts at its top (not on first load, where the browser restores the position).
  useEffect(()=>{if(first.current){first.current=false;return}window.scrollTo(0,0)},[name]);
  // Pages set their own title and description (src/seo.js); App covers the editor only.
  useEffect(()=>{if(route.kind==='editor')setPageMeta({title:`${route.modelId} 款｜銘版排版工作室`,description:'在銘版排版工作室編輯公版獎盃銘版：文字、圖片、對齊與圖層，預覽後下載排版確認 PDF。'})},[route.kind,route.modelId]);
  const EditorView=ready.editor||LazyEditor,ContentView=ready.content||LazyContent;
  const preview=id=>navigate(`#/preview/${id}`);
  // v75: the case admin (/admin/). Its own chunk; visitors never download it.
  if(route.kind==='admin')return <Suspense fallback={<div className="app-loading" style={{flexDirection:'column',gap:18}}><BrandLogo alt="" size={72} loop/>正在開啟案例後台…</div>}><LazyAdmin open={route.open}/></Suspense>;
  return route.kind==='home'?<Home onPreview={openStudio} section={route.section}/>:<Suspense fallback={<div className="app-loading" style={{flexDirection:'column',gap:18}}><BrandLogo alt="" size={72} loop/>正在開啟{route.kind==='editor'?'銘版排版工作室':'內容'}…</div>}>{route.kind==='editor'?<EditorView modelId={route.modelId} onModelChange={preview} onHome={()=>navigate('#/')}/>:<ContentView route={route}/>}</Suspense>;
}

