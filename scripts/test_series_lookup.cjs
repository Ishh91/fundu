const fs = require('fs');

// We can dynamically evaluate the TypeScript file or import compiled code
const { execSync } = require('child_process');
execSync('npm run build');

console.log('Build OK! Testing HTTP request to dev server...');
const http = require('http');

http.get('http://localhost:5173/sell/xiaomi/redmi-note-11-series', (res) => {
  console.log('/sell/xiaomi/redmi-note-11-series status:', res.statusCode);
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML length:', html.length);
    console.log('Contains root div:', html.includes('id="root"'));
  });
});
