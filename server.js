// Zero-dependency static server tuned for Railway's free plan:
// every file is loaded once at startup (gzip + brotli in memory),
// so requests never touch the disk and memory stays small.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const files = new Map(); // url path -> { type, etag, gzip, br, raw, cache }

function add(urlPath, type, raw, gz, cache, br) {
  gz = gz || zlib.gzipSync(raw, { level: 9 });
  br = br || zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } });
  const etag = '"' + crypto.createHash('sha1').update(gz).digest('base64url').slice(0, 16) + '"';
  files.set(urlPath, { type, etag, gz, br, raw: null, cache });
}

// index.html
add('/', TYPES['.html'], fs.readFileSync(path.join(ROOT, 'index.html')), null, 'no-cache');

// data/*.json.gz + *.json.br are pre-compressed, so startup only reads them
const dataDir = path.join(ROOT, 'data');
for (const name of fs.readdirSync(dataDir)) {
  if (!name.endsWith('.json.gz')) continue;
  const base = path.join(dataDir, name.slice(0, -3));
  const gz = fs.readFileSync(base + '.gz');
  const br = fs.existsSync(base + '.br') ? fs.readFileSync(base + '.br') : null;
  add('/data/' + name.slice(0, -3), TYPES['.json'], br ? Buffer.alloc(0) : zlib.gunzipSync(gz), gz, 'public, max-age=86400, stale-while-revalidate=604800', br);
}

function send(req, res, f) {
  const headers = {
    'Content-Type': f.type,
    'Cache-Control': f.cache,
    ETag: f.etag,
    Vary: 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff',
  };
  if (req.headers['if-none-match'] === f.etag) {
    res.writeHead(304, headers);
    return res.end();
  }
  const ae = req.headers['accept-encoding'] || '';
  let body;
  if (/\bbr\b/.test(ae)) { headers['Content-Encoding'] = 'br'; body = f.br; }
  else if (/\bgzip\b/.test(ae)) { headers['Content-Encoding'] = 'gzip'; body = f.gz; }
  else body = f.raw || (f.raw = zlib.gunzipSync(f.gz)); // rare: client without compression
  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  const url = req.url.split('?')[0];
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end('{"status":"ok"}');
  }
  const f = files.get(url === '/index.html' ? '/' : url);
  if (f) return send(req, res, f);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.keepAliveTimeout = 65000;
server.listen(PORT, () => {
  const mb = [...files.values()].reduce((s, f) => s + f.gz.length + f.br.length, 0) / 1048576;
  console.log(`[App1] listening on ${PORT} · ${files.size} files · ${mb.toFixed(1)} MB in memory`);
});

const stop = () => server.close(() => process.exit(0));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
