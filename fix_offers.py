#!/usr/bin/env python3
"""Fix the escaping issue in offers.ts"""

# Read the file
with open('/app/src/app/i18n/offers.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the double backslash issue
content = content.replace(
    "'offers.become.selectMemberType': 'Sélectionnez votre type d\\\\'adhésion'",
    "'offers.become.selectMemberType': 'Sélectionnez votre type d\\'adhésion'"
)

# Write back
with open('/app/src/app/i18n/offers.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed the escaping issue in offers.ts")
