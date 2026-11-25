// Build step for photos (v1.2.2), run by tools/prerender.mjs on the built site before any page is rendered.
//
// 1. Names that follow the content. A photo in /assets/ keeps its name when it is replaced, so a visitor's browser
//    would go on showing the old one for as long as it is cached. Each such photo is copied to
//    /i/assets/<name>.<hash of its bytes>.<ext>, and every place the built site names it (scripts, styles, the shell,
//    page data) is pointed at the copy. Replace the photo and its address changes with it; /i/ can then be cached
//    for a year. The original file stays where it was: the case admin, addresses built in code
//    (`/assets/catalogue-${id}.webp`) and old links still use it.
// 2. A small copy of every photo for phones: 800px wide WebP beside the original's name, "-800.webp"
//    (/i/content/images/<name>-800.webp, /i/assets/<name>.<hash>-800.webp). src/components/site/responsive.js
//    offers it to the browser (srcset). EVERY photo gets one, also those already small (then it is a plain copy),
//    so a page can never point at a small copy that does not exist.
//    Resizing is done by the same headless Chrome that renders the pages, so the build needs no image library.
//    Finished copies are kept in .cache/images (restored between builds on GitHub), so only new photos cost time.
//
// If the recipe changes (size, quality), change SUFFIX here and in responsive.js: the addresses are cached for a year.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SUFFIX = '-800.webp', WIDTH = 800;
const raster = /\.(webp|png|jpe?g)$/i, picture = /\.(webp|png|jpe?g|gif|svg)$/i;
const walk = dir => fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]) : [];
const web = (root, file) => path.relative(root, file).split(path.sep).join('/');

// Every "/assets/….ext" that is a whole address on its own (not the tail of a longer one such as
// https://site/assets/x or /i/assets/x) and is in the map is replaced.
const ref = /(?<![\w.\-])\/assets\/[\w\-.\/%~()@+]+?\.(?:webp|png|jpe?g|gif|svg)(?![\w\-.])/gi;
export const rewriteRefs = (text, map) => text.replace(ref, m => map.get(m) || m);

export function hashAssets(dist) {
  const map = new Map(), from = path.join(dist, 'assets');
  for (const file of walk(from)) {
    const rel = web(dist, file);                                   // assets/case-pinkoi.webp
    // Already named by content, or too large to keep twice (the studio's product photos).
    if (!picture.test(rel) || rel.startsWith('assets/case-previews/') || fs.statSync(file).size > 2.5 * 1024 * 1024) continue;
    const data = fs.readFileSync(file), ext = path.extname(rel);
    const to = `i/${rel.slice(0, -ext.length)}.${crypto.createHash('sha1').update(data).digest('hex').slice(0, 10)}${ext}`;
    fs.mkdirSync(path.dirname(path.join(dist, to)), {recursive: true});
    fs.writeFileSync(path.join(dist, to), data);
    map.set('/' + rel, '/' + to);
  }
  let changed = 0;
  const texts = [...walk(path.join(dist, 'app')).filter(f => /\.(js|css)$/.test(f)), ...walk(path.join(dist, 'content', 'pages')).filter(f => f.endsWith('.json')), path.join(dist, 'index.html')];
  for (const file of texts) {
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, 'utf8'), after = rewriteRefs(before, map);
    if (after !== before) { fs.writeFileSync(file, after); changed++; }
  }
  return {photos: map.size, files: changed};
}

// Runs in the page: fetch each photo, draw it 800px wide, hand back WebP bytes (base64), or 'same' when the photo
// is already a WebP no wider than that.
const inPage = urls => `Promise.all(${JSON.stringify(urls)}.map(async u=>{try{const b=await (await fetch(u)).blob();const bmp=await createImageBitmap(b);if(bmp.width<=${WIDTH}&&b.type==='image/webp')return 'same';const s=Math.min(1,${WIDTH}/bmp.width),w=Math.round(bmp.width*s),h=Math.round(bmp.height*s);const c=new OffscreenCanvas(w,h),x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(bmp,0,0,w,h);const o=new Uint8Array(await (await c.convertToBlob({type:'image/webp',quality:.8})).arrayBuffer());let t='';for(let i=0;i<o.length;i+=32768)t+=String.fromCharCode.apply(null,o.subarray(i,i+32768));return btoa(t)}catch(e){return 'error '+e.message}}))`;

