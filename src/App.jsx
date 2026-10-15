import React,{lazy,Suspense,useEffect,useState} from 'react';
import Home from './components/Home.jsx';
const Editor=lazy(()=>import('./editor/Editor.jsx'));
function readRoute(){const m=window.location.hash.match(/^#\/preview\/([A-F])$/);return m?m[1]:null;}
export default function App(){
  const [modelId,setModelId]=useState(readRoute);
  useEffect(()=>{const listener=()=>{setModelId(readRoute());if(window.location.hash.startsWith('#/'))window.scrollTo(0,0)};window.addEventListener('hashchange',listener);return()=>window.removeEventListener('hashchange',listener)},[]);
  useEffect(()=>{document.title=modelId?`re.O｜${modelId} 款銘版排版預覽`:'re.O｜讓榮耀，循環而生。'},[modelId]);
  const preview=id=>{window.location.hash=`/preview/${id}`};
  return modelId?<Suspense fallback={<div className="app-loading">正在開啟排版工作室…</div>}><Editor modelId={modelId} onModelChange={preview} onHome={()=>{window.location.hash='/';}}/></Suspense>:<Home onPreview={preview}/>;
}
