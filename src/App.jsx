import React,{lazy,Suspense,useEffect,useState} from 'react';
import Home from './components/Home.jsx';
import {setPageMeta} from './seo.js';
import {BrandLogo} from './components/site/ui.jsx';
const Editor=lazy(()=>import('./editor/Editor.jsx'));
const ContentSite=lazy(()=>import('./content/ContentSite.jsx'));
function readRoute(){const hash=window.location.hash;const m=hash.match(/^#\/preview\/([A-F])$/);if(m)return {kind:'editor',modelId:m[1]};if(hash.startsWith('#/read/'))return {kind:'read',path:hash.split('?')[0]};if(hash.startsWith('#/explore/')){const [category,query='']=hash.slice(10).split('?');return {kind:'explore',category,filter:new URLSearchParams(query).get('filter')||''}}if(hash==='#/brands')return {kind:'brands'};return {kind:'home'};}
export default function App(){
  const [route,setRoute]=useState(readRoute);
  useEffect(()=>{const listener=()=>{setRoute(readRoute());if(window.location.hash.startsWith('#/'))window.scrollTo(0,0)};window.addEventListener('hashchange',listener);return()=>window.removeEventListener('hashchange',listener)},[]);
  // Pages set their own title and description (src/seo.js); App covers the editor only.
  useEffect(()=>{if(route.kind==='editor')setPageMeta({title:`${route.modelId} 款銘版排版預覽`,description:'線上編輯公版獎盃銘版：文字、圖片、對齊與圖層，預覽後下載排版確認 PDF。'})},[route.kind,route.modelId]);
  const preview=id=>{window.location.hash=`/preview/${id}`};
  return route.kind==='home'?<Home onPreview={preview}/>:<Suspense fallback={<div className="app-loading" style={{flexDirection:'column',gap:18}}><BrandLogo alt="" size={72} loop/>正在開啟{route.kind==='editor'?'排版工作室':'內容'}…</div>}>{route.kind==='editor'?<Editor modelId={route.modelId} onModelChange={preview} onHome={()=>{window.location.hash='/';}}/>:<ContentSite route={route}/>}</Suspense>;
}

