#!/usr/bin/env python3
"""
Generate a comprehensive Python course with 6 modules/chapters and append it
to src/lib/courses.ts (right before the closing `];`).

Run:  python3 /home/z/my-project/scripts/add_python_course.py
"""
from pathlib import Path
from textwrap import dedent

COURSE_TS = Path("/home/z/my-project/src/lib/courses.ts")

PYTHON_COURSE = r'''
  // ============================================================
  // 6. Python Programming — Beginner to Advanced
  // ============================================================
  {
    id: 'python-pro',
    slug: 'python-programming',
    title: 'Python Programming — Beginner to Advanced',
    subtitle: 'Master Python for web, data, automation, and AI',
    description: 'End-to-end Python course: syntax, OOP, data structures, web (Django/Flask), data science (NumPy/Pandas), automation, testing, and async.',
    longDescription:
      'This comprehensive Python program takes you from writing your first print statement to building production-grade applications. You will start with syntax, variables, control flow, and built-in data structures, then progress to functions, OOP, decorators, generators, and context managers. The course then branches into the three most in-demand Python domains: web development with Flask and Django, data analysis with NumPy/Pandas/Matplotlib, and automation/scripting. You will also master testing with pytest, async programming with asyncio, packaging with pip and pyproject.toml, and modern tooling (ruff, mypy, uv). Every chapter includes video walkthroughs, step-by-step labs, and graded assessments so you graduate with a portfolio of real Python projects.',
    icon: 'Code2',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    level: 'All Levels',
    duration: '12 weeks',
    lessonsCount: 24,
    studentsCount: '18,920',
    rating: 4.9,
    instructor: 'Vikram Iyer',
    instructorTitle: 'Senior Python Engineer, ex-Stripe',
    tags: ['Python 3.12', 'Flask', 'Django', 'NumPy', 'Pandas', 'asyncio', 'pytest', 'FastAPI'],
    whatYouLearn: [
      'Write idiomatic Python 3.12 — type hints, f-strings, dataclasses, pattern matching',
      'Master built-in data structures: lists, dicts, sets, tuples, comprehensions',
      'Build OOP systems with classes, inheritance, dunder methods, and ABCs',
      'Use decorators, generators, context managers, and async/await correctly',
      'Ship a Flask web app and a Django REST API with auth and Postgres',
      'Analyze data with NumPy + Pandas and visualize with Matplotlib/Seaborn',
      'Automate files, Excel, emails, and the browser with scripts',
      'Test with pytest, type-check with mypy, package with pyproject.toml',
    ],
    prerequisites: [
      'A computer with Windows, macOS, or Linux',
      'No prior programming experience needed (we start from zero)',
      'Willingness to practice 4-6 hours per week',
    ],
    modules: [
      // ------------------------------------------------------------
      // Chapter 1 — Python Foundations
      // ------------------------------------------------------------
      {
        id: 'py-m1',
        title: 'Chapter 1 — Python Foundations',
        description: 'Install Python, master syntax, variables, types, I/O, and control flow.',
        lessons: [
          {
            id: 'py-m1-l1',
            title: 'Setting Up Python 3.12 + Your First Program',
            description: 'Install Python, set up a virtual env, write hello world, run a script.',
            duration: '40 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Install Python 3.12',
                content: 'Download the official installer from python.org for Windows or macOS. On Linux, use your package manager (apt install python3.12). Verify with python --version in a fresh terminal.',
                code: '# Verify Python install\npython --version\n# Python 3.12.4\n\n# Verify pip\npip --version\n# pip 24.0',
                codeLanguage: 'bash',
                tip: 'On Windows, tick "Add Python to PATH" during install or you will not be able to run python from the terminal.',
              },
              {
                title: 'Create a virtual environment',
                content: 'A virtual environment isolates project dependencies so different projects can use different library versions without conflict. Always create one per project.',
                code: '# Create a venv named .venv\npython -m venv .venv\n\n# Activate it\n# macOS / Linux:\nsource .venv/bin/activate\n# Windows (PowerShell):\n.\\.venv\\Scripts\\Activate.ps1\n\n# Confirm activation — your prompt should be prefixed with (.venv)\nwhich python',
                codeLanguage: 'bash',
                tip: 'Add .venv/ to your .gitignore. Never commit a virtual environment folder.',
              },
              {
                title: 'Write your first Python program',
                content: 'Create a file called hello.py. Use print() to write to the console, and input() to read from it. Run the script with python hello.py.',
                code: '# hello.py\nname = input("What is your name? ")\nprint(f"Hello, {name}! Welcome to Python.")\n\n# Run it:\n# python hello.py',
                codeLanguage: 'python',
                tip: 'f-strings (f"...{var}...") are the modern, fast, readable way to format strings. Always prefer them over % or .format().',
              },
              {
                title: 'Install packages with pip',
                content: 'pip is the Python package manager. Install a package with pip install <name>, list installed packages with pip list, and freeze them to a requirements.txt file.',
                code: 'pip install requests\npip install pandas\n\npip list\npip freeze > requirements.txt\n\n# Reinstall from a requirements file:\npip install -r requirements.txt',
                codeLanguage: 'bash',
                tip: 'For modern projects, prefer pyproject.toml + uv (https://github.com/astral-sh/uv) — 10-100x faster than pip.',
              },
            ],
            quiz: [
              {
                id: 'py-m1-l1-q1',
                question: 'Why use a virtual environment per project?',
                options: [
                  'It is required by Python',
                  'To isolate project dependencies and avoid version conflicts',
                  'To make Python run faster',
                  'To enable internet access',
                ],
                correctAnswer: 1,
                explanation: 'Each venv has its own site-packages, so two projects can use different versions of the same library without breaking each other.',
              },
              {
                id: 'py-m1-l1-q2',
                question: 'Which command activates a venv on macOS/Linux?',
                options: [
                  'python activate .venv',
                  '.venv\\Scripts\\activate',
                  'source .venv/bin/activate',
                  'pip activate .venv',
                ],
                correctAnswer: 2,
                explanation: 'On Unix-like systems, the activate script lives at .venv/bin/activate and is sourced with the shell built-in `source`.',
              },
              {
                id: 'py-m1-l1-q3',
                question: 'Which is the recommended way to format strings in modern Python?',
                options: ['% formatting', 'f-strings', 'string concatenation with +', '.format()'],
                correctAnswer: 1,
                explanation: 'f-strings (f"...{x}...") are the fastest and most readable, available since Python 3.6.',
              },
            ],
          },
          {
            id: 'py-m1-l2',
            title: 'Variables, Types & Operators',
            description: 'int, float, str, bool, dynamic typing, type hints, arithmetic, comparison, logical operators.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Dynamic typing basics',
                content: 'Python variables do not have a fixed type — the type lives on the value, not the name. You can rebind a name to any type. Use type() to inspect.',
                code: 'x = 42           # int\nx = "hello"      # now str\nx = [1, 2, 3]    # now list\n\nprint(type(x))   # <class \'list\'>',
                codeLanguage: 'python',
                tip: 'Dynamic typing is flexible but error-prone on large teams. Use type hints (next step) and a type checker like mypy.',
              },
              {
                title: 'Type hints',
                content: 'Type hints document intent and let tools (mypy, pyright, IDEs) catch bugs before runtime. They are optional and ignored at runtime.',
                code: 'def greet(name: str, times: int = 1) -> str:\n    return (f"Hello, {name}! " * times).strip()\n\nmessage: str = greet("Marq", 3)\nprint(message)',
                codeLanguage: 'python',
                tip: 'Run `mypy yourfile.py` to type-check. It catches ~60% of bugs in production Python codebases.',
              },
              {
                title: 'Numbers and arithmetic',
                content: 'Python has int (unbounded), float (IEEE 754), and complex. Operators: + - * / // % **. Use // for floor division and ** for exponentiation.',
                code: 'a, b = 17, 5\nprint(a + b)    # 22\nprint(a / b)    # 3.4   (always float)\nprint(a // b)   # 3     (floor division)\nprint(a % b)    # 2     (modulo)\nprint(a ** b)   # 1419857 (power)\n\n# Beware float precision:\nprint(0.1 + 0.2)  # 0.30000000000000004\n\n# Use decimal for money:\nfrom decimal import Decimal\nprint(Decimal("0.1") + Decimal("0.2"))  # 0.3',
                codeLanguage: 'python',
                tip: 'Never use floats for money. Use decimal.Decimal with string arguments, or integer cents.',
              },
              {
                title: 'Strings and booleans',
                content: 'Strings are immutable sequences of Unicode code points. Booleans are True/False (capitalized). Use .upper(), .lower(), .strip(), .split(), .join() for common ops.',
                code: 's = "  Marq AI  "\nprint(s.strip().upper())      # "MARQ AI"\nprint(",".join(["a", "b", "c"]))  # "a,b,c"\nprint("Marq" in s)             # True\n\nflag: bool = True\nprint(flag and not False)      # True',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m1-l2-q1',
                question: 'What does 17 // 5 return in Python?',
                options: ['3.4', '3', '4', '2'],
                correctAnswer: 1,
                explanation: '// is floor division — it returns the integer floor of the quotient, dropping the remainder.',
              },
              {
                id: 'py-m1-l2-q2',
                question: 'Why should you not use float for monetary calculations?',
                options: [
                  'Floats are too slow',
                  'Floats have precision errors (e.g. 0.1 + 0.2 != 0.3)',
                  'Python does not support floats for math',
                  'Floats are deprecated',
                ],
                correctAnswer: 1,
                explanation: 'Binary floating point cannot exactly represent decimal fractions. Use decimal.Decimal with string args for money.',
              },
              {
                id: 'py-m1-l2-q3',
                question: 'Which statement about type hints is TRUE?',
                options: [
                  'Type hints change runtime behavior',
                  'Type hints are mandatory',
                  'Type hints are ignored at runtime and used by linters/checkers',
                  'Type hints only work for function parameters',
                ],
                correctAnswer: 2,
                explanation: 'Type hints are erased at runtime. Tools like mypy, pyright, and IDEs use them to catch type errors before the code runs.',
              },
            ],
          },
          {
            id: 'py-m1-l3',
            title: 'Control Flow — if / for / while',
            description: 'Conditionals, loops, range, enumerate, zip, break, continue, comprehensions.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Conditionals and truthiness',
                content: 'Use if / elif / else. Falsy values: None, False, 0, 0.0, "", [], {}, set(), (). Everything else is truthy. Use `in` to test membership.',
                code: 'score = 78\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelse:\n    grade = "F"\nprint(grade)  # C\n\n# Truthiness\nprint(bool([]))     # False\nprint(bool([0]))    # True — non-empty list',
                codeLanguage: 'python',
              },
              {
                title: 'for loops with range, enumerate, zip',
                content: 'Python for loops iterate over iterables. Use range() for counters, enumerate() to get index+value, zip() to walk multiple iterables in parallel.',
                code: '# range\nfor i in range(3):\n    print(i)  # 0, 1, 2\n\n# enumerate — preferred way to get index + value\nfruits = ["apple", "banana", "cherry"]\nfor i, fruit in enumerate(fruits):\n    print(f"{i}: {fruit}")\n\n# zip — walk two lists in parallel\nnames = ["Anika", "Vikram"]\nages = [29, 34]\nfor name, age in zip(names, ages):\n    print(f"{name} is {age}")',
                codeLanguage: 'python',
                tip: 'Avoid `for i in range(len(items))`. Use `for i, item in enumerate(items)` instead — more Pythonic.',
              },
              {
                title: 'while loops, break, continue',
                content: 'while loops run as long as the condition is truthy. Use break to exit a loop early and continue to skip to the next iteration.',
                code: '# Guessing game\nimport random\ntarget = random.randint(1, 10)\nattempts = 0\nwhile True:\n    guess = int(input("Guess 1-10: "))\n    attempts += 1\n    if guess == target:\n        print(f"Got it in {attempts} tries!")\n        break\n    if guess < target:\n        print("Higher")\n    else:\n        print("Lower")',
                codeLanguage: 'python',
              },
              {
                title: 'Comprehensions',
                content: 'List, dict, and set comprehensions are the idiomatic way to transform and filter sequences in one line. Faster than .append() in a loop.',
                code: '# List comprehension\nsquares = [x * x for x in range(10)]\n# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\n# With filter\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Dict comprehension\nword_len = {w: len(w) for w in ["cat", "dog", "elephant"]}\n# {\'cat\': 3, \'dog\': 3, \'elephant\': 8}\n\n# Set comprehension\nunique_lens = {len(w) for w in ["cat", "dog", "elephant"]}\n# {3, 8}',
                codeLanguage: 'python',
                tip: 'If a comprehension spans more than 2 lines, refactor into a regular for loop for readability.',
              },
            ],
            quiz: [
              {
                id: 'py-m1-l3-q1',
                question: 'Which is the most Pythonic way to loop with an index?',
                options: [
                  'for i in range(len(items)): print(items[i])',
                  'for i, item in enumerate(items): print(i, item)',
                  'i = 0; while i < len(items): print(items[i]); i += 1',
                  'items.forEach((item, i) => print(i, item))',
                ],
                correctAnswer: 1,
                explanation: 'enumerate() yields (index, value) tuples — clean and efficient.',
              },
              {
                id: 'py-m1-l3-q2',
                question: 'What does [x*x for x in range(5) if x % 2 == 0] produce?',
                options: ['[0, 1, 4, 9, 16]', '[0, 4, 16]', '[0, 2, 4]', '[4, 16]'],
                correctAnswer: 1,
                explanation: 'It filters to even x (0, 2, 4) and squares each: 0, 4, 16.',
              },
              {
                id: 'py-m1-l3-q3',
                question: 'Which value is truthy in Python?',
                options: ['0', '""', '[]', '[0]'],
                correctAnswer: 3,
                explanation: 'A non-empty list (even one containing only zero) is truthy.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 2 — Built-in Data Structures
      // ------------------------------------------------------------
      {
        id: 'py-m2',
        title: 'Chapter 2 — Built-in Data Structures',
        description: 'Lists, tuples, dicts, sets — when to use each and how to use them well.',
        lessons: [
          {
            id: 'py-m2-l1',
            title: 'Lists & Tuples',
            description: 'Mutable vs immutable sequences, slicing, list methods, tuple unpacking.',
            duration: '50 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Lists — ordered, mutable',
                content: 'Lists hold an ordered sequence of any objects. Use append(), extend(), insert(), pop(), remove(), sort(), reverse(). Lists are mutable.',
                code: 'nums = [3, 1, 4, 1, 5, 9, 2, 6]\nnums.append(5)         # [3, 1, 4, 1, 5, 9, 2, 6, 5]\nnums.sort()            # [1, 1, 2, 3, 4, 5, 5, 6, 9]\nnums.reverse()         # [9, 6, 5, 5, 4, 3, 2, 1, 1]\nprint(nums.count(5))   # 2\nprint(nums.index(4))   # 4',
                codeLanguage: 'python',
              },
              {
                title: 'Slicing',
                content: 'slice syntax: list[start:stop:step]. stop is exclusive. Negative indices count from the end. Slicing returns a new list (shallow copy).',
                code: 's = "MarqAI Software Tutor"\nprint(s[0:4])    # "Marq"\nprint(s[-6:])    # "Tutor"\nprint(s[::2])    # "MrAIsfwrTto"\nprint(s[::-1])   # "rotuT erawtoS IAqraM"  (reverse)\n\n# Copy a list\noriginal = [1, 2, 3]\ncopy = original[:]',
                codeLanguage: 'python',
                tip: 'list[::-1] is the fastest idiomatic way to reverse a sequence in Python.',
              },
              {
                title: 'Tuples — immutable, hashable',
                content: 'Tuples are like lists but cannot be changed. They are hashable (can be dict keys / set members) and slightly faster. Use them for fixed records.',
                code: 'point = (10, 20)\nx, y = point              # tuple unpacking\nprint(x, y)               # 10 20\n\n# Tuple of tuples as a 2D lookup\nrgb = {\n    ("red", "dark"):   (139, 0, 0),\n    ("green", "dark"): (0, 100, 0),\n}\nprint(rgb[("red", "dark")])  # (139, 0, 0)\n\n# Single-element tuple needs a trailing comma\none = (42,)\nprint(type(one))  # <class \'tuple\'>',
                codeLanguage: 'python',
              },
              {
                title: 'Named tuples and dataclasses',
                content: 'For structured records with named fields, prefer dataclasses (mutable, modern) or NamedTuple (immutable, lightweight).',
                code: 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n    label: str = ""\n\np = Point(10, 20, "origin")\nprint(p.x, p.y, p.label)   # 10 20 origin\nprint(p)                    # Point(x=10, y=20, label=\'origin\')',
                codeLanguage: 'python',
                tip: 'dataclasses auto-generate __init__, __repr__, and __eq__. Add @dataclass(frozen=True) for immutability.',
              },
            ],
            quiz: [
              {
                id: 'py-m2-l1-q1',
                question: 'What is the difference between a list and a tuple?',
                options: [
                  'Lists can hold mixed types, tuples cannot',
                  'Lists are mutable, tuples are immutable',
                  'Lists are faster, tuples are slower',
                  'There is no difference',
                ],
                correctAnswer: 1,
                explanation: 'Lists can be modified after creation; tuples cannot. Tuples are also hashable (can be dict keys).',
              },
              {
                id: 'py-m2-l1-q2',
                question: 'What does s[::-1] do?',
                options: [
                  'Returns the first character',
                  'Returns the last character',
                  'Returns the reversed sequence',
                  'Raises an error',
                ],
                correctAnswer: 2,
                explanation: 'slice [::-1] steps backward through the whole sequence, effectively reversing it.',
              },
              {
                id: 'py-m2-l1-q3',
                question: 'Which decorator auto-generates __init__ and __repr__ for a class?',
                options: ['@classmethod', '@staticmethod', '@dataclass', '@property'],
                correctAnswer: 2,
                explanation: '@dataclass (from dataclasses module) auto-generates boilerplate for plain data-holding classes.',
              },
            ],
          },
          {
            id: 'py-m2-l2',
            title: 'Dictionaries & Sets',
            description: 'Hash maps, dict methods, defaultdict, Counter, set operations.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Dicts — hash maps',
                content: 'Dicts map hashable keys to values. Insertion order is preserved (Python 3.7+). Use [] for get/set, .get() for safe access, .items() for iteration.',
                code: 'user = {"name": "Anika", "age": 29, "role": "admin"}\n\nprint(user["name"])            # Anika\nprint(user.get("email"))        # None (no KeyError)\nprint(user.get("email", "-"))   # "-"  (default)\n\nuser["email"] = "anika@marq.ai"  # add key\nuser["age"] = 30                  # update\n\nfor key, value in user.items():\n    print(f"{key} = {value}")',
                codeLanguage: 'python',
              },
              {
                title: 'defaultdict & Counter',
                content: 'collections.defaultdict auto-creates missing keys. collections.Counter counts hashable items. Both save boilerplate.',
                code: 'from collections import defaultdict, Counter\n\n# Group words by first letter\nwords = ["apple", "ant", "banana", "berry", "cherry"]\nby_letter = defaultdict(list)\nfor w in words:\n    by_letter[w[0]].append(w)\nprint(dict(by_letter))\n# {\'a\': [\'apple\', \'ant\'], \'b\': [\'banana\', \'berry\'], \'c\': [\'cherry\']}\n\n# Count word frequency\ntext = "the cat sat on the mat the cat"\nfreq = Counter(text.split())\nprint(freq.most_common(2))  # [(\'the\', 3), (\'cat\', 2)]',
                codeLanguage: 'python',
                tip: 'Counter is ~10x faster than a manual dict-counting loop because it is implemented in C.',
              },
              {
                title: 'Sets — unordered unique items',
                content: 'Sets store unique hashable items. Use them for membership tests (O(1)) and set algebra (union, intersection, difference).',
                code: 'a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\n\nprint(a | b)   # {1, 2, 3, 4, 5, 6}  union\nprint(a & b)   # {3, 4}              intersection\nprint(a - b)   # {1, 2}              difference\nprint(a ^ b)   # {1, 2, 5, 6}        symmetric difference\n\n# Membership test is O(1) vs O(n) for lists\nprint(3 in a)  # True',
                codeLanguage: 'python',
              },
              {
                title: 'Dict comprehensions & merging',
                content: 'Build dicts from iterables with comprehensions. Merge dicts with the | operator (Python 3.9+).',
                code: '# Square each value\nnums = [1, 2, 3, 4]\nsquares = {n: n * n for n in nums}\n# {1: 1, 2: 4, 3: 9, 4: 16}\n\n# Merge two dicts (3.9+)\ndefaults = {"theme": "light", "lang": "en"}\nuser_prefs = {"theme": "dark"}\nmerged = defaults | user_prefs\n# {\'theme\': \'dark\', \'lang\': \'en\'}',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m2-l2-q1',
                question: 'What is the time complexity of `key in dict`?',
                options: ['O(n)', 'O(log n)', 'O(1) average', 'O(n log n)'],
                correctAnswer: 2,
                explanation: 'Dicts are hash maps — average O(1) membership test. Worst case O(n) only with hash collisions.',
              },
              {
                id: 'py-m2-l2-q2',
                question: 'Which collection auto-creates missing keys with a default factory?',
                options: ['dict', 'OrderedDict', 'defaultdict', 'ChainMap'],
                correctAnswer: 2,
                explanation: 'collections.defaultdict(factory) calls factory() to create missing keys — e.g. defaultdict(list) auto-creates empty lists.',
              },
              {
                id: 'py-m2-l2-q3',
                question: 'What does Counter("a b b c c c".split()).most_common(1) return?',
                options: ["[('a', 1)]", "[('c', 3)]", "[('b', 2)]", "[('c', 3), ('b', 2), ('a', 1)]"],
                correctAnswer: 1,
                explanation: 'Counter counts occurrences. most_common(1) returns the single most frequent item with its count.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 3 — Functions, OOP, Functional Tools
      // ------------------------------------------------------------
      {
        id: 'py-m3',
        title: 'Chapter 3 — Functions, OOP & Functional Tools',
        description: 'Functions, args/kwargs, lambdas, classes, inheritance, decorators, generators.',
        lessons: [
          {
            id: 'py-m3-l1',
            title: 'Functions, *args, **kwargs',
            description: 'Defining, calling, default args, keyword args, varargs, type hints, lambdas.',
            duration: '50 min',
            videoUrl: SAMPLE_VIDEO_6,
            steps: [
              {
                title: 'Function basics',
                content: 'Define with def. Pass args by position or by name. Default args use =. Return None if no return statement.',
                code: 'def greet(name: str, greeting: str = "Hello") -> str:\n    return f"{greeting}, {name}!"\n\nprint(greet("Anika"))                # Hello, Anika!\nprint(greet("Vikram", "Hi"))         # Hi, Vikram!\nprint(greet(greeting="Yo", name="Riya"))  # Yo, Riya!',
                codeLanguage: 'python',
                tip: 'NEVER use a mutable default argument like def f(items=[]). The list is shared across calls! Use None and create inside.',
              },
              {
                title: '*args and **kwargs',
                content: '*args collects extra positional args into a tuple. **kwargs collects extra keyword args into a dict. Useful for flexible APIs and forwarding.',
                code: 'def log(message: str, *args, **kwargs) -> None:\n    print(f"[LOG] {message}")\n    if args:\n        print(f"  positional: {args}")\n    if kwargs:\n        print(f"  keyword:    {kwargs}")\n\nlog("started", "user1", "user2", level="info", retry=3)\n# [LOG] started\n#   positional: (\'user1\', \'user2\')\n#   keyword:    {\'level\': \'info\', \'retry\': 3}',
                codeLanguage: 'python',
              },
              {
                title: 'Lambda, map, filter, sorted',
                content: 'Lambdas are one-expression anonymous functions. Use them sparingly — prefer named functions for anything complex.',
                code: '# Sort users by age\nusers = [{"name": "Anika", "age": 29}, {"name": "Vikram", "age": 34}]\nyoungest = sorted(users, key=lambda u: u["age"])[0]\nprint(youngest)  # {\'name\': \'Anika\', \'age\': 29}\n\n# map and filter (prefer comprehensions in Python)\nnums = [1, 2, 3, 4, 5]\nsquares = list(map(lambda x: x * x, nums))\nevens = list(filter(lambda x: x % 2 == 0, nums))\n\n# Equivalent comprehensions (preferred):\nsquares = [x * x for x in nums]\nevens   = [x for x in nums if x % 2 == 0]',
                codeLanguage: 'python',
                tip: 'Prefer comprehensions over map/filter — they are more readable and usually faster.',
              },
              {
                title: 'Type hints for advanced signatures',
                content: 'Use typing module for collections, optional, callable, etc. In Python 3.9+ use built-in generics (list[int] instead of List[int]).',
                code: 'from typing import Optional, Callable\n\ndef first_or_none(items: list[int]) -> Optional[int]:\n    return items[0] if items else None\n\ndef apply(fn: Callable[[int], int], x: int) -> int:\n    return fn(x)\n\nprint(first_or_none([]))           # None\nprint(apply(lambda n: n * 2, 21))  # 42',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m3-l1-q1',
                question: 'Why is `def f(items=[])` a bug?',
                options: [
                  'It is a syntax error',
                  'The default list is shared across all calls to f',
                  'You cannot use [] as a default',
                  'It works correctly',
                ],
                correctAnswer: 1,
                explanation: 'Default args are evaluated once at definition time. A mutable default persists across calls. Use def f(items=None): items = items or [] instead.',
              },
              {
                id: 'py-m3-l1-q2',
                question: 'What does **kwargs collect?',
                options: [
                  'Extra positional args as a tuple',
                  'Extra keyword args as a dict',
                  'All args as a list',
                  'Nothing — it is a syntax error',
                ],
                correctAnswer: 1,
                explanation: '**kwargs collects keyword arguments that do not match named parameters into a dict.',
              },
              {
                id: 'py-m3-l1-q3',
                question: 'Which is the modern preferred way to write a list of ints type hint?',
                options: ['List[int]', 'list[int]', 'List<Integer>', 'Array<int>'],
                correctAnswer: 1,
                explanation: 'Since Python 3.9, you can use built-in generics like list[int] directly. typing.List is now mostly unnecessary.',
              },
            ],
          },
          {
            id: 'py-m3-l2',
            title: 'Classes, Inheritance & Dunder Methods',
            description: 'Class basics, __init__, __repr__, __eq__, inheritance, super(), ABCs.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Class basics and __init__',
                content: 'Classes bundle data (attributes) and behavior (methods). __init__ runs after the object is created and sets initial state. self refers to the instance.',
                code: 'class BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount: float) -> None:\n        if amount <= 0:\n            raise ValueError("amount must be positive")\n        self.balance += amount\n\n    def withdraw(self, amount: float) -> None:\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount\n\nacc = BankAccount("Anika", 100)\nacc.deposit(50)\nacc.withdraw(20)\nprint(acc.balance)  # 130',
                codeLanguage: 'python',
              },
              {
                title: 'Dunder methods',
                content: 'Dunder (double-underscore) methods implement Python protocols. __repr__ for debug output, __eq__ for ==, __lt__ for <, __len__ for len(), __str__ for str().',
                code: 'class Temperature:\n    def __init__(self, celsius: float):\n        self.celsius = celsius\n\n    def __repr__(self) -> str:\n        return f"Temperature({self.celsius}°C)"\n\n    def __eq__(self, other: object) -> bool:\n        if not isinstance(other, Temperature):\n            return NotImplemented\n        return self.celsius == other.celsius\n\n    def __lt__(self, other: "Temperature") -> bool:\n        return self.celsius < other.celsius\n\nt1 = Temperature(20)\nt2 = Temperature(30)\nprint(t1)            # Temperature(20°C)\nprint(t1 < t2)       # True\nprint(sorted([t2, t1]))  # [Temperature(20°C), Temperature(30°C)]',
                codeLanguage: 'python',
                tip: 'Implement __repr__ on every domain class — it makes debugging 10x easier and is the foundation for nice error messages.',
              },
              {
                title: 'Inheritance and super()',
                content: 'Subclasses inherit attributes and methods from a base class. Override methods to specialize. Call super() to invoke the parent implementation.',
                code: 'class SavingsAccount(BankAccount):\n    def __init__(self, owner: str, balance: float = 0.0, rate: float = 0.04):\n        super().__init__(owner, balance)\n        self.rate = rate\n\n    def apply_interest(self) -> None:\n        self.deposit(self.balance * self.rate)\n\ns = SavingsAccount("Vikram", 1000, rate=0.05)\ns.apply_interest()\nprint(s.balance)  # 1050.0',
                codeLanguage: 'python',
              },
              {
                title: 'Abstract base classes',
                content: 'Use abc.ABC and @abstractmethod to define interfaces that subclasses must implement. Trying to instantiate an abstract class raises TypeError.',
                code: 'from abc import ABC, abstractmethod\n\nclass PaymentGateway(ABC):\n    @abstractmethod\n    def charge(self, amount: float) -> bool:\n        ...\n\nclass StripeGateway(PaymentGateway):\n    def charge(self, amount: float) -> bool:\n        print(f"Charging ${amount} via Stripe")\n        return True\n\n# PaymentGateway()  # TypeError — cannot instantiate abstract class\ngw = StripeGateway()\ngw.charge(49.99)',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m3-l2-q1',
                question: 'What does __init__ do?',
                options: [
                  'Creates a new instance (allocates memory)',
                  'Initializes the instance after it is created',
                  'Deletes the instance',
                  'Compares two instances',
                ],
                correctAnswer: 1,
                explanation: '__new__ creates the instance. __init__ runs after and initializes attributes on the already-created object.',
              },
              {
                id: 'py-m3-l2-q2',
                question: 'Why call super().__init__() in a subclass?',
                options: [
                  'It is required syntax',
                  'To reuse the parent class initialization logic',
                  'To delete the parent class',
                  'To make the class abstract',
                ],
                correctAnswer: 1,
                explanation: 'super() returns a proxy for the parent class. Calling __init__ ensures the parent\'s setup runs and attributes are properly initialized.',
              },
              {
                id: 'py-m3-l2-q3',
                question: 'Which dunder method does sorted() use to compare objects?',
                options: ['__init__', '__repr__', '__lt__', '__iter__'],
                correctAnswer: 2,
                explanation: 'sorted() uses __lt__ (less-than) to establish ordering. Implement __lt__ to make a class sortable.',
              },
            ],
          },
          {
            id: 'py-m3-l3',
            title: 'Decorators & Generators',
            description: 'Function decorators, @property, generator functions with yield, lazy evaluation.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Decorators — wrap a function',
                content: 'A decorator is a function that takes a function and returns a new function. Use @decorator syntax. Decorators are great for logging, caching, auth, retries.',
                code: 'import time\nfrom functools import wraps\n\ndef timed(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = fn(*args, **kwargs)\n        elapsed = (time.perf_counter() - start) * 1000\n        print(f"{fn.__name__} took {elapsed:.2f}ms")\n        return result\n    return wrapper\n\n@timed\ndef slow_sum(n: int) -> int:\n    return sum(range(n))\n\nprint(slow_sum(1_000_000))\n# slow_sum took 28.14ms\n# 499999500000',
                codeLanguage: 'python',
                tip: 'Always use @functools.wraps on your wrapper — it copies the original function\'s name, docstring, and signature so introspection still works.',
              },
              {
                title: '@property — managed attributes',
                content: '@property turns a method into a getter. Use @x.setter to add a setter. Great for validation, computed fields, and keeping APIs stable when you add logic later.',
                code: 'class Product:\n    def __init__(self, price: float):\n        self.price = price  # calls the setter\n\n    @property\n    def price(self) -> float:\n        return self._price\n\n    @price.setter\n    def price(self, value: float) -> None:\n        if value < 0:\n            raise ValueError("price cannot be negative")\n        self._price = value\n\np = Product(9.99)\nprint(p.price)        # 9.99\np.price = 12.50\n# p.price = -5  # ValueError',
                codeLanguage: 'python',
              },
              {
                title: 'Generators — lazy streams',
                content: 'A generator function uses yield instead of return. Each call to next() resumes execution until the next yield. Generators are memory-efficient for large or infinite sequences.',
                code: 'def fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ngen = fibonacci()\nfor _ in range(10):\n    print(next(gen), end=" ")\n# 0 1 1 2 3 5 8 13 21 34\n\n# Memory-efficient line reader\ndef read_large_file(path):\n    with open(path) as f:\n        for line in f:\n            yield line.rstrip()',
                codeLanguage: 'python',
                tip: 'Use generators for streaming pipelines (read → transform → write). They let you process terabytes of data with constant memory.',
              },
              {
                title: 'Generator expressions & itertools',
                content: 'Generator expressions look like list comprehensions but use parentheses — they yield items lazily. itertools provides fast functional helpers.',
                code: 'import itertools\n\n# Generator expression — does not materialize the list\nnums = (x * x for x in range(1_000_000))\nprint(sum(nums))  # 333332833333500000\n\n# itertools — chains, cycles, permutations, combinations\nprint(list(itertools.combinations("ABC", 2)))\n# [(\'A\', \'B\'), (\'A\', \'C\'), (\'B\', \'C\')]\n\nfor a, b in zip(itertools.cycle([0, 1]), range(5)):\n    print(a, b, end=" | ")\n# 0 0 | 1 1 | 0 2 | 1 3 | 0 4 |',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m3-l3-q1',
                question: 'Why use @functools.wraps in a decorator?',
                options: [
                  'It is required syntax',
                  'To preserve the wrapped function\'s name and docstring',
                  'To make the function faster',
                  'To prevent the function from being called',
                ],
                correctAnswer: 1,
                explanation: 'Without @wraps, the wrapper function shadows the original — __name__ becomes "wrapper", docstrings are lost, and tools like help() break.',
              },
              {
                id: 'py-m3-l3-q2',
                question: 'What does a generator function use instead of return?',
                options: ['yield', 'send', 'emit', 'produce'],
                correctAnswer: 0,
                explanation: 'yield pauses the function and emits a value. The next call to next() resumes execution right after the yield.',
              },
              {
                id: 'py-m3-l3-q3',
                question: 'What is the difference between [x for x in range(N)] and (x for x in range(N))?',
                options: [
                  'No difference',
                  'The first is a list (eager), the second is a generator (lazy)',
                  'The first is a set, the second is a list',
                  'The first is faster',
                ],
                correctAnswer: 1,
                explanation: 'Square brackets build a list in memory. Parentheses create a generator that yields items one at a time, using O(1) memory.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 4 — Web Development (Flask & Django)
      // ------------------------------------------------------------
      {
        id: 'py-m4',
        title: 'Chapter 4 — Web Development with Flask & Django',
        description: 'Build a REST API with Flask, then a full web app with Django and DRF.',
        lessons: [
          {
            id: 'py-m4-l1',
            title: 'Flask REST API in 60 Minutes',
            description: 'Routes, JSON, request parsing, blueprints, error handling, running the server.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Install Flask and create the app',
                content: 'Flask is a micro web framework — minimal core, you compose what you need. Install it and create app.py with a 5-line web server.',
                code: '# Install\npip install flask\n\n# app.py\nfrom flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.get("/health")\ndef health():\n    return jsonify(status="ok")\n\nif __name__ == "__main__":\n    app.run(debug=True, port=5000)\n\n# Run: python app.py\n# Visit: http://localhost:5000/health',
                codeLanguage: 'python',
              },
              {
                title: 'Path params, query params, JSON body',
                content: 'Use <type:name> in routes for path params. Use request.args for query strings. Use request.get_json() for JSON bodies.',
                code: 'from flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.get("/users/<int:user_id>")\ndef get_user(user_id: int):\n    return jsonify(id=user_id, name="Anika")\n\n@app.get("/search")\ndef search():\n    q = request.args.get("q", "")\n    limit = request.args.get("limit", 10, type=int)\n    return jsonify(query=q, limit=limit, results=[])\n\n@app.post("/users")\ndef create_user():\n    data = request.get_json()\n    return jsonify(created=data), 201',
                codeLanguage: 'python',
              },
              {
                title: 'Blueprints for modular routes',
                content: 'Group related routes into a Blueprint, then register it on the app. This keeps large apps organized.',
                code: '# users_api.py\nfrom flask import Blueprint, jsonify\n\nbp = Blueprint("users", __name__, url_prefix="/api/users")\n\n@bp.get("/")\ndef list_users():\n    return jsonify(users=[])\n\n@bp.get("/<int:user_id>")\ndef get_user(user_id: int):\n    return jsonify(id=user_id)\n\n# app.py\nfrom flask import Flask\nfrom users_api import bp as users_bp\n\napp = Flask(__name__)\napp.register_blueprint(users_bp)',
                codeLanguage: 'python',
              },
              {
                title: 'Error handling and validation',
                content: 'Use abort() and errorhandler to return proper HTTP errors. Use a validation library like pydantic or marshmallow for request bodies.',
                code: 'from flask import Flask, jsonify, request, abort\nfrom pydantic import BaseModel, ValidationError, Field\n\napp = Flask(__name__)\n\nclass NewUser(BaseModel):\n    name: str = Field(min_length=1, max_length=80)\n    email: str\n    age: int = Field(ge=0, le=150)\n\n@app.post("/users")\ndef create_user():\n    try:\n        user = NewUser.model_validate(request.get_json())\n    except ValidationError as e:\n        abort(400, description=e.errors())\n    return jsonify(user.model_dump()), 201\n\n@app.errorhandler(400)\ndef bad_request(err):\n    return jsonify(error=err.description), 400',
                codeLanguage: 'python',
                tip: 'Pair Flask with Flask-SQLAlchemy (ORM), Flask-Migrate (Alembic), and Flask-CORS for a complete backend stack.',
              },
            ],
            quiz: [
              {
                id: 'py-m4-l1-q1',
                question: 'Which decorator defines a GET route in Flask 2.3+?',
                options: ['@app.route("/x")', '@app.get("/x")', '@route(app, "/x")', '@http("GET", "/x")'],
                correctAnswer: 1,
                explanation: 'Flask 2.0+ added @app.get, @app.post, etc. — cleaner than @app.route("/x", methods=["GET"]).',
              },
              {
                id: 'py-m4-l1-q2',
                question: 'How do you read a JSON request body in Flask?',
                options: [
                  'request.body',
                  'request.json (or request.get_json())',
                  'request.data.json()',
                  'flask.read_json()',
                ],
                correctAnswer: 1,
                explanation: 'request.get_json() (or the request.json shortcut) parses the body as JSON and returns a dict.',
              },
              {
                id: 'py-m4-l1-q3',
                question: 'What are Blueprints for?',
                options: [
                  'Database models',
                  'Modular grouping of routes that get registered on the app',
                  'Authentication',
                  'Frontend templates',
                ],
                correctAnswer: 1,
                explanation: 'Blueprints group related routes + handlers so you can split a large app into multiple modules, then register them on the app.',
              },
            ],
          },
          {
            id: 'py-m4-l2',
            title: 'Django + DRF — Full Stack in One Hour',
            description: 'Project setup, models, migrations, serializers, viewsets, router, admin.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Install Django + DRF and scaffold the project',
                content: 'Django is a batteries-included web framework. Django REST Framework (DRF) adds serialization and browsable APIs on top.',
                code: 'pip install django djangorestframework\n\ndjango-admin startproject myproject .\npython manage.py startapp blog\n\n# myproject/settings.py — add to INSTALLED_APPS:\nINSTALLED_APPS = [\n    # ...\n    "rest_framework",\n    "blog",\n]\n\npython manage.py migrate\npython manage.py runserver',
                codeLanguage: 'bash',
              },
              {
                title: 'Define a model and run migrations',
                content: 'Models are Python classes that map to database tables. makemigrations generates SQL diffs; migrate applies them.',
                code: '# blog/models.py\nfrom django.db import models\nfrom django.utils import timezone\n\nclass Post(models.Model):\n    title = models.CharField(max_length=200)\n    slug = models.SlugField(unique=True)\n    body = models.TextField()\n    published_at = models.DateTimeField(default=timezone.now)\n    is_published = models.BooleanField(default=False)\n\n    def __str__(self) -> str:\n        return self.title\n\n# Terminal\npython manage.py makemigrations\npython manage.py migrate',
                codeLanguage: 'python',
              },
              {
                title: 'Serializer + ViewSet + Router',
                content: 'Serializers convert model instances to JSON. ViewSets define CRUD behavior. Routers wire ViewSets to URLs.',
                code: '# blog/serializers.py\nfrom rest_framework import serializers\nfrom .models import Post\n\nclass PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Post\n        fields = "__all__"\n\n# blog/views.py\nfrom rest_framework import viewsets\nfrom .models import Post\nfrom .serializers import PostSerializer\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer\n\n# blog/urls.py\nfrom rest_framework.routers import DefaultRouter\nfrom .views import PostViewSet\n\nrouter = DefaultRouter()\nrouter.register("posts", PostViewSet)\nurlpatterns = router.urls\n\n# myproject/urls.py — include them\nfrom django.urls import path, include\nurlpatterns = [path("api/", include("blog.urls"))]',
                codeLanguage: 'python',
                tip: 'ModelViewSet gives you GET /api/posts/, POST /api/posts/, GET /api/posts/<id>/, PUT/PATCH, DELETE — all 5 REST endpoints in ~10 lines of code.',
              },
              {
                title: 'Admin + auth + permissions',
                content: 'Django admin is a free CRUD UI. Register your model. Add auth with built-in User model + DRF permissions.',
                code: '# blog/admin.py\nfrom django.contrib import admin\nfrom .models import Post\n\n@admin.register(Post)\nclass PostAdmin(admin.ModelAdmin):\n    list_display = ("title", "published_at", "is_published")\n    list_filter = ("is_published",)\n    search_fields = ("title", "body")\n\n# Create a superuser\n# python manage.py createsuperuser\n# Visit http://localhost:8000/admin/\n\n# blog/views.py — require auth\nfrom rest_framework.permissions import IsAuthenticatedOrReadOnly\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer\n    permission_classes = [IsAuthenticatedOrReadOnly]',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m4-l2-q1',
                question: 'What does `python manage.py makemigrations` do?',
                options: [
                  'Applies migrations to the database',
                  'Generates SQL migration files by diffing models against the last migration',
                  'Creates a new Django app',
                  'Runs the test suite',
                ],
                correctAnswer: 1,
                explanation: 'makemigrations inspects your models and generates migration files. migrate then applies those files to the database.',
              },
              {
                id: 'py-m4-l2-q2',
                question: 'What does a DRF ModelViewSet give you out of the box?',
                options: [
                  'Only GET (list)',
                  'Only POST (create)',
                  'Full CRUD — list, retrieve, create, update, partial_update, destroy',
                  'Nothing — you write every action yourself',
                ],
                correctAnswer: 2,
                explanation: 'ModelViewSet mixins all 5 CRUD actions. You only need to set queryset and serializer_class.',
              },
              {
                id: 'py-m4-l2-q3',
                question: 'Which permission allows anyone to read but only authenticated users to write?',
                options: ['IsAuthenticated', 'AllowAny', 'IsAuthenticatedOrReadOnly', 'IsAdminUser'],
                correctAnswer: 2,
                explanation: 'IsAuthenticatedOrReadOnly permits GET/HEAD/OPTIONS for everyone; write methods (POST/PUT/PATCH/DELETE) require auth.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 5 — Data Science with NumPy & Pandas
      // ------------------------------------------------------------
      {
        id: 'py-m5',
        title: 'Chapter 5 — Data Science with NumPy & Pandas',
        description: 'Arrays, vectorization, DataFrames, groupby, joins, time series, plotting.',
        lessons: [
          {
            id: 'py-m5-l1',
            title: 'NumPy Arrays & Vectorization',
            description: 'ndarray creation, indexing, broadcasting, vectorized ops vs Python loops.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Install NumPy and create arrays',
                content: 'NumPy is the foundation of Python data science. Its ndarray is a fast, typed, multi-dimensional array.',
                code: 'pip install numpy\n\nimport numpy as np\n\n# From a list\na = np.array([1, 2, 3, 4, 5])\nprint(a.dtype, a.shape)  # int64 (5,)\n\n# From ranges\nprint(np.arange(0, 10, 2))  # [0 2 4 6 8]\nprint(np.linspace(0, 1, 5))  # [0.   0.25 0.5  0.75 1.  ]\n\n# 2D arrays (matrices)\nM = np.array([[1, 2, 3], [4, 5, 6]])\nprint(M.shape)  # (2, 3)\nprint(M.T)      # transpose — shape (3, 2)',
                codeLanguage: 'python',
              },
              {
                title: 'Vectorized operations',
                content: 'NumPy operations work element-wise on entire arrays without Python loops — 10-100x faster than equivalent list code.',
                code: 'import numpy as np\n\na = np.array([1, 2, 3, 4])\nb = np.array([10, 20, 30, 40])\n\nprint(a + b)     # [11 22 33 44]\nprint(a * b)     # [10 40 90 160]\nprint(a ** 2)    # [1 4 9 16]\nprint(np.sqrt(b))\n\n# Universal functions (ufuncs)\nprint(np.sin(np.pi * np.array([0, 0.5, 1.0])))\n\n# Reductions\nprint(a.sum(), a.mean(), a.std(), a.max())',
                codeLanguage: 'python',
                tip: 'Rule of thumb: if you wrote a for-loop over a NumPy array, you are doing it wrong. Look for the vectorized ufunc.',
              },
              {
                title: 'Broadcasting',
                content: 'Broadcasting lets NumPy operate on arrays of different shapes by virtually expanding the smaller one. Understand the rules to write clean vectorized code.',
                code: 'import numpy as np\n\n# Add scalar to array\nprint(np.array([1, 2, 3]) + 10)  # [11 12 13]\n\n# Add 1D to 2D — broadcasts along rows\nM = np.array([[1, 2, 3], [4, 5, 6]])\nv = np.array([10, 20, 30])\nprint(M + v)\n# [[11 22 33]\n#  [14 25 36]]\n\n# Normalize columns of a matrix\ndata = np.random.rand(100, 5)  # 100 rows, 5 features\nmeans = data.mean(axis=0)      # shape (5,)\nstds  = data.std(axis=0)       # shape (5,)\nnormalized = (data - means) / stds\nprint(normalized.mean(axis=0), normalized.std(axis=0))',
                codeLanguage: 'python',
              },
              {
                title: 'Fancy indexing & boolean masks',
                content: 'Use boolean arrays to filter, integer arrays to pick specific indices. Both create copies (not views).',
                code: 'import numpy as np\n\na = np.array([5, 1, 8, 3, 9, 2, 7])\n\n# Boolean mask\nmask = a > 4\nprint(a[mask])  # [5 8 9 7]\n\n# Combined condition\nprint(a[(a > 2) & (a < 8)])  # [5 3 7]\n\n# Fancy indexing\nprint(a[[0, 2, 5]])  # [5 8 2]\n\n# Where — return indices where condition is True\nidx = np.where(a > 4)\nprint(idx)  # (array([0, 2, 4, 6]),)',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m5-l1-q1',
                question: 'Why is a NumPy vectorized operation faster than a Python for-loop?',
                options: [
                  'NumPy uses GPUs',
                  'NumPy operations run in optimized C without per-element Python overhead',
                  'Python loops are deprecated',
                  'NumPy uses multi-threading by default',
                ],
                correctAnswer: 1,
                explanation: 'NumPy ufuncs iterate in compiled C. Python for-loops pay interpreter overhead on every iteration — 10-100x slower.',
              },
              {
                id: 'py-m5-l1-q2',
                question: 'What is broadcasting?',
                options: [
                  'Sending arrays over a network',
                  'Virtually expanding arrays of different shapes so element-wise ops work',
                  'A type of loop optimization',
                  'A way to serialize arrays',
                ],
                correctAnswer: 1,
                explanation: 'Broadcasting aligns array shapes (from the trailing dimensions) and virtually expands smaller arrays so element-wise operations work without copies.',
              },
              {
                id: 'py-m5-l1-q3',
                question: 'What does `a[a > 4]` do?',
                options: [
                  'Returns indices where a > 4',
                  'Returns a new array containing only elements where a > 4',
                  'Modifies a in place',
                  'Raises an error',
                ],
                correctAnswer: 1,
                explanation: 'Boolean mask indexing returns a new array of the elements where the mask is True.',
              },
            ],
          },
          {
            id: 'py-m5-l2',
            title: 'Pandas — DataFrames, groupby, joins',
            description: 'Loading CSV/Excel, selecting, filtering, groupby aggregations, merges, pivot tables.',
            duration: '65 min',
            videoUrl: SAMPLE_VIDEO_6,
            steps: [
              {
                title: 'Install Pandas and load data',
                content: 'Pandas is the most-used data analysis library in Python. The DataFrame is a labeled 2D table.',
                code: 'pip install pandas\n\nimport pandas as pd\n\n# Load CSV\ndf = pd.read_csv("sales.csv")\n\n# Load Excel (needs openpyxl)\n# pip install openpyxl\ndf = pd.read_excel("sales.xlsx", sheet_name="2024")\n\n# Quick peek\nprint(df.head())         # first 5 rows\nprint(df.info())         # dtypes + non-null counts\nprint(df.describe())     # summary stats for numeric cols\nprint(df.shape)          # (rows, cols)',
                codeLanguage: 'python',
              },
              {
                title: 'Selecting, filtering, assigning',
                content: 'Use [] for column selection, .loc for label-based, .iloc for position-based. Boolean masks filter rows.',
                code: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Select one column (Series)\namounts = df["amount"]\n\n# Select multiple columns (DataFrame)\nsubset = df[["date", "amount", "region"]]\n\n# Filter rows\nbig = df[df["amount"] > 1000]\neast = df[(df["region"] == "East") & (df["amount"] > 500)]\n\n# .loc — label + boolean\nbig_east = df.loc[df["region"] == "East", ["date", "amount"]]\n\n# .iloc — positional\ntop5 = df.iloc[:5]       # first 5 rows\nlast3 = df.iloc[-3:]     # last 3 rows\n\n# New column\ndf["amount_usd"] = df["amount"] * 0.012\ndf["is_big"] = df["amount"] > 1000',
                codeLanguage: 'python',
              },
              {
                title: 'groupby aggregations',
                content: 'groupby splits data by a key, applies an aggregation, and combines the result. The most-used Pandas pattern.',
                code: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Total revenue per region\nprint(df.groupby("region")["amount"].sum())\n\n# Multiple aggregations\nprint(df.groupby("region")["amount"].agg(["count", "mean", "sum"]))\n\n# Group by multiple columns\nprint(df.groupby(["region", "product"])["amount"].sum())\n\n# Named aggregations (cleaner column names)\nprint(df.groupby("region").agg(\n    total=("amount", "sum"),\n    avg=("amount", "mean"),\n    n=("amount", "count"),\n))',
                codeLanguage: 'python',
                tip: 'groupby + agg is the workhorse of data analysis. Learn it cold — every dashboard, report, and ML pipeline uses it.',
              },
              {
                title: 'Joins, merges, and pivot tables',
                content: 'pd.merge() joins DataFrames on key columns. pivot_table reshapes long → wide for reporting.',
                code: 'import pandas as pd\n\nsales = pd.read_csv("sales.csv")\nregions = pd.read_csv("regions.csv")  # region_id, region_name, country\n\n# Inner join (default)\nmerged = pd.merge(sales, regions, on="region_id", how="left")\n\n# Pivot table — region × product, sum of amount\npivot = pd.pivot_table(\n    merged,\n    values="amount",\n    index="region_name",\n    columns="product",\n    aggfunc="sum",\n    fill_value=0,\n    margins=True,  # adds All row/col\n)\nprint(pivot)',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m5-l2-q1',
                question: 'What does df.groupby("region")["amount"].sum() produce?',
                options: [
                  'A DataFrame with one row per region and a single "amount" column',
                  'A Series indexed by region with the sum of amount per region',
                  'The first row of each region',
                  'An error',
                ],
                correctAnswer: 1,
                explanation: 'groupby("region") splits, ["amount"] selects the column, .sum() reduces — result is a Series indexed by region.',
              },
              {
                id: 'py-m5-l2-q2',
                question: 'Which is the difference between .loc and .iloc?',
                options: [
                  'No difference',
                  '.loc uses labels, .iloc uses integer positions',
                  '.loc is faster',
                  '.iloc is read-only',
                ],
                correctAnswer: 1,
                explanation: '.loc indexes by label (row index value + column name). .iloc indexes by integer position (0-based).',
              },
              {
                id: 'py-m5-l2-q3',
                question: 'In pd.merge(a, b, how="left"), what happens to rows in a with no match in b?',
                options: [
                  'They are dropped',
                  'They are kept, with NaN for b\'s columns',
                  'They cause an error',
                  'They are duplicated',
                ],
                correctAnswer: 1,
                explanation: 'A left join keeps all rows of the left DataFrame. Unmatched rows get NaN for the right DataFrame\'s columns.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 6 — Testing, Async, Packaging, Production
      // ------------------------------------------------------------
      {
        id: 'py-m6',
        title: 'Chapter 6 — Testing, Async, Packaging & Production',
        description: 'pytest, asyncio, pyproject.toml, mypy, ruff, uv, deployment.',
        lessons: [
          {
            id: 'py-m6-l1',
            title: 'Testing with pytest',
            description: 'Test functions, fixtures, parametrize, coverage, mocking.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Install pytest and write your first test',
                content: 'pytest is the de-facto Python test framework. Test functions start with test_. Run pytest with no args to discover tests/.',
                code: 'pip install pytest\n\n# test_calculator.py\ndef add(a: int, b: int) -> int:\n    return a + b\n\ndef test_add_basic():\n    assert add(2, 3) == 5\n\ndef test_add_negatives():\n    assert add(-1, -1) == -2\n\ndef test_add_zero():\n    assert add(0, 0) == 0\n\n# Run: pytest -v',
                codeLanguage: 'python',
              },
              {
                title: 'Fixtures — setup/teardown reuse',
                content: 'Fixtures provide setup data or resources to tests via dependency injection. Use conftest.py to share fixtures across files.',
                code: 'import pytest\n\n# conftest.py\n@pytest.fixture\ndef sample_users():\n    return [\n        {"id": 1, "name": "Anika", "active": True},\n        {"id": 2, "name": "Vikram", "active": False},\n        {"id": 3, "name": "Riya", "active": True},\n    ]\n\n# test_users.py\ndef test_active_users_count(sample_users):\n    active = [u for u in sample_users if u["active"]]\n    assert len(active) == 2\n\ndef test_user_ids_unique(sample_users):\n    ids = [u["id"] for u in sample_users]\n    assert len(ids) == len(set(ids))',
                codeLanguage: 'python',
              },
              {
                title: 'Parametrized tests',
                content: 'Run the same test logic with multiple inputs. Eliminates copy-paste tests.',
                code: 'import pytest\n\ndef is_palindrome(s: str) -> bool:\n    s = s.lower().replace(" ", "")\n    return s == s[::-1]\n\n@pytest.mark.parametrize("word,expected", [\n    ("racecar", True),\n    ("Race car", True),\n    ("hello", False),\n    ("a", True),\n    ("", True),\n    ("ab", False),\n])\ndef test_palindrome(word, expected):\n    assert is_palindrome(word) is expected',
                codeLanguage: 'python',
                tip: 'pytest --cov=. --cov-report=html generates a coverage report. Aim for 80%+ on business logic.',
              },
              {
                title: 'Mocking external calls',
                content: 'Use unittest.mock.patch to replace external calls (HTTP, DB, file system) with fakes during tests.',
                code: 'from unittest.mock import patch, MagicMock\nimport requests\n\ndef get_user_email(user_id: int) -> str:\n    r = requests.get(f"https://api.example.com/users/{user_id}")\n    r.raise_for_status()\n    return r.json()["email"]\n\ndef test_get_user_email():\n    fake_response = MagicMock()\n    fake_response.json.return_value = {"email": "anika@marq.ai"}\n    fake_response.raise_for_status.return_value = None\n\n    with patch("requests.get", return_value=fake_response):\n        email = get_user_email(1)\n    assert email == "anika@marq.ai"',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m6-l1-q1',
                question: 'What naming convention does pytest use to discover tests?',
                options: [
                  'Files start with Test, classes start with test',
                  'Files start with test_, functions start with test_',
                  'Tests must be in a tests/ folder',
                  'Tests must be registered in pytest.ini',
                ],
                correctAnswer: 1,
                explanation: 'pytest collects files matching test_*.py or *_test.py and runs functions matching test*.',
              },
              {
                id: 'py-m6-l1-q2',
                question: 'What are pytest fixtures for?',
                options: [
                  'They are required for every test',
                  'Reusable setup/teardown data via dependency injection',
                  'Mocking HTTP calls',
                  'Generating test reports',
                ],
                correctAnswer: 1,
                explanation: 'Fixtures provide ready-to-use setup (DB connections, sample data, temp files) that tests request by name as parameters.',
              },
              {
                id: 'py-m6-l1-q3',
                question: 'Why mock external calls in tests?',
                options: [
                  'To make tests faster and not depend on network/DB',
                  'To test fewer lines of code',
                  'Mocking is required by pytest',
                  'To make tests slower',
                ],
                correctAnswer: 0,
                explanation: 'Mocking isolates the code under test. Tests run fast, do not depend on external services, and can simulate errors.',
              },
            ],
          },
          {
            id: 'py-m6-l2',
            title: 'Async Programming with asyncio',
            description: 'async/await, event loop, asyncio.gather, aiohttp, async context managers.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'async/await fundamentals',
                content: 'async def declares a coroutine. await suspends until the awaited coroutine completes. The event loop multiplexes many coroutines.',
                code: 'import asyncio\nimport time\n\nasync def greet(name: str, delay: float) -> str:\n    await asyncio.sleep(delay)\n    return f"Hello, {name}!"\n\nasync def main():\n    # Sequential — total time = 1 + 2 = 3s\n    a = await greet("Anika", 1.0)\n    b = await greet("Vikram", 2.0)\n    print(a, b)\n\nasyncio.run(main())',
                codeLanguage: 'python',
              },
              {
                title: 'Concurrent execution with asyncio.gather',
                content: 'gather() runs multiple coroutines concurrently — total time is the max, not the sum. This is the main performance win of async.',
                code: 'import asyncio\nimport time\n\nasync def fetch(url: str, delay: float) -> str:\n    await asyncio.sleep(delay)\n    return f"DATA from {url}"\n\nasync def main():\n    start = time.perf_counter()\n    # Concurrent — total time = max(1, 2, 0.5) = 2s, not 3.5s\n    results = await asyncio.gather(\n        fetch("api/users", 1.0),\n        fetch("api/orders", 2.0),\n        fetch("api/products", 0.5),\n    )\n    print(results)\n    print(f"Elapsed: {time.perf_counter() - start:.2f}s")\n\nasyncio.run(main())',
                codeLanguage: 'python',
                tip: 'async shines for I/O-bound work (HTTP, DB, files). For CPU-bound work, use multiprocessing — async will not help.',
              },
              {
                title: 'Async HTTP with aiohttp',
                content: 'aiohttp is the standard async HTTP client/server. Use it to fan out hundreds of requests concurrently.',
                code: 'import asyncio\nimport aiohttp\n\nasync def fetch_json(session: aiohttp.ClientSession, url: str):\n    async with session.get(url) as r:\n        r.raise_for_status()\n        return await r.json()\n\nasync def fetch_all(urls: list[str]):\n    async with aiohttp.ClientSession() as session:\n        return await asyncio.gather(*[fetch_json(session, u) for u in urls])\n\nurls = [\n    "https://api.github.com/users/python",\n    "https://api.github.com/users/microsoft",\n    "https://api.github.com/users/openai",\n]\nresults = asyncio.run(fetch_all(urls))\nfor r in results:\n    print(r["login"], r["public_repos"])',
                codeLanguage: 'python',
              },
              {
                title: 'Async context managers & queues',
                content: 'async with supports async __aenter__/__aexit__. asyncio.Queue is a producer-consumer queue for streaming pipelines.',
                code: 'import asyncio\n\nclass DbConnection:\n    async def __aenter__(self):\n        print("connecting...")\n        await asyncio.sleep(0.1)\n        return self\n\n    async def __aexit__(self, *exc):\n        print("closing...")\n        await asyncio.sleep(0.1)\n\n    async def query(self, q: str):\n        return f"result of {q}"\n\nasync def main():\n    async with DbConnection() as db:\n        print(await db.query("SELECT 1"))\n\nasyncio.run(main())',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m6-l2-q1',
                question: 'What does `await` do?',
                options: [
                  'Blocks the entire program until the coroutine finishes',
                  'Suspends the coroutine, returning control to the event loop, until the awaited future completes',
                  'Runs the coroutine in a new thread',
                  'Cancels the coroutine',
                ],
                correctAnswer: 1,
                explanation: 'await yields control to the event loop, which can run other coroutines while waiting. This is how async achieves concurrency on a single thread.',
              },
              {
                id: 'py-m6-l2-q2',
                question: 'If 3 coroutines take 1s, 2s, and 0.5s, what is the total time with asyncio.gather?',
                options: ['3.5s (sum)', '2s (max)', '1s (min)', '6s (sum * 2)'],
                correctAnswer: 1,
                explanation: 'gather runs them concurrently — total time is the longest individual coroutine.',
              },
              {
                id: 'py-m6-l2-q3',
                question: 'When does async NOT help performance?',
                options: [
                  'For HTTP requests',
                  'For database queries',
                  'For CPU-bound number-crunching work',
                  'For file I/O',
                ],
                correctAnswer: 2,
                explanation: 'Async helps I/O-bound work. For CPU-bound work (image processing, numerical loops), use multiprocessing to spread across cores.',
              },
            ],
          },
          {
            id: 'py-m6-l3',
            title: 'Packaging, Type-checking, Linting & Deployment',
            description: 'pyproject.toml, mypy, ruff, uv, Docker, deploy to a PaaS.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'pyproject.toml — the modern project file',
                content: 'pyproject.toml replaces setup.py, requirements.txt, setup.cfg. It declares build system, project metadata, dependencies, and tool config in one file.',
                code: '# pyproject.toml\n[build-system]\nrequires = ["hatchling"]\nbuild-backend = "hatchling.build"\n\n[project]\nname = "marq-tasks"\nversion = "1.0.0"\ndescription = "Task automation CLI"\nrequires-python = ">=3.12"\ndependencies = [\n    "click>=8.1",\n    "rich>=13.0",\n    "requests>=2.31",\n]\n\n[project.optional-dependencies]\ndev = ["pytest>=8", "mypy>=1.10", "ruff>=0.5"]\n\n[project.scripts]\nmarq-tasks = "marq_tasks.cli:main"\n\n[tool.ruff]\nline-length = 100\ntarget-version = "py312"\n\n[tool.mypy]\nstrict = true',
                codeLanguage: 'toml',
              },
              {
                title: 'ruff + mypy — lint and type-check',
                content: 'ruff is a fast linter/formatter (replaces flake8, isort, black). mypy catches type errors. Both integrate with VS Code and pre-commit.',
                code: '# Install\npip install ruff mypy\n\n# Lint\nruff check .\n\n# Auto-fix\nruff check . --fix\n\n# Format\nruff format .\n\n# Type-check\nmypy src/\n\n# Strict mode (recommended for new projects)\nmypy --strict src/',
                codeLanguage: 'bash',
                tip: 'Set up pre-commit hooks so ruff + mypy run automatically before each commit. Catches issues at the source.',
              },
              {
                title: 'uv — 100x faster pip',
                content: 'uv (from Astral) is a drop-in replacement for pip + venv + pip-tools, written in Rust. Use it for instant installs.',
                code: '# Install uv\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\n# Create venv + install in one command\nuv venv\nuv pip install -r requirements.txt\n\n# Or use uv as a project manager (recommended)\nuv init myproject\ncd myproject\nuv add requests rich\nuv add --dev pytest mypy ruff\nuv run pytest\nuv run python main.py',
                codeLanguage: 'bash',
              },
              {
                title: 'Dockerize and deploy',
                content: 'Containerize your app with a multi-stage Dockerfile for small images. Deploy to Fly.io, Railway, Render, or any container PaaS.',
                code: '# Dockerfile\nFROM python:3.12-slim AS builder\nWORKDIR /app\nRUN pip install --no-cache-dir uv\nCOPY pyproject.toml uv.lock ./\nRUN uv sync --frozen --no-dev\n\nFROM python:3.12-slim AS runtime\nWORKDIR /app\nCOPY --from=builder /app/.venv /app/.venv\nCOPY . .\nENV PATH="/app/.venv/bin:$PATH"\nCMD ["uvicorn", "app:api", "--host", "0.0.0.0", "--port", "8000"]\n\n# Build and run\ndocker build -t marq-tasks .\ndocker run -p 8000:8000 marq-tasks\n\n# Deploy to Fly.io\n# pip install flyctl\n# fly launch\n# fly deploy',
                codeLanguage: 'dockerfile',
                tip: 'Multi-stage Docker builds keep production images tiny (often <100MB) by not shipping dev dependencies or build tools.',
              },
            ],
            quiz: [
              {
                id: 'py-m6-l3-q1',
                question: 'What is pyproject.toml?',
                options: [
                  'A replacement for the .env file',
                  'The modern standard project config file (replaces setup.py, requirements.txt, setup.cfg)',
                  'A Docker config file',
                  'A type-checking config only',
                ],
                correctAnswer: 1,
                explanation: 'PEP 517/518 made pyproject.toml the standard place for build system, project metadata, dependencies, and tool config.',
              },
              {
                id: 'py-m6-l3-q2',
                question: 'What does ruff replace?',
                options: [
                  'pytest only',
                  'flake8 + isort + black (linting + formatting)',
                  'mypy only',
                  'Docker only',
                ],
                correctAnswer: 1,
                explanation: 'ruff is a single Rust-based tool that replaces flake8, isort, black, and many plugins. 10-100x faster than the Python originals.',
              },
              {
                id: 'py-m6-l3-q3',
                question: 'Why use a multi-stage Dockerfile?',
                options: [
                  'It is required by Docker',
                  'To keep production images small by not shipping dev tools and build artifacts',
                  'To run multiple apps in one container',
                  'To skip type checking',
                ],
                correctAnswer: 1,
                explanation: 'A builder stage installs deps and compiles. The runtime stage copies only what is needed. Result: tiny, secure images.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 149,
    monthlyPrice: 19,
    annualPrice: 189,
    onDemand: true,
    categoryIds: ['cat-python', 'cat-backend', 'cat-ai'],
    expiresAfterDays: 365,
  },
'''

