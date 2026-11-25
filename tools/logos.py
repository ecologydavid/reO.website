# Partner marks for the brand wall, all made to one rule (v1.5.0, by request).
#
#   python -I -X utf8 tools/logos.py            every mark in src/data/logo-wall.json
#   python -I -X utf8 tools/logos.py delta ase  only these ids
#
# Why: the wall drew each source file (banners of every size, with white margins, grey plates, a red field) into the
# same wide strip, fitted by its outer box. A square mark was held to the strip's height and came out small; a long
# wordmark filled the width and came out large; marks with thin lettering looked fainter still. The owner asked for
# one comfortable size for all, and the same rule for every mark added later (2026-11-26).
#
# What this does, for every mark:
#   1. Background off. A transparent source keeps its alpha. Otherwise the plate colour (`image.background`, or read
#      from the picture's border) is removed and antialiased edges are un-mixed from it, so no white or grey fringe is
#      left. `image.matteMode: "monochrome"` (DCC: black and white ink on a red field) keeps the ink as one dark shape.
#   2. Trimmed to the ink itself (inside `image.bounds` when the source holds more than the mark).
#   3. Sized by AREA, not by its box: every mark covers the same area of the tile, so a square emblem and a long
#      wordmark carry the same visual weight (width = √(area × ratio), height = √(area ÷ ratio)).
#      Then two corrections:
#        - weight: a mark of thin lines or small lettering reads lighter than a solid block of the same area, so it
#          is drawn up to 18% larger and a solid block up to 12% smaller (from the share of its box that is ink);
#        - limits: never wider than 68% of the tile or taller than 46% of it (very long wordmarks meet the width limit).
#   4. Centred on a transparent 5:4 canvas (the tile's shape), 640 × 512, saved as public/assets/logos/<id>.webp.
#      The tile shows the canvas whole, so the size is decided here and nowhere else.
#
# Adding a partner: add its entry to logo-wall.json with `image.src` (the largest clean file available, on a plain
# background or transparent; `bounds` [x, y, w, h] only if the file holds more than the mark), run this script, look at
# the sheet it writes (.cache/logos-sheet.png) and commit. Do not size a mark by hand in CSS.
# A source smaller than the size it is drawn at is listed as "enlarged": ask the partner for a vector or larger file.
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
data_file = root / 'src/data/logo-wall.json'
out_dir = root / 'public/assets/logos'
CANVAS = (640, 512)                      # 5:4, the tile's shape; about 2.8 times the largest tile on screen
AREA = (0.39 * CANVAS[1]) ** 2           # a square mark is 39% of the tile's height
MAX_W, MAX_H = 0.68 * CANVAS[0], 0.46 * CANVAS[1]
INK = 0.28                               # the share of ink in its box at which a mark is drawn at exactly AREA

