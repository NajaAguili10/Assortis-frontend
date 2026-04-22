const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/i18n/offers.ts');
let lines = fs.readFileSync(filePath, 'utf-8').split('\n');

// Remove line 503 which is a duplicate with bad escaping
lines.splice(502, 1);  // Remove index 502 (which is line 503 in 1-based counting)

const fixed = lines.join('\n');
fs.writeFileSync(filePath, fixed, 'utf-8');

console.log('✅ Fixed - Removed duplicate line 503');
