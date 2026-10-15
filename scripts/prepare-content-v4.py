"""Prepare audited source content and faithful web-sized original assets."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
from PIL import Image, ImageOps
import json, re, hashlib
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT.parent
source=json.loads((WORK/'research/data/content-migration-v4.json').read_text(encoding='utf-8'))
case_source=json.loads((WORK/'research/data/cases-v4.json').read_text(encoding='utf-8'))['cases']
material_source=json.loads((ROOT/'scripts/materials-v4.json').read_text(encoding='utf-8'))
material_data={x['slug']:x for x in material_source}
logo_source=json.loads((WORK/'research/data/logo-wall-v4.json').read_text(encoding='utf-8'))['logos']
OUT=ROOT/'public/content'; (OUT/'images').mkdir(parents=True,exist_ok=True); (OUT/'pages').mkdir(exist_ok=True)
paths={i['path'] for p in source['pages'] for i in p['images']}
paths.update(l['image_path'] for l in logo_source)
paths.update(i['path'] for c in case_source for i in c['gallery'])
mapped={}; errors=[]
def prepare(path):
 try:
  inp=WORK/path
  key=hashlib.sha1(path.encode()).hexdigest()[:18]
  if inp.suffix.lower()=='.svg':
   name=key+'.svg'; (OUT/'images'/name).write_bytes(inp.read_bytes());return path,{'src':'/content/images/'+name,'width':600,'height':400}
  with Image.open(inp) as raw:
   image=ImageOps.exif_transpose(raw).convert('RGBA' if 'A' in raw.getbands() else 'RGB')
   image.thumbnail((1440,1440),Image.Resampling.LANCZOS)
   name=key+'.webp'; dest=OUT/'images'/name
   if not dest.exists():image.save(dest,'WEBP',quality=82,method=4)
   return path,{'src':'/content/images/'+name,'width':image.width,'height':image.height}
 except Exception as e:errors.append((path,str(e)));return path,None
with ThreadPoolExecutor(max_workers=4) as pool:
 for path,entry in pool.map(prepare,sorted(paths)):mapped[path]=entry
def img(item):
 if not item:return None
 m=mapped.get(item.get('path') or item.get('image_path'))
 return {**m,'alt':item.get('alt',''),'caption':item.get('caption','')} if m else None
freq=Counter(i['path'] for p in source['pages'] for i in p['images'])
cases={c['source_url']:c for c in case_source}
def clean(text):return re.sub(r'\s+',' ',str(text)).strip()
def clean_title(title):
 title=clean(title)
 return re.sub(r'\s*[|｜]\s*re\.O.*$','',title,flags=re.I)
pages=[]; index=[]; route_by_url={}
for p in source['pages']:
 if not p['metadata'].get('derived'):
  for u in p.get('source_urls',[p['source_url']]):route_by_url[u]=p['path']
for p in source['pages']:
 seen=set();sections=[]
 for s in p['sections']:
  paragraphs=[]
  for text in s.get('paragraphs',[]):
   text=clean(text)
   if text and text not in seen and text not in ['案例','了解更多','更多資訊','Read More']:paragraphs.append(text);seen.add(text)
  items=list(dict.fromkeys(clean(t) for t in s.get('items',[]) if clean(t)))
  if paragraphs or items:sections.append({'heading':clean(s.get('heading','')),'paragraphs':paragraphs,'items':items})
 photos=[img(i) for i in p['images'] if freq[i['path']]<12 and img(i)]
 hero=img(p['hero']) or (photos[0] if photos else None)
 c=cases.get(p['source_url'])
 summary=clean(p['summary'])
 if c:
  sections=[{'heading':s['title'],'paragraphs':s['paragraphs'],'items':[]} for s in c['sections']]
  summary=c['intro'];photos=[img(i) for i in c['gallery'] if img(i)]
  # Prefer the approved clean photograph over source banners with embedded type.
  existing=ROOT/'public/assets'/('case-'+c['id']+'.webp')
  hero={'src':'/assets/case-'+c['id']+'.webp','width':1600,'height':1600 if c['id']=='ase' else 1200,'alt':c['safe_caption']} if existing.exists() else hero
  hero['alt']=c.get('cover_alt',hero['alt']);hero['caption']=c.get('cover_caption','')
 m=material_data.get(p['slug']) if p['category']=='materials' else None
 if m:
  material_index=next(x for x in source['pages'] if x['path']=='#/read/pages/material')
  old_hero=hero;hero=img(material_index['images'][m['image']]);hero['alt']=m['title']+'原材料';summary=m['summary']
  if old_hero and old_hero['src']!=hero['src']:photos=[old_hero]+photos
  sections=[{'heading':'材料與再製應用','paragraphs':[m['summary']],'items':[]}]+sections
 if hero:photos=[i for i in photos if i['src']!=hero['src']]
 photos=list({i['src']:i for i in photos}.values())
 links=[]
 for l in p.get('links',[]):
  target=route_by_url.get(l.get('source_url'),l.get('path'))
  if target in {x['path'] for x in source['pages']} and target!=p['path']:
   label=next((x['title'] for x in source['pages'] if x['path']==target),l['label']) if l['label'] in ['案例','了解更多','更多資訊'] else l['label']
   if target not in [x['path'] for x in links]:links.append({'path':target,'label':clean_title(label)})
 data={'id':p['id'],'path':p['path'],'title':clean_title(p['title']),'category':p['category'],'category_label':p['category_label'],'subcategory':p['subcategory'],'summary':summary,'hero':hero,'images':photos,'sections':sections,'metadata':p['metadata'],'links':links,'source_url':p['source_url'],'review_flags':p.get('review_flags',[]),'embedded_media':p.get('embedded_media',[]),'external_links':p.get('external_links',[])}
 if m:data['title']=m['title']
 if c:data.update(caseId=c['id'],title=c['safe_caption'],metadata={'client':c['client'],'year':c['year'],'material':'、'.join(c['materials']),'service':c['service_type']})
 pages.append(data)
 (OUT/'pages'/(p['id']+'.json')).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 index.append({k:data[k] for k in ['id','path','title','category','category_label','subcategory','summary','hero','metadata']})
for l in logo_source:
 l['image']=img({'path':l['image_path'],'alt':l['name']})
 l['href']=route_by_url.get(l['source_url'])
 if l['case_id'] in {c['id'] for c in case_source}:l['href']=route_by_url.get(next(c['source_url'] for c in case_source if c['id']==l['case_id']))
# Use verified project names beside brands whose commissioner differs.
logos=[{k:l.get(k) for k in ['id','name','relationship','project','display_note','image','href']} for l in logo_source]
(ROOT/'src/data/content-index.json').write_text(json.dumps({'pages':index,'aliases':route_by_url,'statistics':source['statistics']},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(ROOT/'src/data/logo-wall.json').write_text(json.dumps(logos,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({'pages':len(index),'logos':len(logos),'assets':len(paths),'errors':errors,'bytes':sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file())}))
import runpy
runpy.run_path(str(ROOT/'scripts/frame-logos-v4.py'))
