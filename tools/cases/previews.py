from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
public = root / 'public'
out = public / 'assets/case-previews'
out.mkdir(exist_ok=True)
photos = ['assets/case-disney-hola.webp', 'content/images/3f4e62ca36347bf8e6.webp',
          'assets/case-ironman-clock.webp', 'content/images/556941054ff6b8fac1.webp',
          'assets/case-golden-horse.webp', 'assets/case-ase.webp']
manifest = {}
for photo in photos:
    source = public / photo
    with Image.open(source) as image:
        variants = []
        widths = (480, 800, 1440, image.width) if photo.endswith('case-ase.webp') else (320, 480, 720)
        for width in sorted(set(widths)):
            if width > image.width:
                continue
            stream = BytesIO()
            scaled = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
            scaled.save(stream, 'WEBP', quality=76, method=6)
            data = source.read_bytes() if width == image.width else stream.getvalue()
            name = f'{source.stem}-{width}-{sha256(data).hexdigest()[:12]}.webp'
            (out / name).write_bytes(data)
            variants.append([width, name])
        manifest[source.name] = variants
(root / 'src/data/case-previews.json').write_text(json.dumps(manifest, indent=2) + chr(10), encoding='utf-8')
