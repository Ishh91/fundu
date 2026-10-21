const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

console.log(`Original line count: ${lines.length}`);

// Lines 0 to 3742 (1-based lines 1 to 3743)
const cleanHead = lines.slice(0, 3743);

// Lines 31429 to end (1-based lines 31430 to 31461)
const cleanTail = lines.slice(31429);

const finalLines = [...cleanHead, ...cleanTail];
console.log(`New line count: ${finalLines.length}`);

fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
console.log('Successfully cleaned indianPhonesCatalog.ts!');
