// Turns data/*.json into data/*.json.gz and data/*.json.br, then removes the .json files.
const fs = require('fs'), path = require('path'), z = require('zlib');
const dir = path.join(__dirname, '..', 'data');
for (const n of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
  const f = path.join(dir, n), raw = fs.readFileSync(f);
  fs.writeFileSync(f + '.gz', z.gzipSync(raw, { level: 9 }));
  fs.writeFileSync(f + '.br', z.brotliCompressSync(raw, { params: { [z.constants.BROTLI_PARAM_QUALITY]: 11, [z.constants.BROTLI_PARAM_SIZE_HINT]: raw.length } }));
  fs.unlinkSync(f);
  console.log(n, raw.length, '→ gz/br');
}
