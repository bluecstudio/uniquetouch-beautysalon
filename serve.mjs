import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Mirrors GitHub Pages' folder-index resolution: a directory (or an
// extensionless path with no matching file) falls back to its index.html,
// so clean routes like /explore-experiences/ or /explore-experiences work
// the same locally as they do in production.
async function resolveFilePath(urlPath) {
  let filePath = join(__dirname, urlPath);
  let st = await stat(filePath);
  if (st.isDirectory()) {
    filePath = join(filePath, 'index.html');
    st = await stat(filePath);
  }
  return { filePath, size: st.size };
}

createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  try {
    const { filePath, size } = await resolveFilePath(urlPath);
    const ext = extname(filePath).toLowerCase();
    const contentType = mime[ext] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : size - 1;
      res.writeHead(206, {
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
      });
      createReadStream(filePath, { start, end }).pipe(res);
    } else {
      const content = await readFile(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': size,
      });
      res.end(content);
    }
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}).listen(PORT, () => {
  console.log(`✦ Unique Touch dev server → http://localhost:${PORT}`);
});
