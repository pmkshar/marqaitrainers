#!/usr/bin/env python3
"""Add categoryIds and expiresAfterDays to each Course in courses.ts."""

import re
from pathlib import Path

p = Path('/home/z/my-project/src/lib/courses.ts')
src = p.read_text()

# Map course id -> categories + expiry
CAT_MAP = {
    'ai-ml': (['cat-ai', 'cat-backend'], 365),
    'java-fullstack': (['cat-backend', 'cat-web'], 365),
    'dotnet-fullstack': (['cat-backend', 'cat-cloud'], 365),
    'mobile-dev': (['cat-mobile', 'cat-frontend'], 180),
    'flutter-dev': (['cat-mobile', 'cat-frontend'], 180),
}

# For each course, find the line "onDemand: true," and insert two new lines after it
# But we need to know which course we are in. We'll find each course block.

# Simpler: split by course id pattern, then within each block, replace first occurrence of "onDemand: true,\n"
# with "onDemand: true,\n    categoryIds: [...],\n    expiresAfterDays: N,\n"

def patch_course(course_id, src):
    cat_ids, exp = CAT_MAP[course_id]
    cat_str = '[' + ', '.join(f"'{c}'" for c in cat_ids) + ']'
    # find "    id: 'course-id',\n" then within the next ~1500 chars find "    onDemand: true,\n"
    pattern = re.compile(r"(id:\s*'" + re.escape(course_id) + r"',.*?onDemand:\s*true,)\n", re.DOTALL)
    def repl(m):
        return m.group(1) + f"\n    categoryIds: {cat_str},\n    expiresAfterDays: {exp},\n"
    new_src, n = pattern.subn(repl, src, count=1)
    if n != 1:
        print(f"WARNING: did not patch {course_id} (n={n})")
    return new_src

for cid in CAT_MAP:
    src = patch_course(cid, src)

p.write_text(src)
print("Done.")
