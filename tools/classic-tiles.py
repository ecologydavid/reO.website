# Classic photos framed for their frames on the home page (v1.2.3, by request: the piece centred, not against the edge).
#
#   python -I tools/classic-tiles.py
#
# The catalogue photos are 4:3. The home page shows them in tall cells (desktop Classic grid, about 4:5) and in
# square cards (hero A to E), where a plain centre crop put B and E off centre and D against the sides.
# For each photo below the piece's box is given by hand (fractions of the photo); the frame is placed around it so
# the piece sits in the middle and fills `fill` of the frame's tighter side. Where the frame reaches past the photo,
# the photo's own edge is carried outward and softened (background only: never mirrored, nothing invented).
from pathlib import Path
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1] / 'public'
#        source photo                              piece box: x0, y0, x1, y1
photos = {
    'B': ('assets/catalogue-B.webp',               (.47, .08, .77, .93)),
    'D': ('content/images/0ec85ee98fb1103204.webp', (.22, .13, .785, .88)),
    'E': ('assets/hero-wide.webp',                  (.205, .31, .685, .87)),
}
#        output name            photo  width:height  fill   size
jobs = [('classic-B-tall.webp',  'B', 4 / 5, .76, (960, 1200)),
        ('classic-D-tall.webp',  'D', 4 / 5, .76, (960, 1200)),
        ('classic-E-tall.webp',  'E', 4 / 5, .66, (960, 1200)),
        ('classic-B-square.webp', 'B', 1.0, .78, (720, 720)),
        ('classic-E-square.webp', 'E', 1.0, .70, (720, 720))]

def extend(im, left, top, right, bottom):
    """The photo on a larger canvas; each new band continues the photo's edge and is blurred."""
    w, h = im.size
    canvas = Image.new('RGB', (w + left + right, h + top + bottom))
    canvas.paste(im, (left, top))
    def band(strip, size, at):
        if size[0] > 0 and size[1] > 0:
            canvas.paste(strip.resize(size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(max(size) / 14)), at)
    band(im.crop((0, 0, w, 4)), (w, top), (left, 0))
    band(im.crop((0, h - 4, w, h)), (w, bottom), (left, top + h))
    full = canvas.crop((left, 0, left + w, h + top + bottom))
    band(full.crop((0, 0, 4, full.height)), (left, full.height), (0, 0))
    band(full.crop((w - 4, 0, w, full.height)), (right, full.height), (left + w, 0))
    return canvas

for name, key, ratio, fill, size in jobs:
    path, (x0, y0, x1, y1) = photos[key]
    im = Image.open(root / path).convert('RGB')
    W, H = im.size
    bw, bh = (x1 - x0) * W, (y1 - y0) * H
    # The frame that holds the piece at `fill` of its tighter side.
    fw = max(bw / fill, bh / fill * ratio)
    fh = fw / ratio
    cx, cy = (x0 + x1) / 2 * W, (y0 + y1) / 2 * H
    l, t, r, b = round(cx - fw / 2), round(cy - fh / 2), round(cx + fw / 2), round(cy + fh / 2)
    pad = [max(0, -l), max(0, -t), max(0, r - W), max(0, b - H)]
    big = extend(im, *pad)
    out = big.crop((l + pad[0], t + pad[1], r + pad[0], b + pad[1])).resize(size, Image.LANCZOS)
    out.save(root / 'assets' / name, 'WEBP', quality=84, method=6)
    print(name, 'extended by', pad, 'of', (W, H))
