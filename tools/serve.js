// Server locale per sviluppo: node tools/serve.js [porta]
// Serve la cartella app/ su tutte le interfacce, così l'app si apre anche dal telefono sulla stessa Wi-Fi.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const root = path.resolve(__dirname, '..', 'app'), port = +process.argv[2] || 8642;
const TYPES = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json',
  '.webmanifest':'application/manifest+json', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2'};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)){ res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err){ res.writeHead(404); return res.end('Non trovato'); }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(data);
  });
}).listen(port, () => {
  console.log(`Traks: http://localhost:${port}`);
  for (const list of Object.values(os.networkInterfaces())) for (const n of list || [])
    if (n.family === 'IPv4' && !n.internal) console.log(`Dal telefono (stessa Wi-Fi): http://${n.address}:${port}`);
});
