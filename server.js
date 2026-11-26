const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

// Serve the pre-compressed data/*.json.gz files when the browser accepts gzip.
app.get('/data/:file', (req, res, next) => {
  const file = path.basename(req.params.file);
  if (!file.endsWith('.json')) return next();
  const gz = path.join(ROOT, 'data', file + '.gz');
  res.set('Cache-Control', 'public, max-age=86400');
  res.set('Vary', 'Accept-Encoding');
  if (/\bgzip\b/.test(req.headers['accept-encoding'] || '') && fs.existsSync(gz)) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.set('Content-Encoding', 'gzip');
    return res.sendFile(gz);
  }
  next();
});

app.use(express.static(ROOT, { index: false }));

app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'App1 - Psalms Mini App' });
});

app.listen(PORT, () => {
  console.log(`[App1] Server running on port ${PORT}`);
});
