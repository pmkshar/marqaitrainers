#!/usr/bin/env python3
"""Add pricing fields to each course in courses.ts."""
import re
from pathlib import Path

path = Path('/home/z/my-project/src/lib/courses.ts')
src = path.read_text()

# Pricing per course (in USD)
pricing = {
    'ai-ml':            {'one': 199, 'monthly': 29, 'annual': 290},
    'java-fullstack':   {'one': 179, 'monthly': 25, 'annual': 249},
    'dotnet-fullstack': {'one': 179, 'monthly': 25, 'annual': 249},
    'mobile-dev':       {'one': 169, 'monthly': 23, 'annual': 229},
    'flutter-dev':      {'one': 159, 'monthly': 22, 'annual': 219},
}

new_src = src
for course_id, p in pricing.items():
    id_pattern = f"id: '{course_id}',"
    id_idx = new_src.find(id_pattern)
    if id_idx == -1:
        print(f"WARNING: course id '{course_id}' not found")
        continue

    search_start = id_idx
    next_course_match = re.search(r"\n  },\n  \{\n    id: '", new_src[search_start:])
    end_array_match = re.search(r"\n  },\n\];", new_src[search_start:])

    if not next_course_match and not end_array_match:
        print(f"WARNING: cannot find end of course '{course_id}'")
        continue

    if next_course_match and (not end_array_match or next_course_match.start() < end_array_match.start()):
        end_idx = search_start + next_course_match.start()
    else:
        end_idx = search_start + end_array_match.start()

    pricing_block = (
        "    ],\n"
        f"    oneTimePrice: {p['one']},\n"
        f"    monthlyPrice: {p['monthly']},\n"
        f"    annualPrice: {p['annual']},\n"
        f"    onDemand: true,\n"
        f"  " + "}"
    )

    slice_text = new_src[search_start:end_idx + 5]
    target = "    ],\n  },"  # with trailing comma (next course case)
    last_pos = slice_text.rfind(target)
    if last_pos == -1:
        target = "    ],\n  }"
        last_pos = slice_text.rfind(target)
        if last_pos == -1:
            print(f"WARNING: cannot find modules close in '{course_id}'")
            continue
        replacement = pricing_block
    else:
        replacement = pricing_block + ","

    new_slice = slice_text[:last_pos] + replacement + slice_text[last_pos + len(target):]
    new_src = new_src[:search_start] + new_slice + new_src[end_idx + 5:]

path.write_text(new_src)
print("Done. Pricing fields added.")
