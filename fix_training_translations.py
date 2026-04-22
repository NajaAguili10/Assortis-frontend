#!/usr/bin/env python3
"""
Script to add missing translation keys to training.ts
"""

def fix_training_translations():
    file_path = 'src/app/i18n/training.ts'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)
        
        # Add 'training.level.label' after Levels comment (English section)
        if i < len(lines) - 1 and "'training.level.BEGINNER': 'Beginner'," in line and "'training.level.label'" not in lines[i-1]:
            # Check if we're in the English section (around line 40-45)
            if i < 100:
                new_lines.insert(-1, "    'training.level.label': 'Level',\n")
        
        # Add 'training.enrollment.type.label' after enrollment selectType (English section)
        if i < len(lines) - 1 and "'training.enrollment.type.INDIVIDUAL': 'Individual Enrollment'," in line and "'training.enrollment.type.label'" not in lines[i-1]:
            if i < 200:  # English section
                new_lines.insert(-1, "    'training.enrollment.type.label': 'Enrollment Type',\n")
        
        # Add 'training.enrollment.option.label' before trainingOnly (English section)
        if i < len(lines) - 1 and "'training.enrollment.option.trainingOnly': 'Training Only'," in line and "'training.enrollment.option.label'" not in lines[i-1]:
            if i < 200:  # English section
                new_lines.insert(-1, "    'training.enrollment.option.label': 'Enrollment Option',\n")
        
        # FRENCH SECTION
        # Add 'training.level.label' after Levels comment (French section)
        if i < len(lines) - 1 and "'training.level.BEGINNER': 'Débutant'," in line and "'training.level.label'" not in lines[i-1]:
            # Check if we're in the French section (around line 447-452)
            if i > 400:
                new_lines.insert(-1, "    'training.level.label': 'Niveau',\n")
        
        # Add 'training.enrollment.type.label' after enrollment selectType (French section)
        if i < len(lines) - 1 and "'training.enrollment.type.INDIVIDUAL': 'Inscription Individuelle'," in line and "'training.enrollment.type.label'" not in lines[i-1]:
            if i > 500:  # French section
                new_lines.insert(-1, "    'training.enrollment.type.label': 'Type d\\'Inscription',\n")
        
        # Add 'training.enrollment.option.label' before trainingOnly (French section)
        if i < len(lines) - 1 and "'training.enrollment.option.trainingOnly': 'Formation Seulement'," in line and "'training.enrollment.option.label'" not in lines[i-1]:
            if i > 500:  # French section
                new_lines.insert(-1, "    'training.enrollment.option.label': 'Option d\\'Inscription',\n")
        
        # SPANISH SECTION
        # Add 'training.level.label' after Levels comment (Spanish section)
        if i < len(lines) - 1 and "'training.level.BEGINNER': 'Principiante'," in line and "'training.level.label'" not in lines[i-1]:
            # Check if we're in the Spanish section (around line 850)
            if i > 800:
                new_lines.insert(-1, "    'training.level.label': 'Nivel',\n")
        
        # Add 'training.enrollment.type.label' after enrollment selectType (Spanish section)
        if i < len(lines) - 1 and "'training.enrollment.type.INDIVIDUAL': 'Inscripción Individual'," in line and "'training.enrollment.type.label'" not in lines[i-1]:
            if i > 900:  # Spanish section
                new_lines.insert(-1, "    'training.enrollment.type.label': 'Tipo de Inscripción',\n")
        
        # Add 'training.enrollment.option.label' before trainingOnly (Spanish section)
        if i < len(lines) - 1 and "'training.enrollment.option.trainingOnly': 'Solo Formación'," in line and "'training.enrollment.option.label'" not in lines[i-1]:
            if i > 900:  # Spanish section
                new_lines.insert(-1, "    'training.enrollment.option.label': 'Opción de Inscripción',\n")
        
        i += 1
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Fixed {file_path}")
    print("Added missing translation keys for:")
    print("  - training.level.label")
    print("  - training.enrollment.type.label")
    print("  - training.enrollment.option.label")
    print("in all three languages (en, fr, es)")

if __name__ == '__main__':
    fix_training_translations()
