// The admin's data rules, free of browser APIs so tests can run them (tests/admin.test.mjs).
// A case lives in five places; the editor works on one "draft" and buildChanges writes all five back:
//   public/content/pages/<id>.json   the page: text, photos, top photo
//   src/data/content-index.json      its entry in the lists: title, summary, top photo, facts, group, hidden
//   src/data/case-photos.json        the card cover
//   src/data/case-details.json       the two hover photos on the card
//   src/data/case-cards.json         cover → its 720px copy for lists
export const groups = [['企業獎盃', '品牌獎盃訂製', '企業與賽事獎盃'], ['生活設計', '禮贈品訂製', '品牌禮品與生活器物'], ['IP生活設計', 'IP聯名設計', 'IP與角色']];
export const files = {index: 'src/data/content-index.json', covers: 'src/data/case-photos.json', details: 'src/data/case-details.json', cards: 'src/data/case-cards.json'};
export const pageFile = id => `public/content/pages/${id}.json`;
export const slugOf = path => decodeURIComponent(String(path).split('/').pop());
const baseName = src => String(src).split('/').pop().replace(/\.\w+$/, '');
const trim = s => String(s ?? '').trim();

// Same rule as catalogue.js caseGroup; kept here so the admin shows the group a case is listed under today.
export function groupOf(p) {
  if (p.group) return p.group;
  if (/IP|聯名/.test(p.subcategory || '') || /Disney|Marvel|米奇|鋼鐵|金馬|LINE|Candace|8 Ball/i.test(p.title)) return 'IP生活設計';
  if (/獎|杯|盃|獎牌/.test(p.title)) return '企業獎盃';
  return '生活設計';
}

export function newDraft() {
  return {isNew: true, id: '', path: '', slug: '', title: '', group: '企業獎盃', hidden: false, summary: '', meta: {client: '', year: '', material: '', service: '專案訂製'},
    sections: [{heading: '設計｜', text: '', items: []}], photos: [], hero: '', cover: null, coverFrom: null, details: [], keep: {}, entryKeep: {}};
}
export function toDraft(entry, page, cover, details) {
  const photos = [], seen = new Set();
  for (const im of [page.hero, ...(page.images || [])]) if (im?.src && !seen.has(im.src)) { seen.add(im.src); photos.push({src: im.src, width: im.width, height: im.height, alt: im.alt || '', caption: im.caption || ''}); }
  const m = page.metadata || {};
  const {id, path, title, category, category_label, subcategory, summary, hero, images, sections, metadata, ...keep} = page;
  return {isNew: false, id: entry.id, path: entry.path, slug: slugOf(entry.path), title: page.title, group: groupOf(entry), groupWas: groupOf(entry), hidden: Boolean(entry.hidden), summary: page.summary || '',
    meta: {client: m.client || '', year: m.year || '', material: Array.isArray(m.material) ? m.material.join('、') : m.material || '', service: m.service || ''},
    sections: (page.sections || []).map(s => ({heading: s.heading || '', text: (s.paragraphs || []).join('\n'), items: s.items || []})),
    photos, hero: page.hero?.src || '', cover: cover || null, coverFrom: null, details: details?.details || [], moreWas: details ? details.more : null, photosWas: photos.length,
    keep: {...keep, subcategory, metadata: m, category, category_label}, entryKeep: entry};
}

export function problems(draft, index) {
  const out = [];
  if (!trim(draft.title)) out.push('請填寫案例名稱');
  if (draft.isNew) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug)) out.push('網址名稱只能用小寫英文、數字和連字號（例如 torna-trophy）');
    else if (index.pages.some(p => slugOf(p.path) === draft.slug)) out.push('這個網址名稱已經有案例使用');
  }
  if (!draft.photos.length) out.push('請至少放一張照片');
  if (draft.meta.year && !/^\d{4}([–-]\d{4})?$/.test(trim(draft.meta.year))) out.push('年份請寫成 2025 或 2023–2025');
  return out;
}

const image = p => ({src: p.src, width: p.width, height: p.height, alt: trim(p.alt), caption: p.caption || ''});
const json = (value, pretty) => pretty ? JSON.stringify(value, null, 1) + '\n' : JSON.stringify(value);

