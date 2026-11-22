// v64 (owner, 2026-11-17): ordinary path URLs instead of hash routes, so every page is its own address for search
// engines and AI crawlers (they read one URL per page and do not run JavaScript; tools/prerender.mjs writes the HTML).
//
// Inside the app a route is still named by its old hash form ('#/read/pages/x', '#/explore/cases', '#/preview/B'):
// page data, navigation.js and every component keep those names. This module is the one place that turns a name into
// an address and back:
//   #/                      /
//   #/read/<path>           /<path>/            (the same paths the old re-o.co site used: /pages/x, /products/x, /blog/posts/x)
//   #/explore/<category>    /explore/<category>/
//   #/preview/<A–F>         /studio/<A–F>/
//   #/brands                /brands/
//   #/admin                 /admin/             (the case admin, v75; never prerendered or indexed)
// Links are converted where they are rendered (src/h.js). Old #/… links still open: they are rewritten on arrival.
import {useSyncExternalStore} from 'react';
const base=import.meta.env?.BASE_URL||'/';
// The single-file offline preview (file://, scripts/build-offline-preview.mjs) has no paths to route on: it keeps #/….
const offline=typeof window!=='undefined'&&window.location.protocol==='file:';
export function toPath(name){
 if(offline||typeof name!=='string'||!name.startsWith('#/'))return name;
 let [path,query]=name.slice(2).split('?');
 if(path.startsWith('read/'))path=path.slice(5);else if(path.startsWith('preview/'))path='studio/'+path.slice(8);
 path=path.replace(/\/+$/,'');
 return base+(path?path+'/':'')+(query?'?'+query:'');
}
export function fromLocation(loc){
 if(offline)return loc.hash.startsWith('#/')?loc.hash:'#/';
 if(loc.hash&&loc.hash.startsWith('#/')&&loc.hash.length>2)return loc.hash;
 let path=loc.pathname.startsWith(base)?loc.pathname.slice(base.length):loc.pathname.replace(/^\//,'');
 path=path.replace(/index\.html$/,'').replace(/\/+$/,'');
 const query=loc.search||'';
 if(!path)return '#/';
 if(path==='brands')return '#/brands';
 if(path==='admin')return '#/admin'+query;
 if(path.startsWith('explore/'))return '#/'+path+query;
 if(path.startsWith('studio/'))return '#/preview/'+path.slice(7);
 return '#/read/'+path+query;
}
const browser=typeof window!=='undefined';
let current=browser?fromLocation(window.location):'#/';
const listeners=new Set();
const emit=()=>{const next=fromLocation(window.location);if(next===current)return;current=next;listeners.forEach(f=>f(current))};
const revisit=()=>window.dispatchEvent(new Event('route-revisit'));
export const currentRoute=()=>current;
export function subscribe(f){listeners.add(f);return()=>listeners.delete(f)}
export function useRoute(){return useSyncExternalStore(subscribe,currentRoute,currentRoute)}
export function navigate(name,{replace=false}={}){if(name===current){revisit();return}if(offline){window.location.hash=name.slice(1);return}window.history[replace?'replaceState':'pushState'](null,'',toPath(name));emit()}
if(offline){
 window.addEventListener('hashchange',emit);
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[href]');
  if(link?.getAttribute('href')===current&&(!link.target||link.target==='_self')&&!link.hasAttribute('download')){event.preventDefault();revisit()}
 });
}
else if(browser){
 // An old hash link (#/read/…) arrives: show the same page at its new address.
 if(window.location.hash.startsWith('#/'))window.history.replaceState(null,'',toPath(window.location.hash));
 window.addEventListener('popstate',emit);
 // In-site links change the address without reloading. Left alone: new tabs, downloads, modified clicks, other
 // sites, files (anything with an extension) and links a component already handled.
 document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest?.('a[href]');
  if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download')||a.origin!==window.location.origin)return;
  if(!a.pathname.startsWith(base)||/\.[a-z0-9]{2,5}$/i.test(a.pathname))return;
  if(a.pathname===window.location.pathname&&a.search===window.location.search&&a.hash)return;
  e.preventDefault();
  if(a.pathname===window.location.pathname&&a.search===window.location.search){revisit();return}
  window.history.pushState(null,'',a.pathname+a.search);
  emit();
 });
}
