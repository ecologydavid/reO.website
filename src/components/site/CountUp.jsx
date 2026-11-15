import React,{useEffect,useRef} from 'react';
// A figure that counts up to its value the first time it comes into view ("100+", "3", "1–2": the last number in
// the text runs, the rest stays). The markup always holds the final text (data-count too, which the prerenderer
// writes back), so search engines, screen readers and reduced-motion visitors get the real figure at once.
export default function CountUp({value,duration=1400}){
 const el=useRef(null),text=String(value);
 useEffect(()=>{
  const node=el.current,m=text.match(/^(.*?)(\d+)(\D*)$/);
  if(!node||!m||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const [,before,digits,after]=m,target=+digits;let frame=0,done=false;
  const run=()=>{const start=performance.now();const tick=now=>{const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,4);
    node.textContent=before+String(Math.round(target*eased)).padStart(digits.length>1&&digits[0]==='0'?digits.length:1,'0')+after;
    if(t<1)frame=requestAnimationFrame(tick);else node.textContent=text};frame=requestAnimationFrame(tick)};
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&!done){done=true;observer.disconnect();run()}},{threshold:.6});
  observer.observe(node);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);node.textContent=text};
 },[text,duration]);
 // The width is held by an invisible copy of the final text, so nothing shifts while the figure runs.
 return <span className="count-up"><span aria-hidden="true">{text}</span><span ref={el} data-count={text}>{text}</span></span>;
}
