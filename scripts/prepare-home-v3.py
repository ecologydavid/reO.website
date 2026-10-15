"""Faithfully resize original official photos for delivery, without retouching."""
from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parents[1]
RESEARCH=ROOT.parent/'research'
OUT=ROOT/'public/assets'
j=json.loads((RESEARCH/'data/brand-content-v3.json').read_text(encoding='utf-8'))
cases=[]
for c in j['cases']:
 p=ROOT.parent/c['photos'][0]['path']
 if c['id']=='pinkoi':p=RESEARCH/'assets/692d2bcc2289fd0e1ee95c19.jpg'
 if c['id']=='marvel-hola':p=RESEARCH/'assets/692814d2214ad63272e35404.jpg'
 image=Image.open(p).convert('RGB');image.thumbnail((2400,2400),Image.Resampling.LANCZOS)
 name='case-'+c['id']+'.webp';image.save(OUT/name,'WEBP',quality=88,method=6)
 entry={k:c[k] for k in ['id','brand','project','year','relationship','safe_caption','source_url','materials','story']}
 entry['photo']='/assets/'+name;entry['originalPhoto']=p.relative_to(ROOT.parent).as_posix()
 if c.get('logo'):
  logo=Image.open(ROOT.parent/c['logo']);logo.thumbnail((450,200),Image.Resampling.LANCZOS);logoName='client-'+c['id']+'.webp';logo.save(OUT/logoName,'WEBP',quality=90);entry['logo']='/assets/'+logoName
 cases.append(entry)
for id in 'ABCDEF':
 image=Image.open(OUT/f'product-{id}.jpg').convert('RGB');image.thumbnail((1200,1200),Image.Resampling.LANCZOS);image.save(OUT/f'catalogue-{id}.webp','WEBP',quality=88)
 image.thumbnail((360,360),Image.Resampling.LANCZOS);image.save(OUT/f'product-thumb-{id}.webp','WEBP',quality=86)
for source,name in [('697ae38e93c21d05531cf90f.webp','craft-hands'),('69a51b8152c59c9ec1e9b881.jpg','craft-workbench')]:
 image=Image.open(RESEARCH/'assets'/source).convert('RGB');image.thumbnail((1800,1800),Image.Resampling.LANCZOS);image.save(OUT/(name+'.webp'),'WEBP',quality=88)
(ROOT/'src/data/brand-cases.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2),encoding='utf-8')
print('Prepared authentic cases, logos, craft photos and A-F responsive catalogue images')

