from pathlib import Path
from PIL import Image, ImageChops
import json
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'src/data/logo-wall.json';logos=json.loads(p.read_text(encoding='utf-8'))
for logo in logos:
 original=Image.open(ROOT/'public'/logo['image']['src'].lstrip('/')).convert('RGBA')
 alpha=original.getchannel('A')
 if alpha.getextrema()[0]<20:
  mask=alpha.point(lambda v:255 if v>20 else 0)
 else:
  im=original.convert('RGB')
  difference=ImageChops.difference(im,Image.new('RGB',im.size,im.getpixel((0,0))))
  channels=difference.split();mask=ImageChops.lighter(ImageChops.lighter(channels[0],channels[1]),channels[2]).point(lambda v:255 if v>38 else 0)
 b=mask.getbbox()
 if b:logo['image']['bounds']=[b[0],b[1],b[2]-b[0],b[3]-b[1]]
p.write_text(json.dumps(logos,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Measured artwork bounds for40 unchanged source logos')