// draft + the four shared files as they are now → the text files to write and the small copies still to make.
//   thumbs: [{of: photo src, limit: 480 | 720, set: thumb => void}]  the caller makes each copy, then calls set;
//   texts(): the files to write, read after every thumb is set.
// The page as it will be saved (also what the editor's preview shows).
export function shape(draft, id, path) {
  const hero = draft.photos.find(p => p.src === draft.hero) || draft.photos[0] || {src: '', width: 4, height: 3, alt: ''};
  const rest = draft.photos.filter(p => p !== hero);
  const groupRow = groups.find(g => g[0] === draft.group) || groups[0];
  const subcategory = !draft.isNew && draft.group === draft.groupWas && draft.keep.subcategory ? draft.keep.subcategory : groupRow[2];
  const metadata = {...(draft.keep.metadata || {})};
  for (const k of ['client', 'year', 'material', 'service']) { const v = trim(draft.meta[k]); if (v) metadata[k] = v; else delete metadata[k]; }
  const head = {id, path, title: trim(draft.title), category: 'cases', category_label: '合作案例', subcategory, summary: trim(draft.summary), hero: image(hero)};
  const {subcategory: _s, metadata: _m, category: _c, category_label: _l, ...other} = draft.keep;
  const page = {...head, images: rest.map(image), sections: draft.sections.map(s => ({heading: trim(s.heading), paragraphs: String(s.text || '').split(/\r?\n/).map(trim).filter(Boolean), items: s.items || []})).filter(s => s.heading || s.paragraphs.length || s.items.length),
    metadata, links: [], source_url: '', review_flags: [], embedded_media: [], external_links: [], ...other};
  return {head, page, metadata, hero, rest};
}
export function buildChanges(draft, data, idFor) {
  const index = structuredClone(data.index), covers = {...data.covers}, details = {...data.details}, cards = {...data.cards};
  const path = draft.isNew ? '#/read/pages/' + draft.slug : draft.path, id = draft.isNew ? idFor(path) : draft.id;
  const {head, page, metadata, hero, rest} = shape(draft, id, path);
  const entry = {...(draft.isNew ? {} : draft.entryKeep), ...head, metadata, group: draft.group};
  if (draft.hidden) entry.hidden = true; else delete entry.hidden;
  const at = index.pages.findIndex(p => p.path === path);
  if (at >= 0) index.pages[at] = entry; else {
    index.pages.push(entry);
    if (index.statistics) { index.statistics.renderable_page_count = (index.statistics.renderable_page_count || 0) + 1; const c = index.statistics.counts_by_category || (index.statistics.counts_by_category = {}); c.cases = (c.cases || 0) + 1; }
  }
  const thumbs = [];
  // Cover: an existing one stays; a photo picked in the editor becomes the cover as it is, or as a square cut of it.
  let cover = draft.cover;
  if (draft.coverFrom) {
    const from = draft.photos.find(p => p.src === draft.coverFrom.src);
    if (from && draft.coverFrom.square && Math.abs(from.width / from.height - 1) > .02) thumbs.push({of: from.src, square: draft.coverFrom.pos ?? .5, limit: 1440, folder: 'content/images', set: t => { cover = {...t, alt: trim(from.alt) || head.title}; covers[path] = cover; cardFor(); }});
    else if (from) cover = {src: from.src, width: from.width, height: from.height, alt: trim(from.alt) || head.title};
  }
  if (!cover) cover = {src: hero.src, width: hero.width, height: hero.height, alt: trim(hero.alt) || head.title};
  covers[path] = cover;
  function cardFor() { if (Math.max(cover.width, cover.height) > 760 && !cards[cover.src]) thumbs.push({of: cover.src, limit: 720, folder: 'assets/case-cards', set: t => { cards[cover.src] = t.src; }}); }
  if (!thumbs.length) cardFor();
  // Hover details: keep the ones whose photo is still on the page, then fill up to two from the page's photos.
  const names = new Set(draft.photos.map(p => baseName(p.src)));
  const kept = (draft.details || []).filter(d => names.has(baseName(d.src))).slice(0, 2), list = [...kept];
  const taken = new Set([baseName(cover.src), baseName(draft.coverFrom?.src || ''), ...kept.map(d => baseName(d.src))]);
  for (const p of rest) { if (list.length >= 2) break; if (taken.has(baseName(p.src))) continue; const slot = list.length; list.push(null); thumbs.push({of: p.src, limit: 480, folder: 'assets/case-details', set: t => { list[slot] = {src: t.src, width: t.width, height: t.height}; }}); }
  const texts = () => {
    const shown = list.filter(Boolean);
    // "+N" on the card: the photos still to see on the page. A case that had a hand-set count keeps it, moved by what changed.
    const more = draft.moreWas != null ? draft.moreWas + (draft.photos.length - draft.photosWas) - (shown.length - draft.details.length) : rest.length - shown.length;
    if (shown.length) details[path] = {more: Math.max(0, more), details: shown}; else delete details[path];
    return [{path: pageFile(id), content: json(page)}, {path: files.index, content: json(index)}, {path: files.covers, content: json(covers, true)}, {path: files.details, content: json(details)}, {path: files.cards, content: json(cards, true)}];
  };
  return {id, path, page, entry, thumbs, texts};
}
