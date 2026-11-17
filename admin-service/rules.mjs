// What the admin may read and change: case content only, never code, workflows or other data.
// One list for both back ends: the local dev middleware (vite.config.js) and the service (server.mjs).
const textFile = /^(public\/content\/pages\/[0-9a-f]{14}\.json|src\/data\/(content-index|case-photos|case-details|case-cards)\.json)$/;
// Written images are named by the hash of their own bytes, so a write can never replace another photo.
const newImage = /^public\/(content\/images|assets\/case-cards|assets\/case-details)\/[0-9a-f]{18}\.(webp|jpg)$/;
const anyImage = /^public\/(content\/images|assets|assets\/case-cards|assets\/case-details)\/[\w.-]+\.(webp|jpe?g|png)$/;

export const limits = {files: 80, imageBytes: 3 * 1024 * 1024, textBytes: 6 * 1024 * 1024, totalBytes: 28 * 1024 * 1024};
export const writable = path => textFile.test(path) ? 'text' : newImage.test(path) ? 'image' : null;
export const readable = path => textFile.test(path) || anyImage.test(path);

const size = f => f.encoding === 'base64' ? Math.floor(f.content.length * 3 / 4) : Buffer.byteLength(f.content, 'utf8');
// Returns the reason a save is refused, or null when it may go ahead.
export function refuse(body) {
  const files = body?.files;
  if (!Array.isArray(files) || !files.length) return '沒有要儲存的內容';
  if (files.length > limits.files) return `一次最多儲存 ${limits.files} 個檔案`;
  let total = 0;
  for (const f of files) {
    if (typeof f?.path !== 'string' || typeof f?.content !== 'string') return '檔案格式不正確';
    const kind = writable(f.path);
    if (!kind) return `不允許變更這個檔案：${f.path}`;
    if (kind === 'text' ? f.encoding === 'base64' : f.encoding !== 'base64') return `檔案編碼不正確：${f.path}`;
    const bytes = size(f);
    if (bytes > (kind === 'text' ? limits.textBytes : limits.imageBytes)) return `檔案太大：${f.path}`;
    if (kind === 'text') { try { JSON.parse(f.content); } catch { return `不是正確的 JSON：${f.path}`; } }
    total += bytes;
  }
  if (total > limits.totalBytes) return '這次儲存的內容太大，請分幾次上傳照片';
  return null;
}
