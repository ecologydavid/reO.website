# Imports the owner's photos into case pages (v74, 2026-11-18).
#
#   python -I tools/cases/import.py tools/cases/<batch>.json
#
# The batch file lists, per case, the photos to use (paths under its "root"). For a case that is already on the site
# the photos are added to its page (same shot already there: skipped); for a new one the page is created.
# Every photo becomes a WebP of at most 1440px (public/content/images/<hash>.webp); covers also get a 720px card
# version (public/assets/case-cards) and two 480px hover details (public/assets/case-details).
# Running it twice changes nothing the second time.
#
# Batch entry:
#   {"path": "#/read/pages/x"}                      an existing case      | {"new": true, "slug": "x", "title": …, …}
#   "title": "…"                                    rename
#   "meta": {"client": "…"}                         merged into metadata
#   "cover": {"file": "…", "alt": "…", "crop": [cx, cy]}   card cover; crop = centre of a square, as fractions
#   "hero":  {"file": "…", "alt": "…"}              photo at the top of the page
#   "replace": [{"index": 1, "file": "…", "alt": "…"}]     swaps images[index]
#   "add": [{"file": "…", "alt": "…"}]              appended to the page's photos
import hashlib, json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUB = os.path.join(ROOT, 'public')
DATA = os.path.join(ROOT, 'src', 'data')

def load(path):
    with open(path, encoding='utf8') as f: return json.load(f)
def save(path, value, indent=None):
    with open(path, 'w', encoding='utf8', newline='\n') as f:
        json.dump(value, f, ensure_ascii=False, indent=indent, separators=None if indent else (',', ':'))
        if indent: f.write(chr(10))

def opened(path):
    return ImageOps.exif_transpose(Image.open(path)).convert('RGB')
def digest(path, extra=''):
    h = hashlib.sha1(extra.encode())
    with open(path, 'rb') as f: h.update(f.read())
    return h.hexdigest()[:18]
def write_webp(im, rel, quality=82):
    full = os.path.join(PUB, rel.lstrip('/').replace('/', os.sep))
    if not os.path.exists(full):
        os.makedirs(os.path.dirname(full), exist_ok=True)
        im.save(full, 'WEBP', quality=quality, method=6)
    return rel
def photo(src, alt, limit=1440, crop=None):
    im = opened(src)
    if crop:
        side = min(im.size); cx, cy = crop
        x = min(max(int(cx * im.width - side / 2), 0), im.width - side); y = min(max(int(cy * im.height - side / 2), 0), im.height - side)
        im = im.crop((x, y, x + side, y + side))
    im.thumbnail((limit, limit), Image.LANCZOS)
    rel = write_webp(im, f'/content/images/{digest(src, "sq%s" % crop if crop else "")}.webp')
    return {'src': rel, 'width': im.width, 'height': im.height, 'alt': alt, 'caption': ''}
def small(rel, folder, limit, quality=78):
    im = Image.open(os.path.join(PUB, rel.lstrip('/').replace('/', os.sep))).convert('RGB')
    im.thumbnail((limit, limit), Image.LANCZOS)
    name = os.path.splitext(os.path.basename(rel))[0]
    return {'src': write_webp(im, f'/assets/{folder}/{name}.webp', quality), 'width': im.width, 'height': im.height}
# Difference hash (16×16): the same shot at another size or compression lands within a few bits.
def dhash(im):
    g = im.convert('L').resize((17, 16), Image.LANCZOS); px = list(g.tobytes())
    return [px[r * 17 + c] > px[r * 17 + c + 1] for r in range(16) for c in range(16)]
def same(a, b): return sum(x != y for x, y in zip(a, b)) <= 14

