const fs = require('fs');
const path = require('path');

function getImports(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const regex = /from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const full = path.resolve(path.dirname(filePath), importPath);
      for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']) {
        if (fs.existsSync(full + ext) && fs.statSync(full + ext).isFile()) {
          imports.push(full + ext);
          break;
        }
      }
    }
  }
  return imports;
}

function findCircles(start) {
  const visited = new Set();
  const stack = [];
  const circles = [];

  function dfs(curr) {
    const idx = stack.indexOf(curr);
    if (idx !== -1) {
      circles.push([...stack.slice(idx), curr]);
      return;
    }
    if (visited.has(curr)) return;
    visited.add(curr);
    stack.push(curr);
    const imps = getImports(curr);
    for (const imp of imps) {
      dfs(imp);
    }
    stack.pop();
  }

  dfs(start);
  return circles;
}

const circles = findCircles(path.resolve('src/App.tsx'));
console.log('Found circles:', circles.length);
circles.forEach((c, i) => {
  console.log(`\nCircle ${i + 1}:`);
  c.forEach(f => console.log(' -> ', path.relative(process.cwd(), f)));
});
