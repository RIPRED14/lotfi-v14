const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Types MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  
  let filePath = '.' + req.url;
  
  // Si c'est la racine, servir index.html
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Si c'est un chemin sans extension, servir index.html (pour React Router)
  if (!path.extname(filePath)) {
    filePath = './index.html';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Fichier non trouvé, servir index.html pour React Router
        fs.readFile('./index.html', (err, indexContent) => {
          if (err) {
            res.writeHead(500);
            res.end('Erreur serveur: ' + err.code);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Erreur serveur: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🎉 SERVEUR LOTFI v5 DÉMARRÉ !');
  console.log('🌐 URL: http://localhost:' + PORT);
  console.log('📂 Répertoire: ' + __dirname);
  console.log('⏰ Heure: ' + new Date().toLocaleString());
  console.log('🚀 ========================================');
});

server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
}); 