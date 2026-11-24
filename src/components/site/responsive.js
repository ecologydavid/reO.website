// Small copies of photos for phones (v1.2.2). The build makes an 800px WebP of every photo (tools/images.mjs):
//   /content/images/<name>.webp        →  /i/content/images/<name>-800.webp
//   /i/assets/<name>.<hash>.<ext>      →  /i/assets/<name>.<hash>-800.webp
// small(image, sizes) returns the srcSet and sizes for an <img>, so the browser picks the copy when it is enough.
//
// `sizes` says how wide the photo is shown. On phones the lists below say 60vw even for a photo as wide as the
// screen: a 3x phone then takes the 800px copy (about twice the screen's own pixels across, sharp at arm's length)
// instead of the 1440px original, a third of the data. On wider screens the true width is given, so a photo shown
// large always gets the original.
// Only in a build (the dev server has no /i/ folder), and only for photos the data says are wider than the copy.
// The suffix must match tools/images.mjs.
const SUFFIX = '-800.webp', on = Boolean(import.meta.env?.PROD);
export const phone = '(max-width: 760px) 60vw, 100vw';           // large on desktop: phones only
export const half = '(max-width: 760px) 60vw, 50vw';             // beside its text on desktop
export const third = '(max-width: 760px) 60vw, 34vw';            // a card or gallery tile, three or more to a row
export function small(image, sizes = phone) {
  const src = image?.src || '', width = Number(image?.width) || 0;
  if (!on || width < 900) return {};
  const m = src.match(/^(.*?\/)(i\/assets\/|content\/images\/)([^?#]+)\.(?:webp|png|jpe?g)$/i);
  if (!m) return {};
  return {srcSet: `${m[1]}${m[2].startsWith('i/') ? '' : 'i/'}${m[2]}${m[3]}${SUFFIX} 800w, ${src} ${width}w`, sizes};
}
