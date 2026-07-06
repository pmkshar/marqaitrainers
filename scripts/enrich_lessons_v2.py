#!/usr/bin/env python3
"""
Enrich lessons 2+ (and Lesson 1 of courses other than python-pro) with
Coursera-style metadata. Adds:
  - Lesson-level: lessonType, whatYouLearn, skills, tools
  - Step-level:   taskType, estimatedMinutes, instructions, expectedOutput (where derivable)

Skips any lesson/step that already has the Coursera fields (idempotent).

Strategy:
  - Parse courses.ts as a line-based state machine (no full TS parser needed).
  - Lesson id pattern: ^<12sp>id: '[a-z]+-m[0-9]+-l[0-9]+',
  - Lesson closing brace: ^<10sp>},?   (any indent < 12)
  - Step opening brace:   ^<14sp>{
  - Step closing brace:   ^<14sp>},?
  - For code steps with deterministic Python, run the code in a subprocess
    (3s timeout, blocked patterns) to capture expectedOutput.

Run:
  python3 /home/z/my-project/scripts/enrich_lessons_v2.py
"""

import json
import re
import subprocess
import sys
from pathlib import Path

COURSES_PATH = Path('/home/z/my-project/src/lib/courses.ts')

# Patterns that make Python code non-deterministic or unsafe to auto-execute.
RISKY_PATTERNS = [
    'input(',
    'random.',
    'os.system',
    'subprocess.',
    "open('",
    'open("',
    'requests.',
    'urllib',
    'socket.',
    'shutil.',
    'Path(',
    '__import__',
    'eval(',
    'exec(',
    'while True',
    'torch.',          # heavy import, slow
    'matplotlib',      # needs display
    'plt.',
    'tkinter',
    'pyautogui',
    'selenium',
    'playwright',
    'time.sleep',
    'cv2',
    'PIL',
    'Image.',
    'webbrowser',
]

INSTRUCTIONS = {
    'read': [
        'Read the explanation carefully',
        'Note the key concepts and terminology used',
        'Review any code examples provided',
        'Take notes for the end-of-lesson quiz',
    ],
    'code': [
        'Read the code in the code cell on the right',
        'Click the Run button to execute it in your browser',
        'Modify the code and re-run to experiment',
        'Compare your output with the expected output below',
    ],
    'challenge': [
        'Read the challenge description above',
        'Write your solution in the code cell',
        'Click Run to test your solution',
        'Iterate until your output matches the expected output',
    ],
    'solution': [
        'Compare this reference solution with your own',
        'Note the style choices and idioms used',
        'Run the code to verify it produces the expected output',
    ],
}


def ts_escape(s: str) -> str:
    """Escape a Python string for use in a TypeScript single-quoted literal."""
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '')
    return s


def try_run_python(code: str, timeout: float = 3.0) -> str | None:
    """Run Python code in a subprocess. Return stripped stdout on success, else None."""
    for pattern in RISKY_PATTERNS:
        if pattern in code:
            return None
    try:
        result = subprocess.run(
            [sys.executable, '-c', code],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd='/tmp',
        )
        if result.returncode == 0:
            out = result.stdout.rstrip('\n')
            if len(out) < 5000:  # sanity cap
                return out
        return None
    except Exception:
        return None


def unescape_ts_string(s: str) -> str:
    """Unescape a TypeScript single- or double-quoted string literal body."""
    # Handle common escape sequences
    out = []
    i = 0
    while i < len(s):
        if s[i] == '\\' and i + 1 < len(s):
            nxt = s[i + 1]
            if nxt == 'n':
                out.append('\n')
            elif nxt == 't':
                out.append('\t')
            elif nxt == 'r':
                out.append('\r')
            elif nxt == '\\':
                out.append('\\')
            elif nxt == "'":
                out.append("'")
            elif nxt == '"':
                out.append('"')
            elif nxt == '`':
                out.append('`')
            else:
                out.append(nxt)
            i += 2
        else:
            out.append(s[i])
            i += 1
    return ''.join(out)


