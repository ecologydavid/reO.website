import {useCallback,useRef,useState} from 'react';
export default function useHistory(initial) {
  const [state,setState]=useState(initial),[past,setPast]=useState([]),[future,setFuture]=useState([]);
  const current=useRef(state);current.current=state;
  const change=useCallback((next,{record=true}={})=>{
    const previous=current.current,value=typeof next==='function'?next(previous):next;
    if(record){setPast(p=>[...p.slice(-39),previous]);setFuture([]);}
    current.current=value;setState(value);
  },[]);
  const checkpoint=useCallback(()=>{const snapshot=current.current;setPast(p=>[...p.slice(-39),snapshot]);setFuture([])},[]);
  // Capture before changing the ref: React may evaluate queued updaters later.
  const undo=()=>{if(!past.length)return;const previous=current.current,next=past[past.length-1];setFuture(f=>[previous,...f]);setPast(p=>p.slice(0,-1));current.current=next;setState(next)};
  const redo=()=>{if(!future.length)return;const previous=current.current,next=future[0];setPast(p=>[...p,previous]);setFuture(f=>f.slice(1));current.current=next;setState(next)};
  const getState=useCallback(()=>current.current,[]);
  return {state,getState,change,checkpoint,undo,redo,canUndo:past.length>0,canRedo:future.length>0};
}
