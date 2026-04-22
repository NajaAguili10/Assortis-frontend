#!/usr/bin/env python3
# Script to fix double backslash apostrophes in organizations.ts

import sys

# Read file
with open('/tmp/sandbox/src/app/i18n/organizations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix each line
fixed_lines = []
for line in lines:
    # Replace double backslash + apostrophe with single backslash + apostrophe
    # In the file: \\ + ' should become \ + '
    # In Python strings: r"\\''" represents backslash backslash apostrophe
    fixed_line = line.replace(r"\\\'", r"\'")
    fixed_lines.append(fixed_line)

# Write back
with open('/tmp/sandbox/src/app/i18n/organizations.ts', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print(f"Fixed {len(fixed_lines)} lines")