def parse_code_from_step(step_text: str) -> tuple[str | None, str | None]:
    """Return (code, codeLanguage) parsed from a step block, or (None, None)."""
    # Match: code: '...' OR code: "..."
    code_match = re.search(
        r"^\s*code:\s*(?:'((?:\\.|[^'\\])*)'|\"((?:\\.|[^\"\\])*)\")",
        step_text,
        re.MULTILINE,
    )
    code = None
    if code_match:
        raw = code_match.group(1) if code_match.group(1) is not None else code_match.group(2)
        code = unescape_ts_string(raw)

    lang_match = re.search(r"^\s*codeLanguage:\s*'([^']+)'", step_text, re.MULTILINE)
    lang = lang_match.group(1) if lang_match else None

    return code, lang


def parse_lesson_title_desc(lesson_text: str) -> tuple[str, str]:
    """Extract title and description from a lesson block."""
    title_match = re.search(
        r"^\s*title:\s*'((?:\\.|[^'\\])*)'", lesson_text, re.MULTILINE
    )
    desc_match = re.search(
        r"^\s*description:\s*'((?:\\.|[^'\\])*)'", lesson_text, re.MULTILINE
    )
    title = unescape_ts_string(title_match.group(1)) if title_match else ''
    desc = unescape_ts_string(desc_match.group(1)) if desc_match else ''
    return title, desc


def derive_step_fields(step_text: str, step_indent: str) -> str:
    """Inject Coursera fields into a step block (if not already present)."""
    if 'taskType:' in step_text:
        return step_text

    code, lang = parse_code_from_step(step_text)

    if code is None:
        task_type = 'read'
    elif lang == 'python':
        task_type = 'code'
    else:
        # Non-Python code (bash, js, etc.) — display as read-only.
        task_type = 'read'

    expected_output: str | None = None
    if task_type == 'code' and code is not None:
        expected_output = try_run_python(code)

    # Build new fields
    new_lines = [
        f"{step_indent}  taskType: '{task_type}',",
        f"{step_indent}  estimatedMinutes: 5,",
        f"{step_indent}  instructions: [",
    ]
    for inst in INSTRUCTIONS[task_type]:
        new_lines.append(f"{step_indent}    '{ts_escape(inst)}',")
    new_lines.append(f"{step_indent}  ],")
    if expected_output:
        new_lines.append(f"{step_indent}  expectedOutput: '{ts_escape(expected_output)}',")

    new_fields_text = '\n'.join(new_lines)

    # Find the step's closing brace (last line matching ^<step_indent>\},?)
    lines = step_text.split('\n')
    close_idx = None
    for j in range(len(lines) - 1, -1, -1):
        if re.match(r'^' + re.escape(step_indent) + r'\},?\s*$', lines[j]):
            close_idx = j
            break
    if close_idx is None:
        return step_text  # bail out

    # Insert new fields before the closing brace
    inserted = new_fields_text.split('\n')
    new_block_lines = lines[:close_idx] + inserted + lines[close_idx:]
    return '\n'.join(new_block_lines)


def derive_lesson_fields(lesson_text: str, lesson_field_indent: str) -> str:
    """Inject lesson-level Coursera fields after videoUrl: ...,"""
    if 'lessonType:' in lesson_text:
        return lesson_text

    title, desc = parse_lesson_title_desc(lesson_text)

    # Derive whatYouLearn from description (split into sentences, take first 3)
    what_you_learn: list[str] = []
    if desc:
        sentences = re.split(r'(?<=[.!?])\s+', desc)
        what_you_learn = [s.strip() for s in sentences[:3] if s.strip()]
    if not what_you_learn:
        what_you_learn = [f'Understand {title}' if title else 'Complete this lesson']

    # Skills and tools left as empty arrays — can be hand-curated later.
    insertion_lines = [
        f"{lesson_field_indent}lessonType: 'Lesson',",
        f"{lesson_field_indent}whatYouLearn: [",
    ]
    for item in what_you_learn:
        insertion_lines.append(f"{lesson_field_indent}  '{ts_escape(item)}',")
    insertion_lines.append(f"{lesson_field_indent}],")
    insertion_lines.append(f"{lesson_field_indent}skills: [],")
    insertion_lines.append(f"{lesson_field_indent}tools: [],")
    insertion_text = '\n'.join(insertion_lines)

    # Insert after the videoUrl: ... line
    pattern = re.compile(
        r'^(' + re.escape(lesson_field_indent) + r'videoUrl:\s*.+,\s*)$',
        re.MULTILINE,
    )
    if not pattern.search(lesson_text):
        return lesson_text  # no videoUrl — bail

    new_text = pattern.sub(lambda m: m.group(1) + '\n' + insertion_text, lesson_text, count=1)
    return new_text


