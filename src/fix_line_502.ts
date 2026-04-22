import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'app/i18n/offers.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Fix line 502 - replace the problematic escape sequence
const fixed = content.replace(
  /Sélectionnez votre type d\\\\\\\\'\''adhésion/g,
  "Sélectionnez votre type d'adhésion"
);

fs.writeFileSync(filePath, fixed, 'utf-8');

console.log('✅ Fixed line 502');
