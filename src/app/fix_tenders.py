#!/usr/bin/env python3
import re

# Read the file
with open('src/app/i18n/tenders.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the problematic line - replace the double-escaped apostrophe
content = content.replace("'tenders.module.title': 'Appels d\\\\'Offres',", "'tenders.module.title': \"Appels d'Offres\",")

# Write back
with open('src/app/i18n/tenders.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed!")
