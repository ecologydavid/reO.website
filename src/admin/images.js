// Photos are prepared in the browser, so the repository only ever receives web-sized files:
// at most 1440px on the long side for the page, 720px for list cards, 480px for the hover details.
// Files are named by the hash of their bytes (the same scheme as tools/cases/import.py).
import {assetUrl, loadPhoto, remember} from './api.js';

const hex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
export const sha1 = async data => hex(await crypto.subtle.digest('SHA-1', data));
export const idFor = async path => (await sha1(new TextEncoder().encode(path))).slice(0, 14);
const base64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

async function encode(source, sw, sh, {limit, square}) {
  let sx = 0, sy = 0, w = sw, h = sh;
  if (square != null) { const side = Math.min(sw, sh); sx = Math.round((sw - side) * (sw > sh ? square : .5)); sy = Math.round((sh - side) * (sh > sw ? square : .5)); w = h = side; }
  const scale = Math.min(1, limit / Math.max(w, h)), width = Math.max(1, Math.round(w * scale)), height = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(source, sx, sy, w, h, 0, 0, width, height);
  // WebP where the browser can write it (Chrome, Edge, Firefox); JPEG otherwise (Safari).
  let blob = await new Promise(r => canvas.toBlob(r, 'image/webp', .82));
  if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', .86));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return {width, height, bytes, blob, ext: blob.type === 'image/webp' ? 'webp' : 'jpg'};
}
async function finish(made, folder) {
  const name = (await sha1(made.bytes)).slice(0, 18) + '.' + made.ext, src = `/${folder}/${name}`;
  remember(src, URL.createObjectURL(made.blob));
  return {src, width: made.width, height: made.height, file: {path: 'public' + src, content: base64(made.bytes), encoding: 'base64'}};
}

// A file the owner picked → a page photo (EXIF rotation applied).
export async function fromFile(file) {
  const bitmap = await createImageBitmap(file, {imageOrientation: 'from-image'});
  try { return await finish(await encode(bitmap, bitmap.width, bitmap.height, {limit: 1440}), 'content/images'); } finally { bitmap.close?.(); }
}
const load = url => new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = url; });
// A photo already on the page → a smaller copy (card cover, hover detail) or a square cut of it.
export async function copyOf(src, {limit, square, folder}) {
  let im;
  try { im = await load(assetUrl(src)); } catch { im = await load(await loadPhoto(src)); }
  return finish(await encode(im, im.naturalWidth, im.naturalHeight, {limit, square}), folder);
}