def plate(rgb):
    """The background colour: the commonest colour along the picture's border."""
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]).astype(np.int32)
    keys, counts = np.unique((edge // 4) * 4 + 2, axis=0, return_counts=True)
    return keys[counts.argmax()].tolist()

def cut_out(im, background, mode):
    """RGBA with the plate removed (the browser code this replaces did the same: clearMatte in brandArtwork.js)."""
    rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
    rgb, alpha = rgba[..., :3], rgba[..., 3] / 255
    if alpha.min() < 0.98:                                   # the source is already cut out
        return np.dstack([rgb, alpha * 255]).astype(np.uint8)
    bg = np.array(background if background else plate(rgb), np.float32)
    distance = np.abs(rgb - bg).max(axis=2)
    if mode == 'monochrome':
        # Black and white ink on a coloured field: how far each pixel has moved from the field towards either ink.
        light = rgb[..., 1] + rgb[..., 2] > bg[1] + bg[2] + 20
        towards_white = ((rgb - bg) / np.maximum(255 - bg, 1)).max(axis=2)
        towards_black = ((bg - rgb) / np.maximum(bg, 1)).max(axis=2)
        cover = np.clip(np.where(light, towards_white, towards_black), 0, 1)
        cover[distance <= 12] = 0
        ink = np.zeros_like(rgb)                             # one dark shape, as the wall has shown it since v29
        return np.dstack([ink, cover * 255 * 0.78]).astype(np.uint8)
    cover = np.clip((distance - 12) / 30, 0, 1)
    # Un-mix the antialiased edge from the plate, so no fringe of the old background is left.
    safe = np.maximum(cover, 1e-3)[..., None]
    colour = np.where(cover[..., None] < 1, (rgb - bg * (1 - safe)) / safe, rgb)
    return np.dstack([np.clip(colour, 0, 255), cover * alpha * 255]).astype(np.uint8)

def make(logo):
    image = logo['image']
    im = Image.open(root / 'public' / image['src'].lstrip('/'))
    if image.get('bounds'):
        x, y, w, h = image['bounds']
        pad = 6                                              # a little room, so the trim below finds the true edge
        im = im.crop((max(0, x - pad), max(0, y - pad), min(im.width, x + w + pad), min(im.height, y + h + pad)))
    art = cut_out(im, image.get('background'), image.get('matteMode'))
    solid = art[..., 3] > 40
    if not solid.any():
        raise SystemExit(f"{logo['id']}: nothing left after removing the background")
    rows, cols = np.where(solid.any(axis=1))[0], np.where(solid.any(axis=0))[0]
    art = art[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]
    h, w = art.shape[:2]
    ratio, ink = w / h, float(art[..., 3].mean() / 255)
    weight = min(1.18, max(0.88, (INK / max(ink, 0.02)) ** 0.25))
    tw, th = (AREA * ratio) ** 0.5 * weight, (AREA / ratio) ** 0.5 * weight
    fit = min(1, MAX_W / tw, MAX_H / th)
    tw, th = max(1, round(tw * fit)), max(1, round(th * fit))
    mark = Image.fromarray(art, 'RGBA').resize((tw, th), Image.LANCZOS)
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(mark, ((CANVAS[0] - tw) // 2, (CANVAS[1] - th) // 2))
    out_dir.mkdir(parents=True, exist_ok=True)
    canvas.save(out_dir / f"{logo['id']}.webp", 'WEBP', quality=92, method=6, exact=False)
    logo['mark'] = {'src': f"/assets/logos/{logo['id']}.webp", 'width': CANVAS[0], 'height': CANVAS[1]}
    return {'id': logo['id'], 'source': (w, h), 'drawn': (tw, th), 'ratio': ratio, 'ink': ink, 'weight': weight, 'limited': fit < 1, 'enlarged': tw / w}, canvas

only = set(sys.argv[1:])
logos = json.loads(data_file.read_text(encoding='utf8'))
made = [(logo, *make(logo)) for logo in logos if not only or logo['id'] in only]
raw = data_file.read_text(encoding='utf8')
data_file.write_text(json.dumps(logos, ensure_ascii=False, indent=2 if raw.startswith('[\n') else None, separators=None if raw.startswith('[\n') else (',', ':')) + ('\n' if raw.endswith('\n') else ''), encoding='utf8')

# A sheet to look at: every mark on its tile (white, or ink for marks drawn in white), in the wall's eight columns.
dark = {'muke'}
cell = (CANVAS[0] // 2, CANVAS[1] // 2)
sheet = Image.new('RGB', (8 * (cell[0] + 8) + 8, ((len(made) + 7) // 8) * (cell[1] + 8) + 8), '#f4f2ec')
for i, (logo, info, canvas) in enumerate(made):
    tile = Image.new('RGBA', CANVAS, '#1f2320' if logo['id'] in dark else '#ffffff')
    tile.alpha_composite(canvas)
    sheet.paste(tile.convert('RGB').resize(cell, Image.LANCZOS), (8 + (i % 8) * (cell[0] + 8), 8 + (i // 8) * (cell[1] + 8)))
(root / '.cache').mkdir(exist_ok=True)
sheet.save(root / '.cache/logos-sheet.png')
for logo, info, _ in made:
    note = ('  at the size limit' if info['limited'] else '') + (f"  ENLARGED ×{info['enlarged']:.2f}: ask for a larger file" if info['enlarged'] > 1.15 else '')
    print(f"{info['id']:<16} source {info['source'][0]:>4}×{info['source'][1]:<4} ratio {info['ratio']:>5.2f}  ink {info['ink']:.2f}  weight ×{info['weight']:.2f}  drawn {info['drawn'][0]}×{info['drawn'][1]}{note}")
print(f"{len(made)} marks → {out_dir.relative_to(root)}; sheet: .cache/logos-sheet.png")
