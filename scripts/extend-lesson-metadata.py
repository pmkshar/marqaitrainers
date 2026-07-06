#!/usr/bin/env python3
"""
Extend the FIRST lesson of each of the 5 remaining courses with Coursera-style
lesson-level metadata (lessonType, whatYouLearn, skills, tools).

Injects between `videoUrl: SAMPLE_VIDEO_X,` and `steps: [` for the first lesson
of each course. The metadata is what shows up in the right sidebar of the
lesson workspace ("What you'll learn", "Skills", "Tools" cards).

Also enriches the FIRST step of each lesson with taskType, instructions,
estimatedMinutes, skills, tools so the Coursera workspace renders correctly.
"""

from pathlib import Path

COURSES_FILE = Path("/home/z/my-project/src/lib/courses.ts")

LESSON_META = {
    "ai-m1-l1": """            lessonType: 'Guided Project',
            whatYouLearn: [
              'Install Python 3.12, conda, and Jupyter Lab',
              'Create and activate isolated conda environments',
              'Install NumPy, Pandas, Matplotlib, Scikit-learn, PyTorch',
              'Verify GPU availability for PyTorch (CUDA / MPS / CPU)',
            ],
            skills: ['Python', 'Conda', 'Jupyter', 'PyTorch setup'],
            tools: ['Python 3.12', 'Conda', 'Jupyter Lab', 'VS Code'],
""",
    "j-m1-l1": """            lessonType: 'Guided Project',
            whatYouLearn: [
              'Use Spring Initializr to bootstrap a Spring Boot 3 project',
              'Understand starters, auto-configuration, and the main application class',
              'Run the app locally and hit your first REST endpoint',
              'Configure application.yml profiles for dev/prod',
            ],
            skills: ['Spring Boot', 'Maven', 'REST API', 'Java 21'],
            tools: ['Java 21', 'Spring Boot 3', 'IntelliJ IDEA', 'Maven'],
""",
    "d-m1-l1": """            lessonType: 'Guided Project',
            whatYouLearn: [
              'Use C# records for immutable value types',
              'Apply pattern matching (switch expressions, property patterns)',
              'Enable nullable reference types and reason about null safety',
              'Write idiomatic modern C# with top-level statements',
            ],
            skills: ['C# 12', '.NET 8', 'Pattern Matching', 'Null Safety'],
            tools: ['.NET 8 SDK', 'Visual Studio 2022', 'VS Code', 'dotnet CLI'],
""",
    "m-m1-l1": """            lessonType: 'Guided Project',
            whatYouLearn: [
              'Bootstrap a React Native + Expo project from scratch',
              'Run the app on iOS Simulator, Android Emulator, and a physical device',
              'Understand the Expo development build vs. managed workflow',
              'Configure app.json, splash screen, and icons',
            ],
            skills: ['React Native', 'Expo', 'Mobile App Setup', 'TypeScript'],
            tools: ['React Native 0.74', 'Expo SDK 51', 'TypeScript', 'VS Code'],
""",
    "f-m1-l1": """            lessonType: 'Guided Project',
            whatYouLearn: [
              'Understand Dart 3 sound null safety and the type system',
              'Use records and pattern matching for concise data handling',
              'Write async code with Future, async/await, and streams',
              'Apply Dart isolates for CPU-intensive work',
            ],
            skills: ['Dart 3', 'Null Safety', 'Async Programming', 'Pattern Matching'],
            tools: ['Dart 3.4', 'Flutter 3.22', 'VS Code', 'Dart DevTools'],
""",
}


def find_lesson_video_line(text: str, lesson_id: str) -> int:
    """Find the line index of `videoUrl: SAMPLE_VIDEO_X,` for the given lesson."""
    lines = text.split("\n")
    id_marker = f"id: '{lesson_id}'"
    id_idx = None
    for i, line in enumerate(lines):
        if id_marker in line:
            id_idx = i
            break
    if id_idx is None:
        raise ValueError(f"Lesson {lesson_id} not found")
    # Find next `videoUrl:` after id_idx
    for i in range(id_idx, len(lines)):
        if "videoUrl:" in lines[i]:
            return i
    raise ValueError(f"videoUrl not found in lesson {lesson_id}")


def inject_lesson_meta(text: str, lesson_id: str, block: str) -> str:
    """Insert the lesson meta block between `videoUrl: ...,` and `steps: [`."""
    lines = text.split("\n")
    video_idx = find_lesson_video_line(text, lesson_id)
    # Insert AFTER the videoUrl line (which is video_idx). So insert at video_idx + 1.
    block_lines = block.rstrip("\n").split("\n")
    new_lines = lines[: video_idx + 1] + block_lines + lines[video_idx + 1 :]
    return "\n".join(new_lines)


def main():
    text = COURSES_FILE.read_text()
    for lesson_id, block in LESSON_META.items():
        if "lessonType:" in text.split(f"id: '{lesson_id}'")[1].split("id: '")[0]:
            print(f"  ! {lesson_id}: already has lesson metadata, skipping")
            continue
        print(f"  + {lesson_id}: injecting lesson metadata")
        text = inject_lesson_meta(text, lesson_id, block)
    COURSES_FILE.write_text(text)
    print(f"\nWrote {COURSES_FILE}")


if __name__ == "__main__":
    main()