def process_lesson_block(lesson_text: str, lesson_field_indent: str) -> str:
    """Apply lesson-level enrichment, then step-level enrichment within the lesson."""
    # First, lesson-level fields
    lesson_text = derive_lesson_fields(lesson_text, lesson_field_indent)

    # Then, step-level
    step_indent = lesson_field_indent + '  '  # 14 spaces for python-pro
    in_steps = False
    out_lines: list[str] = []
    lines = lesson_text.split('\n')
    j = 0
    while j < len(lines):
        ll = lines[j]
        # Detect `steps: [` at lesson_field_indent
        if re.match(r'^' + re.escape(lesson_field_indent) + r'steps:\s*\[\s*$', ll):
            in_steps = True
            out_lines.append(ll)
            j += 1
            continue
        # Detect end of steps array
        if in_steps and re.match(r'^' + re.escape(lesson_field_indent) + r'\],?\s*$', ll):
            in_steps = False
            out_lines.append(ll)
            j += 1
            continue
        # Detect start of a step `{` at step_indent
        if in_steps and re.match(r'^' + re.escape(step_indent) + r'\{\s*$', ll):
            step_lines = [ll]
            j += 1
            while j < len(lines):
                sl = lines[j]
                step_lines.append(sl)
                if re.match(r'^' + re.escape(step_indent) + r'\},?\s*$', sl):
                    j += 1
                    break
                j += 1
            step_text = '\n'.join(step_lines)
            new_step_text = derive_step_fields(step_text, step_indent)
            out_lines.append(new_step_text)
            continue
        out_lines.append(ll)
        j += 1
    return '\n'.join(out_lines)


def main() -> int:
    src = COURSES_PATH.read_text()
    lines = src.split('\n')
    out: list[str] = []
    i = 0

    lessons_touched = 0
    steps_touched = 0

    while i < len(lines):
        line = lines[i]
        # Detect lesson id at any indent — capture indent for use as lesson_field_indent
        m = re.match(
            r'^( +)id:\s*\'([a-z]+-m[0-9]+-l[0-9]+)\',\s*$',
            line,
        )
        if m:
            lesson_field_indent = m.group(1)  # 12 spaces for python-pro
            lesson_id = m.group(2)
            # Collect all lesson lines until the closing brace at indent
            # STRICTLY LESS than lesson_field_indent (and > 0).
            lesson_lines = [line]
            i += 1
            while i < len(lines):
                l = lines[i]
                cm = re.match(r'^( +)\},?\s*$', l)
                if cm and 0 < len(cm.group(1)) < len(lesson_field_indent):
                    lesson_lines.append(l)
                    i += 1
                    break
                lesson_lines.append(l)
                i += 1

            lesson_text = '\n'.join(lesson_lines)
            new_lesson_text = process_lesson_block(lesson_text, lesson_field_indent)
            if new_lesson_text != lesson_text:
                lessons_touched += 1
                # Count step changes
                before_steps = lesson_text.count('taskType:')
                after_steps = new_lesson_text.count('taskType:')
                steps_touched += max(0, after_steps - before_steps)
            out.append(new_lesson_text)
            continue

        out.append(line)
        i += 1

    new_src = '\n'.join(out)
    if new_src == src:
        print('No changes made.')
        return 0

    # Backup
    backup_path = COURSES_PATH.with_suffix('.ts.bak')
    if not backup_path.exists():
        backup_path.write_text(src)

    COURSES_PATH.write_text(new_src)

    # Stats
    print(f'Lessons touched:           {lessons_touched}')
    print(f'Steps enriched (new):      {steps_touched}')
    print(f'taskType total (was 6):    {new_src.count("taskType:")} (delta +{new_src.count("taskType:") - src.count("taskType:")})')
    print(f'lessonType total (was 6):  {new_src.count("lessonType:")} (delta +{new_src.count("lessonType:") - src.count("lessonType:")})')
    print(f'instructions blocks total: {new_src.count("instructions: [")} (delta +{new_src.count("instructions: [") - src.count("instructions: [")})')
    print(f'expectedOutput total:      {new_src.count("expectedOutput:")} (delta +{new_src.count("expectedOutput:") - src.count("expectedOutput:")})')
    print(f'File line count:           {len(new_src.splitlines())} (was {len(src.splitlines())})')
    print(f'Backup saved to:           {backup_path}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
