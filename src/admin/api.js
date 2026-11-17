// The admin's two back ends behind one set of calls.
//   local  (pnpm dev): the dev server's /__admin routes read and write the project files directly; no sign-in.
//   online (published site): admin-service, which checks the Google sign-in and commits to the repository.
import {adminApi, googleClientId} from './config.js';
export const local = Boolean(import.meta.env?.DEV);
export const configured = local || Boolean(adminApi && googleClientId);
export const clientId = googleClientId;
const base = import.meta.env?.BASE_URL || '/';

const key = 'reo-admin-token';
let token = '';
try { token = sessionStorage.getItem(key) || ''; } catch {}
export const hasToken = () => local || Boolean(token);
export function setToken(value) { token = value || ''; try { value ? sessionStorage.setItem(key, value) : sessionStorage.removeItem(key); } catch {} }
export class SignedOut extends Error {}

async function call(path, init = {}) {
  const r = await fetch((local ? '/__admin' : adminApi) + path, {...init, headers: {...(local ? {'x-reo-admin': '1'} : {authorization: 'Bearer ' + token}), ...(init.body ? {'content-type': 'application/json'} : {})}});
  if (r.status === 401) { setToken(''); throw new SignedOut((await r.json().catch(() => ({}))).error || '請重新登入'); }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `連線失敗（${r.status}）`);
  return r;
}
export const me = async () => (await call('/me')).json();
export const readJson = async path => (await call('/file?path=' + encodeURIComponent(path))).json();
export const readBlob = async path => (await call('/file?path=' + encodeURIComponent(path))).blob();
export const save = async (files, message) => (await call('/save', {method: 'POST', body: JSON.stringify({files, message})})).json();
export const status = async () => local ? {} : (await call('/status')).json();

// Photos: one just added shows from memory; others from the site, or from the back end when the site has not
// published them yet (a save takes a few minutes to go live).
const blobs = new Map();
export const remember = (src, url) => blobs.set(src, url);
export const assetUrl = src => blobs.get(src) || (String(src).startsWith('/') ? base + String(src).slice(1) : src);
export async function loadPhoto(src) {
  if (blobs.has(src)) return blobs.get(src);
  const url = URL.createObjectURL(await readBlob('public' + src));
  blobs.set(src, url);
  return url;
}
