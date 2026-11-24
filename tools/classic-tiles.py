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
    'A': ('assets/catalogue-A.webp',                (.42, .10, .58, .89)),
    'B': ('content/images/e8b500fc458fa120e4.webp', (.47, .08, .79, .93)),
    'C': ('assets/catalogue-C.webp',                (.275, .18, .71, .91)),
    'D': ('content/images/0ec85ee98fb1103204.webp', (.22, .13, .785, .88)),
    'E': ('assets/hero-wide.webp',                  (.205, .31, .685, .87)),
}
# Every model in every frame shape the site uses (v1.2.5: all five, so no frame is left to a plain centre crop).
#   tall    4:5   desktop Classic grid cells
#   square  1:1   hero A to E cards, the round picks on the 公版 page
#   wide    4:3   Classic grid on tablets and phones, C's wide desktop cell, the 公版 mosaic
#   hero    2.2:1 home hero stage on desktops. The stage changes shape with the window (about 1:1 to 2:1); a canvas
#                 this wide is always fitted by HEIGHT, so the piece keeps its size and place and only plain backdrop
#                 is cut from, or shown at, the sides.
#   hero-square   home hero stage on phones (a square stage)
#            shape          width:height  size          fill of the tighter side, per model
shapes = [('tall',        4 / 5, (960, 1200),  {'A': .78, 'B': .76, 'C': .78, 'D': .76, 'E': .66}),
          ('square',      1.0,   (720, 720),   {'A': .78, 'B': .78, 'C': .72, 'D': .76, 'E': .70}),
          ('wide',        4 / 3, (1200, 900),  {'A': .74, 'B': .74, 'C': .64, 'D': .70, 'E': .62}),
          ('hero',        2.2,   (2112, 960),  {'A': .74, 'B': .74, 'C': .64, 'D': .72, 'E': .62}),
          ('hero-square', 1.0,   (1080, 1080), {'A': .76, 'B': .74, 'C': .68, 'D': .76, 'E': .68})]
jobs = [((f'hero-{key}-wide.webp' if shape == 'hero' else f'hero-{key}-square.webp' if shape == 'hero-square' else f'classic-{key}-{shape}.webp'), key, ratio, fills[key], size)
        for shape, ratio, size, fills in shapes for key in 'ABCDE']

def extend(im, left, top, right, bottom):
    """The photo on a larger canvas; each new band continues the photo's edge and is blurred."""
    w, h = im.size
    canvas = Image.new('RGB', (w + left + right, h + top + bottom))
    canvas.paste(im, (left, top))
    def band(strip, size, at, away):
        """`away`: the side of the band that is farthest from the photo ('left', 'right', 'top', 'bottom')."""
        if size[0] <= 0 or size[1] <= 0:
            return
        # Next to the photo: the edge itself, with a light blur only (enough to calm the stretched grain; more would
        # soften the backdrop's own gradient and show as a step where the band meets the photo, seen on E).
        near = strip.resize(size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(min(5, max(size) / 14)))
        # Far from the photo: the same band blurred along the seam, so anything that crossed the photo's edge
        # (B's long shadow) dissolves into the backdrop instead of running on as a straight stripe.
        along = size[1] if away in ('left', 'right') else size[0]
        far = near.filter(ImageFilter.GaussianBlur(along / 7))
        ramp = Image.linear_gradient('L')                                    # black at the top, white at the bottom
        ramp = {'bottom': ramp, 'top': ramp.rotate(180), 'right': ramp.rotate(90), 'left': ramp.rotate(270)}[away].resize(size)
        canvas.paste(Image.composite(far, near, ramp), at)
    band(im.crop((0, 0, w, 4)), (w, top), (left, 0), 'top')
    band(im.crop((0, h - 4, w, h)), (w, bottom), (left, top + h), 'bottom')
    full = canvas.crop((left, 0, left + w, h + top + bottom))
    band(full.crop((0, 0, 4, full.height)), (left, full.height), (0, 0), 'left')
    band(full.crop((w - 4, 0, w, full.height)), (right, full.height), (left + w, 0), 'right')
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
