import React,{useCallback,useEffect,useRef,useState} from 'react';
import './ui.css';
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
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){observer.disconnect();play()}});
  observer.observe(box.current);
  return()=>{observer.disconnect();clearTimeout(timer.current);swap(logoStill)};
 },[loop,play,swap]);
 return <picture className={`rv-logo ${className}`} style={style} ref={box} onMouseEnter={play}><source srcSet={logoStill} media="(prefers-reduced-motion: reduce)"/><img src={src} alt={alt} width={size} height={size}/></picture>;
}
export function Chip({children}){return <span className="rv-chip" aria-hidden="true">{children||<ArrowIcon/>}</span>}
// Kept as `Arrow` so existing captions and sequence labels read the same.
export const Arrow=Chip;
export function Button({href,onClick,children,variant='dark',className='',icon,...props}){const Tag=href?'a':'button';return <Tag className={`rv-btn rv-btn-${variant} ${className}`} href={href} onClick={onClick} {...props}><span>{children}</span><Chip>{icon}</Chip></Tag>}
export function ArrowLink({href,onClick,children,className=''}){const Tag=href?'a':'button';return <Tag className={`rv-link ${className}`} href={href} onClick={onClick}><span>{children}</span><Chip/></Tag>}
export function RoundArrow({label,href,onClick}){const Tag=href?'a':'button';return <Tag className="rv-round" href={href} onClick={onClick} aria-label={label}><ArrowIcon/></Tag>}
export function SectionHead({index,label,en,title,link,id}){return <header className="rv-head" data-reveal>{en&&<p className="rv-display" aria-hidden="true">{en}</p>}<p className="rv-index"><span>{index}</span>{label}</p><h2 id={id}>{title}</h2>{link&&<ArrowLink href={link[1]}>{link[0]}</ArrowLink>}</header>}
export function Frame({src,alt,width,height,mark,className='',priority=false}){return <span className={`rv-frame ${className}`}><img src={src} alt={alt} width={width} height={height} loading={priority?undefined:'lazy'} fetchPriority={priority?'high':undefined}/>{mark&&<span className="rv-mark" aria-hidden="true">{mark}</span>}</span>}
