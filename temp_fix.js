const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/i18n/offers.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the double backslash issue - replace four backslashes with one
content = content.replace(
  /'offers\.become\.selectMemberType': 'Sélectionnez votre type d\\\\\\adhésion',/,
  "'offers.become.selectMemberType': 'Sélectionnez votre type d\\'adhésion',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed!');