export async function smallCopies({dist, root, origin, base, send, evaluate}) {
  const cache = path.join(root, '.cache', 'images'), started = Date.now();
  const sources = [...walk(path.join(dist, 'content', 'images')), ...walk(path.join(dist, 'i', 'assets'))].filter(f => raster.test(f) && !f.endsWith(SUFFIX));
  const jobs = sources.map(file => {
    const rel = web(dist, file), out = (rel.startsWith('i/') ? rel : 'i/' + rel).replace(raster, SUFFIX);
    return {file, url: origin + base + rel.split('/').map(encodeURIComponent).join('/'), out: path.join(dist, out), kept: path.join(cache, out)};
  });
  const todo = [];
  for (const j of jobs) {
    fs.mkdirSync(path.dirname(j.out), {recursive: true});
    if (fs.existsSync(j.kept)) fs.copyFileSync(j.kept, j.out); else todo.push(j);
  }
  let failed = 0;
  if (todo.length) {
    await send('Page.navigate', {url: origin + base + 'robots.txt'});
    await new Promise(r => setTimeout(r, 500));
    for (let i = 0; i < todo.length; i += 8) {
      const part = todo.slice(i, i + 8), made = await evaluate(inPage(part.map(j => j.url))) || [];
      part.forEach((j, k) => {
        const r = made[k];
        if (!r || r.startsWith('error')) { failed++; fs.copyFileSync(j.file, j.out); return; }   // the original stands in
        const data = r === 'same' ? fs.readFileSync(j.file) : Buffer.from(r, 'base64');
        fs.mkdirSync(path.dirname(j.kept), {recursive: true});
        fs.writeFileSync(j.kept, data); fs.writeFileSync(j.out, data);
      });
    }
  }
  return {photos: jobs.length, made: todo.length, failed, seconds: Math.round((Date.now() - started) / 1000)};
}