def main(batch_path):
    batch = load(batch_path); root = batch['root']
    index = load(os.path.join(DATA, 'content-index.json'))
    covers = load(os.path.join(DATA, 'case-photos.json'))
    details = load(os.path.join(DATA, 'case-details.json'))
    by_path = {p['path']: p for p in index['pages']}
    report = []
    for case in batch['cases']:
        src = lambda item: os.path.join(root, item['file'])
        if case.get('new'):
            path = '#/read/pages/' + case['slug']
            if path not in by_path:
                entry = {'id': hashlib.sha1(path.encode()).hexdigest()[:14], 'path': path, 'title': case['title'], 'category': 'cases',
                         'category_label': '合作案例', 'subcategory': case['subcategory'], 'summary': case['summary'], 'hero': None,
                         'metadata': dict(case.get('metadata', {}))}
                index['pages'].append(entry); by_path[path] = entry
                page = {**entry, 'images': [], 'sections': [{'heading': h, 'paragraphs': ps, 'items': []} for h, ps in case['sections']],
                        'links': case.get('links', []), 'source_url': '', 'review_flags': [], 'embedded_media': [], 'external_links': []}
                index['statistics']['renderable_page_count'] += 1; index['statistics']['counts_by_category']['cases'] += 1
                save(os.path.join(PUB, 'content', 'pages', entry['id'] + '.json'), page)
        else:
            path = case['path']
        entry = by_path[path]; page_file = os.path.join(PUB, 'content', 'pages', entry['id'] + '.json'); page = load(page_file)
        if case.get('title'): entry['title'] = page['title'] = case['title']
        if case.get('meta'):
            for target in (entry, page): target['metadata'] = {**target.get('metadata', {}), **case['meta']}
        for r in case.get('replace', []):
            page['images'][r['index']] = photo(src(r), r['alt'])
        if case.get('hero'):
            hero = photo(src(case['hero']), case['hero']['alt'])
            old = page.get('hero')
            if not old or old['src'] != hero['src']:
                if old and all(im['src'] != old['src'] for im in page['images']): page['images'].insert(0, old)
                page['hero'] = hero; entry['hero'] = hero
        if case.get('cover'):
            c = photo(src(case['cover']), case['cover']['alt'], crop=case['cover'].get('crop'))
            covers[path] = {k: c[k] for k in ('src', 'width', 'height', 'alt')}
        known = [dhash(Image.open(os.path.join(PUB, im['src'].lstrip('/')))) for im in [page.get('hero'), *page['images']] if im]
        added = 0
        for item in case.get('add', []):
            h = dhash(opened(src(item)))
            if any(same(h, k) for k in known):
                report.append(f'  already there, skipped: {item["file"]}'); continue
            im = photo(src(item), item['alt'])
            if any(x['src'] == im['src'] for x in page['images']): continue
            page['images'].append(im); known.append(h); added += 1
        if case.get('new') and path not in details:
            shots = [small(im['src'], 'case-details', 480) for im in page['images'][:2]]
            if shots: details[path] = {'more': max(0, len(page['images']) - len(shots)), 'details': shots}
        elif added and path in details:
            details[path]['more'] += added
        save(page_file, page)
        report.append(f'{"new" if case.get("new") else "upd"} {entry["title"]}: +{added} photos')
    # Card-sized covers: lists load a 720px copy instead of the 1440–2400px original (src → small copy).
    cards = {}
    banners = load(os.path.join(DATA, 'card-images.json'))
    for p in index['pages']:
        if p['category'] != 'cases': continue
        im = covers.get(p['path']) or banners.get(p['path']) or p.get('hero')
        if im and max(im['width'], im['height']) > 760: cards[im['src']] = small(im['src'], 'case-cards', 720)['src']
    save(os.path.join(DATA, 'case-cards.json'), cards, 1)
    save(os.path.join(DATA, 'content-index.json'), index)
    save(os.path.join(DATA, 'case-photos.json'), covers, 1)
    save(os.path.join(DATA, 'case-details.json'), details)
    print('\n'.join(report))

if __name__ == '__main__': main(sys.argv[1])
