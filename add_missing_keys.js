const fs = require('fs');

// Read the file
const filePath = 'src/app/i18n/training.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Check if keys already exist
const hasLevelLabel = content.includes("'training.level.label'");
const hasTypeLabel = content.includes("'training.enrollment.type.label'");
const hasOptionLabel = content.includes("'training.enrollment.option.label'");

console.log('Current status:');
console.log('  training.level.label:', hasLevelLabel);
console.log('  training.enrollment.type.label:', hasTypeLabel);
console.log('  training.enrollment.option.label:', hasOptionLabel);

let modified = false;

// Add training.level.label for English
if (!hasLevelLabel) {
  // English section
  content = content.replace(
    "    // Levels\n    'training.level.BEGINNER': 'Beginner',",
    "    // Levels\n    'training.level.label': 'Level',\n    'training.level.BEGINNER': 'Beginner',"
  );
  
  // French section
  content = content.replace(
    "    // Levels\n    'training.level.BEGINNER': 'Débutant',",
    "    // Levels\n    'training.level.label': 'Niveau',\n    'training.level.BEGINNER': 'Débutant',"
  );
  
  // Spanish section
  content = content.replace(
    "    // Levels\n    'training.level.BEGINNER': 'Principiante',",
    "    // Levels\n    'training.level.label': 'Nivel',\n    'training.level.BEGINNER': 'Principiante',"
  );
  modified = true;
  console.log('✅ Added training.level.label');
}

// Add training.enrollment.type.label
if (!hasTypeLabel) {
  // English section - after selectType
  content = content.replace(
    "    'training.enrollment.selectType': 'Select enrollment type',\n    'training.enrollment.type.INDIVIDUAL': 'Individual Enrollment',",
    "    'training.enrollment.selectType': 'Select enrollment type',\n    'training.enrollment.type.label': 'Enrollment Type',\n    'training.enrollment.type.INDIVIDUAL': 'Individual Enrollment',"
  );
  
  // French section
  content = content.replace(
    "    'training.enrollment.selectType': 'Sélectionnez le type d\\'inscription',\n    'training.enrollment.type.INDIVIDUAL': 'Inscription Individuelle',",
    "    'training.enrollment.selectType': 'Sélectionnez le type d\\'inscription',\n    'training.enrollment.type.label': 'Type d\\'Inscription',\n    'training.enrollment.type.INDIVIDUAL': 'Inscription Individuelle',"
  );
  
  // Spanish section
  content = content.replace(
    "    'training.enrollment.selectType': 'Seleccione el tipo de inscripción',\n    'training.enrollment.type.INDIVIDUAL': 'Inscripción Individual',",
    "    'training.enrollment.selectType': 'Seleccione el tipo de inscripción',\n    'training.enrollment.type.label': 'Tipo de Inscripción',\n    'training.enrollment.type.INDIVIDUAL': 'Inscripción Individual',"
  );
  modified = true;
  console.log('✅ Added training.enrollment.type.label');
}

// Add training.enrollment.option.label
if (!hasOptionLabel) {
  // English section
  content = content.replace(
    "    'training.enrollment.selectOptions': 'Select Options',\n    'training.enrollment.option.trainingOnly': 'Training Only',",
    "    'training.enrollment.selectOptions': 'Select Options',\n    'training.enrollment.option.label': 'Enrollment Option',\n    'training.enrollment.option.trainingOnly': 'Training Only',"
  );
  
  // French section
  content = content.replace(
    "    'training.enrollment.selectOptions': 'Sélectionner les Options',\n    'training.enrollment.option.trainingOnly': 'Formation Seulement',",
    "    'training.enrollment.selectOptions': 'Sélectionner les Options',\n    'training.enrollment.option.label': 'Option d\\'Inscription',\n    'training.enrollment.option.trainingOnly': 'Formation Seulement',"
  );
  
  // Spanish section
  content = content.replace(
    "    'training.enrollment.selectOptions': 'Seleccionar Opciones',\n    'training.enrollment.option.trainingOnly': 'Solo Formación',",
    "    'training.enrollment.selectOptions': 'Seleccionar Opciones',\n    'training.enrollment.option.label': 'Opción de Inscripción',\n    'training.enrollment.option.trainingOnly': 'Solo Formación',"
  );
  modified = true;
  console.log('✅ Added training.enrollment.option.label');
}

if (modified) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('\n✅ File updated successfully!');
} else {
  console.log('\n✅ All keys already exist');
}
