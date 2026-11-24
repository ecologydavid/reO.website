import React,{useCallback,useEffect,useRef,useState} from 'react';
import {toPath} from '../../router.js';
import './ui.css';
import './type.css';
import './refine-v63.css';
import './facts-v64.css';
import './refine-v65.css';
import './refine-v71.css';
// V11 shared vocabulary: a compact arrow that always sits in a round chip, pill buttons, and display headings.
export function ArrowIcon(){return <svg className="rv-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
export function MenuIcon({open=false}){return <svg className="rv-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d={open?'m4 4 8 8M12 4l-8 8':'M2.5 5.5h11M2.5 10.5h11'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
// The animated GIF is the brand mark. It erases and redraws itself every 1.8s, so a permanent loop
// would leave the logo half-drawn most of the time. Instead it draws once when it comes into view
// and again on hover, then rests on its own final frame. `loop` keeps it running (loading screens).
const logoMotion='/assets/reo-logo-motion.gif',logoStill='/assets/reo-logo-still.png',drawMs=1800;
let motionBlob;
// Every playback needs a fresh object URL; browsers share one timeline per URL and would not restart.
async function freshMotion(){motionBlob??=fetch(logoMotion).then(r=>r.blob());return URL.createObjectURL(await motionBlob)}
export function BrandLogo({className='',alt='re.O',size=100,style,loop=false}){
 const box=useRef(null),timer=useRef(0),[src,setSrc]=useState(loop?logoMotion:logoStill);
 const swap=useCallback(next=>setSrc(old=>{if(old.startsWith('blob:'))URL.revokeObjectURL(old);return next}),[]);
 const play=useCallback(async()=>{
  if(loop||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const url=await freshMotion().catch(()=>null);if(!url)return;
  clearTimeout(timer.current);swap(url);timer.current=setTimeout(()=>swap(logoStill),drawMs);
 },[loop,swap]);
 useEffect(()=>{
  if(loop)return;
  // v1.2.1: the first automatic drawing waits until the page has loaded, so the GIF never competes with the photos.
  let live=true;const later=()=>{if(live)play()};
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){observer.disconnect();if(document.readyState==='complete')later();else window.addEventListener('load',()=>setTimeout(later,400),{once:true})}});
  observer.observe(box.current);
  return()=>{live=false;observer.disconnect();clearTimeout(timer.current);swap(logoStill)};
 },[loop,play,swap]);
 return <picture className={`rv-logo ${className}`} style={style} ref={box} onMouseEnter={play}><source srcSet={logoStill} media="(prefers-reduced-motion: reduce)"/><img src={src} alt={alt} width={size} height={size}/></picture>;
}
// v59 (owner, 2026-11-11): action buttons carry an icon that says what they do (mail, phone, questions, the
// studio); every other button keeps the arrow. Same 16px grid and 1.5 stroke as ArrowIcon.
const actionPaths={
 mail:<><rect x="2.25" y="3.75" width="11.5" height="8.5" rx="1.5"/><path d="m2.75 4.75 5.25 4 5.25-4"/></>,
 phone:<path d="M5.4 2.5H3.7a1.2 1.2 0 0 0-1.2 1.3c.35 5.2 4.5 9.35 9.7 9.7a1.2 1.2 0 0 0 1.3-1.2v-1.7a1 1 0 0 0-.75-.95l-2-.55a1 1 0 0 0-1 .3l-.75.8a7.2 7.2 0 0 1-3.4-3.4l.8-.75a1 1 0 0 0 .3-1l-.55-2a1 1 0 0 0-.95-.75Z"/>,
 faq:<><circle cx="8" cy="8" r="5.75"/><path d="M6.3 6.5a1.75 1.75 0 0 1 3.4.6c0 1.15-1.7 1.45-1.7 2.55"/><path d="M8 11.6v.01" strokeWidth="2"/></>,
 studio:<><path d="M10.3 3.2 12.8 5.7 5.7 12.8H3.2V10.3Z"/><path d="m8.8 4.7 2.5 2.5"/></>
};
export function ActionIcon({name}){return <svg className="rv-icon is-action" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{actionPaths[name]}</svg>}
export const iconFor=href=>href.startsWith('mailto:')?<ActionIcon name="mail"/>:href.startsWith('tel:')?<ActionIcon name="phone"/>:href.includes('pages/faq')?<ActionIcon name="faq"/>:href.startsWith('#/preview/')?<ActionIcon name="studio"/>:undefined;
export function Chip({children}){return <span className="rv-chip" aria-hidden="true">{children||<ArrowIcon/>}</span>}
// Kept as `Arrow` so existing captions and sequence labels read the same.
export const Arrow=Chip;
export function Button({href,onClick,children,variant='dark',className='',icon,...props}){const Tag=href?'a':'button';return <Tag className={`rv-btn rv-btn-${variant} ${className}`} href={href} onClick={onClick} {...props}><span>{children}</span><Chip>{icon}</Chip></Tag>}
export function ArrowLink({href,onClick,children,className=''}){const Tag=href?'a':'button';return <Tag className={`rv-link ${className}`} href={href} onClick={onClick}><span>{children}</span><Chip/></Tag>}
export function RoundArrow({label,href,onClick}){const Tag=href?'a':'button';return <Tag className="rv-round" href={href} onClick={onClick} aria-label={label}><ArrowIcon/></Tag>}
export function SectionHead({index,label,en,title,link,id}){return <header className="rv-head" data-reveal>{en&&<p className="rv-display" aria-hidden="true">{en}</p>}<p className="rv-index"><span>{index}</span>{label}</p><h2 id={id}>{title}</h2>{link&&<ArrowLink href={link[1]}>{link[0]}</ArrowLink>}</header>}
export function Frame({src,alt,width,height,mark,className='',priority=false}){return <span className={`rv-frame ${className}`}><img src={src} alt={alt} width={width} height={height} loading={priority?undefined:'lazy'} fetchPriority={priority?'high':undefined}/>{mark&&<span className="rv-mark" aria-hidden="true">{mark}</span>}</span>}

// The plaque studio always opens in its own tab (owner, 2026-11-07): links spread studioTab, buttons call openStudio.
// Switching models inside the studio stays in that tab.
export const studioTab={target:'_blank',rel:'noopener'};
export function openStudio(id){window.open(toPath(`#/preview/${id}`),'_blank','noopener')}
