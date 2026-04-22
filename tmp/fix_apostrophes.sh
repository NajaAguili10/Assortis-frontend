#!/bin/bash
python3 << 'EOF'
import re

# Read the file
with open('../src/app/i18n/organizations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace \\' with \' (double backslash + apostrophe with single backslash + apostrophe)
# This fixes the JavaScript/TypeScript syntax error
content = content.replace("\\\\'", "\\'")

# Write back
with open('../src/app/i18n/organizations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed!")
EOF