// ── Share cards (v1.3.0) ──────────────────────────────────────────────────────────────────────────────────────
// A link pasted into LINE, Facebook or Slack shows the page's og:image. Every page used to show the same picture
// (the E trophy). Each page that names its own photo (src/seo.js setPageMeta `image`) now gets a 1200×630 JPEG made
// from it: these services expect that shape and do not all read WebP.
// The photo is fitted by HEIGHT and centred, so the piece is never cut top or bottom. A photo wider than the card
// loses only its far sides. A narrower one (most are 4:3 or square) leaves bands at the sides, filled from the photo
// itself, never with a flat colour or a mirrored copy (owner rule):
//   - plain edges (studio backdrops, the usual case): the band continues the photo's own edge, lightly blurred next
//     to the photo and fading into a blur along the seam farther out, so the backdrop simply runs on;
//   - busy edges (shelves, outdoor scenes, material close-ups), where carrying the edge outward would draw streaks:
//     the whole photo, enlarged and blurred, lies behind it.
// Named by the photo's bytes and this recipe, kept in .cache/images like the small copies.
const CARD = 'c2', CW = 1200, CH = 630;
const cardInPage = urls => `Promise.all(${JSON.stringify(urls)}.map(async u=>{try{
 const bmp=await createImageBitmap(await (await fetch(u)).blob());
 const W=${CW},H=${CH},c=new OffscreenCanvas(W,H),x=c.getContext('2d');x.imageSmoothingQuality='high';
 x.fillStyle='#f4f1e9';x.fillRect(0,0,W,H);
 const w=Math.round(bmp.width*H/bmp.height),x0=Math.round((W-w)/2);
 if(x0>0){
  const e=Math.max(2,Math.round(bmp.width*.004)),band=x0+2,pad=140;
  // How much the photo changes along each side edge: mean and large steps of brightness between neighbouring rows.
  const busy=sx=>{const s=new OffscreenCanvas(2,200),g=s.getContext('2d',{willReadFrequently:true});g.drawImage(bmp,sx,0,e,bmp.height,0,0,2,200);const d=g.getImageData(0,0,1,200).data;let sum=0,steps=0,last=null;for(let i=0;i<200;i++){const l=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];if(last!=null){const k=Math.abs(l-last);sum+=k;if(k>14)steps++}last=l}return sum/199>2.6||steps>5};
  if(busy(0)||busy(bmp.width-e)){
   const s=Math.max(W/bmp.width,H/bmp.height)*1.25,bw=bmp.width*s,bh=bmp.height*s;
   x.filter='blur(34px)';x.drawImage(bmp,(W-bw)/2,(H-bh)/2,bw,bh);x.filter='none';
   x.fillStyle='rgba(244,241,233,.16)';x.fillRect(0,0,W,H);
  }else for(const side of [0,1]){
   const sx=side?bmp.width-e:0,dx=side?W-band:0;
   // The edge strip at its true height, with its first and last rows carried into a margin so a blur near the
   // top or bottom of the card reads photo, not empty canvas.
   const raw=new OffscreenCanvas(band+2*pad,H+2*pad),r=raw.getContext('2d');
   r.drawImage(bmp,sx,0,e,1,0,0,band+2*pad,pad+1);r.drawImage(bmp,sx,bmp.height-1,e,1,0,pad+H-1,band+2*pad,pad+1);r.drawImage(bmp,sx,0,e,bmp.height,0,pad,band+2*pad,H);
   const soft=px=>{const o=new OffscreenCanvas(band+2*pad,H+2*pad),g=o.getContext('2d');g.filter='blur('+px+'px)';g.drawImage(raw,0,0);return o};
   const near=soft(5),far=soft(46),fg=far.getContext('2d');
   fg.filter='none';fg.globalCompositeOperation='destination-in';
   const g=fg.createLinearGradient(pad+(side?0:band),0,pad+(side?band:0),0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.1,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');
   fg.fillStyle=g;fg.fillRect(0,0,band+2*pad,H+2*pad);
   x.drawImage(near,pad,pad,band,H,dx,0,band,H);x.drawImage(far,pad,pad,band,H,dx,0,band,H);
  }
 }
 x.drawImage(bmp,x0,0,w,H);
 const o=new Uint8Array(await (await c.convertToBlob({type:'image/jpeg',quality:.86})).arrayBuffer());
 let t='';for(let i=0;i<o.length;i+=32768)t+=String.fromCharCode.apply(null,o.subarray(i,i+32768));return btoa(t)
}catch(e){return 'error '+e.message}}))`;

// sources: site-relative addresses of the photos pages named ('content/images/x.webp'). Returns Map(source → 'og/<name>.jpg');
// a photo that could not be drawn is left out, and its page keeps the site-wide picture.
export async function shareCards({dist, root, origin, base, send, evaluate, sources}) {
  const cache = path.join(root, '.cache', 'images', 'og'), done = new Map(), todo = [];
  for (const rel of new Set(sources)) {
    const file = path.join(dist, rel);
    if (!raster.test(rel) || !file.startsWith(dist) || !fs.existsSync(file)) continue;
    const name = `og/${crypto.createHash('sha1').update(fs.readFileSync(file)).update(CARD).digest('hex').slice(0, 14)}.jpg`;
    const job = {rel, name, out: path.join(dist, name), kept: path.join(cache, path.basename(name)), url: origin + base + rel.split('/').map(encodeURIComponent).join('/')};
    fs.mkdirSync(path.dirname(job.out), {recursive: true});
    if (fs.existsSync(job.kept)) { fs.copyFileSync(job.kept, job.out); done.set(rel, name); } else todo.push(job);
  }
  let failed = 0;
  if (todo.length) {
    await send('Page.navigate', {url: origin + base + 'robots.txt'});
    await new Promise(r => setTimeout(r, 500));
    for (let i = 0; i < todo.length; i += 6) {
      const part = todo.slice(i, i + 6), made = await evaluate(cardInPage(part.map(j => j.url))) || [];
      part.forEach((j, k) => {
        const r = made[k];
        if (!r || r.startsWith('error')) { failed++; return; }
        const data = Buffer.from(r, 'base64');
        fs.mkdirSync(path.dirname(j.kept), {recursive: true});
        fs.writeFileSync(j.kept, data); fs.writeFileSync(j.out, data); done.set(j.rel, j.name);
      });
    }
  }
  return {cards: done, made: todo.length - failed, failed};
}