CATEGORIES_PATCH = '''
Note: add cat-python to seed-social.ts SEED_CATEGORIES — done in same script run.
'''

# 1) Append Python course to courses.ts (right before closing ];)
src = COURSE_TS.read_text()
needle = "];\n\nexport function findCourse"
assert needle in src, "Could not find insertion anchor"
new_src = src.replace(needle, PYTHON_COURSE.lstrip() + "\n" + needle)
COURSE_TS.write_text(new_src)
print(f"[OK] Appended Python course to {COURSE_TS}")
print(f"     File grew from {len(src)} to {len(new_src)} bytes ({len(new_src) - len(src)} added)")

# 2) Add cat-python category to seed-social.ts
seed_path = Path("/home/z/my-project/src/lib/seed-social.ts")
seed = seed_path.read_text()
if "cat-python" not in seed:
    new_seed = seed.replace(
        "{ id: 'cat-ai', name: 'AI & Machine Learning'",
        "{ id: 'cat-python', name: 'Python & Scripting', description: 'Python, automation, data engineering', color: 'from-amber-500 to-orange-600', courseIds: ['python-pro'] },\n  { id: 'cat-ai', name: 'AI & Machine Learning'",
    )
    seed_path.write_text(new_seed)
    print(f"[OK] Added cat-python category to {seed_path}")
else:
    print(f"[SKIP] cat-python already in {seed_path}")
