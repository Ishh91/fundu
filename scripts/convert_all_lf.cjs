const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.resolve(__dirname, '../src'));
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('\r\n')) {
    fs.writeFileSync(f, content.replace(/\r\n/g, '\n'), 'utf8');
    count++;
  }
});
console.log('Converted files to LF:', count);
