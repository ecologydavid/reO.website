// The case admin's LOCAL back end (v75). Only while `pnpm dev` runs, never in a build: /admin/ reads and writes the
// project's content files directly, under the same rules as the online service (rules.mjs).
// The custom header and the host check keep other sites open in the same browser from calling it.
import fs from 'node:fs';
import path from 'node:path';
import {readable, refuse} from './rules.mjs';

const types = {json: 'application/json', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png'};
export default {
  name: 'reo-admin-dev', apply: 'serve',
  configureServer(server) {
    const root = server.config.root;
    server.middlewares.use('/__admin', async (req, res) => {
      const send = (status, value, type = 'application/json; charset=utf-8') => { res.writeHead(status, {'content-type': type, 'cache-control': 'no-store'}); res.end(Buffer.isBuffer(value) ? value : JSON.stringify(value)); };
      try {
        if (req.headers['x-reo-admin'] !== '1' || !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) return send(403, {error: '只限本機使用'});
        const url = new URL(req.url, 'http://x');
        if (req.method === 'GET' && url.pathname === '/me') return send(200, {email: '本機模式', name: '本機模式', local: true});
        if (req.method === 'GET' && url.pathname === '/file') {
          const file = url.searchParams.get('path') || '';
          if (!readable(file)) return send(400, {error: '不允許讀取這個檔案'});
          const full = path.join(root, file);
          return fs.existsSync(full) ? send(200, fs.readFileSync(full), types[file.split('.').pop().toLowerCase()]) : send(404, {error: '找不到檔案'});
        }
        if (req.method === 'POST' && url.pathname === '/save') {
          const chunks = []; for await (const c of req) chunks.push(c);
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'), why = refuse(data);
          if (why) return send(400, {error: why});
          for (const f of data.files) { const full = path.join(root, f.path); fs.mkdirSync(path.dirname(full), {recursive: true}); fs.writeFileSync(full, f.encoding === 'base64' ? Buffer.from(f.content, 'base64') : f.content); }
          return send(200, {commit: 'local', files: data.files.length});
        }
        return send(404, {error: '沒有這個功能'});
      } catch (e) { send(500, {error: e.message}); }
    });
  }
};
