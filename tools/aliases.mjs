// Old addresses that show the same content as another page (v1.3.0, by request: "把重複頁面指向正本").
//
// Measured on the live site (2026-11-25): eleven addresses kept from the old re-o.co site rendered word for word the
// same page as another address, each naming itself as the original, so search engines and AI crawlers saw six pages
// two to seven times. One address per page now:
//   - the build writes no page for an address listed here and leaves it out of sitemap.xml and llms.txt;
//   - dist/_redirects (Cloudflare Pages) answers it with a permanent redirect to the page on the right, so old links
//     from outside keep working;
//   - links to it inside the saved pages point straight at that page.
// Inside the running app these route names still open (navigation.js uses #/read/pages/awards to open About at its
// record), so nothing changes for a visitor who is already on the site.
//
// Left: the old address (no slashes at the ends). Right: where it lives now (from the site root, fragment allowed).
export const aliases = {
  'pages/contact': 'pages/about/',                       // contact details are the first block of About
  'pages/awards': 'pages/about/#about-awards',           // 設計講座與產業報導 is a section of About
  'pages/news': 'explore/cases/',
  'pages/trophy': 'explore/cases/',
  'pages/material': 'explore/materials/',
  'blog/posts': 'explore/journal/',
  'categories/公版獎盃-standard-trophy': 'explore/products/',
  'categories/動物系列-animals-series': 'explore/products/',
  'categories/摺紙花器-origami-series': 'explore/products/',
  'categories/翻轉鏡': 'explore/products/',
  'categories/極簡系列-simple-series': 'explore/products/',
  'pages/discontinued-item': 'explore/products/',
  'products/摺紙花器': 'products/摺紙花器-origami-series/'  // the same product page was migrated twice
};

// A page that was merged into another and no longer exists (not in the content index): the same redirect.
// 2026-11-23: the second 台達 玻璃樹模範獎盃 entry. It used to be a small HTML page that refreshed to the case
// (public/pages/new-page-7/); a real redirect replaces it.
export const merged = {
  'pages/new-page-7': 'pages/delta-glass-tree-trophy/'
};
const moved = {...aliases, ...merged};

const clean = route => decodeURIComponent(route).replace(/^\/+|\/+$/g, '');
export const isAlias = route => Object.hasOwn(aliases, clean(route));

// Cloudflare Pages `_redirects`: one line per way the old address can be written (with and without the closing
// slash; Chinese both as typed and percent-encoded, since the documentation does not say which form is matched).
export function redirectsFile(base = '/') {
  const lines = ['# Old addresses that repeat another page (tools/aliases.mjs). Written by the build; do not edit here.'];
  for (const [from, to] of Object.entries(moved)) {
    const target = base + encodeURI(to);
    for (const form of new Set([from, encodeURI(from)])) for (const end of ['', '/']) lines.push(`${base}${form}${end} ${target} 301`);
  }
  return lines.join('\n') + '\n';
}

// In a saved page, links to an old address go straight to the page that holds the content.
export function rewriteLinks(html, base = '/') {
  for (const [from, to] of Object.entries(moved)) {
    for (const form of new Set([from, encodeURI(from)])) html = html.split(`href="${base}${form}/"`).join(`href="${base}${to}"`);
  }
  return html;
}
