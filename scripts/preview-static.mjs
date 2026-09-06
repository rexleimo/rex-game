/** 极简静态服务器（仅本地预览 out/ 用）：node scripts/preview-static.mjs 3040 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const port = Number(process.argv[2] ?? 3040);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    const tryFiles = [];
    if (path.endsWith('/')) tryFiles.push(path + 'index.html');
    else {
      tryFiles.push(path, path + '/index.html');
    }
    if (path === '/') tryFiles.push('/index.html');
    for (const candidate of tryFiles) {
      const clean = normalize(candidate).replace(/^([.][.][/\\])+/, '');
      try {
        const data = await readFile(join(root, clean));
        res.writeHead(200, { 'content-type': MIME[extname(clean)] ?? 'application/octet-stream' });
        res.end(data);
        return;
      } catch {
        /* try next */
      }
    }
    res.writeHead(404);
    res.end('not found');
  } catch {
    res.writeHead(500);
    res.end('error');
  }
}).listen(port, () => console.log(`preview at http://localhost:${port}`));
