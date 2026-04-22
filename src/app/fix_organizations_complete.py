#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to fix all apostrophe escaping issues in organizations.ts
Converts single-quoted strings with escaped apostrophes (\') to double-quoted strings with unescaped apostrophes
"""

# Read the file
with open('src/app/i18n/organizations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Process each line
for i, line in enumerate(lines):
    # Check if line contains \' escaping
    if "\\'" in line:
        # Replace escaped apostrophes by converting to double quotes
        # Strategy: find the quoted string part and convert it
        
        # Match pattern: 'KEY': 'VALUE WITH \'APOSTROPHE',
        if ": '" in line and "\\'" in line and "'," in line:
            # Split by ': '
            parts = line.split(": '", 1)
            if len(parts) == 2:
                key_part = parts[0]
                value_part = parts[1]
                
                # Extract value before the trailing ',
                if "'," in value_part:
                    value_content = value_part.rsplit("',", 1)[0]
                    rest = value_part.rsplit("',", 1)[1]
                    
                    # Replace \' with ' and use double quotes
                    fixed_value = value_content.replace("\\'", "'")
                    
                    # Reconstruct line with double quotes
                    lines[i] = f'{key_part}: "{fixed_value}",{rest}'

# Write back
with open('src/app/i18n/organizations.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Fixed all apostrophe escaping issues in organizations.ts!")
print("Total lines processed:", len(lines))
