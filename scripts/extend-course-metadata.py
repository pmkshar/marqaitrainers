#!/usr/bin/env python3
"""
Extend courses.ts with Coursera-style metadata for the 5 remaining courses:
ai-ml, java-fullstack, dotnet-fullstack, mobile-dev, flutter-dev.

The metadata block is injected between `prerequisites: [...],` and `modules: [` for each course.
"""

import re
from pathlib import Path

COURSES_FILE = Path("/home/z/my-project/src/lib/courses.ts")

# Metadata blocks per course. Each block is inserted on the line BEFORE `modules: [`.
# The indent must match the surrounding code (4 spaces — top-level course field).
METADATA_BLOCKS = {
    "ai-ml": """    // ---- Coursera guided-project extensions (June 2026) ----
    skills: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Python', 'PyTorch', 'Statistical Analysis', 'Computer Vision'],
    tools: ['Python 3.12', 'PyTorch', 'NumPy', 'Pandas', 'Jupyter', 'Hugging Face Transformers', 'Weights & Biases'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Hindi', 'French'],
    lastUpdated: '2026-06-18',
    reviewsCount: 1893,
    ratingDistribution: [1287, 416, 102, 38, 50], // 5★,4★,3★,2★,1★
    instructorBio:
      'Dr. Anika Sharma is an AI researcher and educator with 10+ years building production ML systems at Google DeepMind, Anthropic, and two AI startups. She holds a PhD in Machine Learning from Stanford where her thesis on transformer interpretability won the ACM Doctoral Dissertation Award. Anika has mentored 500+ engineers into ML roles and is a frequent speaker at NeurIPS, ICML, and PyTorch Dev Day.',
    instructorCourseCount: 12,
    instructorLearnerCount: '94,327',
    instructorRating: 4.9,
    projectType: 'Guided Project',
    desktopOnly: false,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      {
        id: 'ai-r1',
        authorName: 'Rajesh K.',
        authorInitials: 'RK',
        rating: 5,
        date: '2026-06-02',
        body: "Anika's course is the gold standard for ML engineering. The transformer module alone got me through 3 senior ML interviews. The RAG pipeline lab is genuinely production-grade — I shipped a similar architecture at my company the week after finishing.",
        upvotes: 62,
      },
      {
        id: 'ai-r2',
        authorName: 'Lin W.',
        authorInitials: 'LW',
        rating: 5,
        date: '2026-05-19',
        body: "I tried fast.ai, Coursera ML, and a bootcamp before this. Dr. Sharma's first-principles approach finally made backprop click. The PyTorch sections are clear, modern, and idiomatic. Highly recommend doing every lab twice.",
        upvotes: 41,
      },
      {
        id: 'ai-r3',
        authorName: 'Aisha M.',
        authorInitials: 'AM',
        rating: 4,
        date: '2026-05-04',
        body: "Excellent depth. The LLM fine-tuning lab uses real Hugging Face Transformers and LoRA — exactly what I use at work. Only complaint: I wish there was more on reinforcement learning, but the supervised + transformer focus is comprehensive.",
        upvotes: 22,
      },
      {
        id: 'ai-r4',
        authorName: 'Diego F.',
        authorInitials: 'DF',
        rating: 5,
        date: '2026-04-22',
        body: "I'm a backend engineer who pivoted to ML via this course. The math foundations module was the perfect refresher, and the deployment chapter (Docker + FastAPI + W&B) is something I now use weekly. Worth every rupee.",
        upvotes: 17,
      },
    ],
""",
    "java-fullstack": """    // ---- Coursera guided-project extensions (June 2026) ----
    skills: ['Java', 'Spring Boot', 'REST API Design', 'SQL', 'React', 'Microservices', 'DevOps'],
    tools: ['Java 21', 'Spring Boot 3', 'IntelliJ IDEA', 'MySQL', 'React 18', 'Docker', 'Git'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Hindi', 'German'],
    lastUpdated: '2026-06-10',
    reviewsCount: 1647,
    ratingDistribution: [1083, 412, 89, 28, 35], // 5★,4★,3★,2★,1★
    instructorBio:
      'Arjun Reddy is a Principal Engineer with 15+ years building large-scale Java systems at Amazon, Atlassian, and two fintech startups. He is an Oracle Certified Java Champion and a Spring Framework contributor. Arjun has mentored 300+ engineers from junior to senior and is known for his "no shortcuts, no magic" teaching style — every pattern is explained from first principles.',
    instructorCourseCount: 18,
    instructorLearnerCount: '127,840',
    instructorRating: 4.8,
    projectType: 'Guided Project',
    desktopOnly: false,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      {
        id: 'j-r1',
        authorName: 'Vikram S.',
        authorInitials: 'VS',
        rating: 5,
        date: '2026-05-28',
        body: "Arjun's course took me from 'I know Java syntax' to 'I can architect a microservices system.' The Spring Boot 3 + React monorepo lab is the most production-ready project I've ever built in a course. Got a senior backend role 6 weeks after finishing.",
        upvotes: 54,
      },
      {
        id: 'j-r2',
        authorName: 'Hannah B.',
        authorInitials: 'HB',
        rating: 5,
        date: '2026-05-12',
        body: "Best Java full-stack course on the internet. The Docker + CI/CD chapter alone justifies the price. Arjun's code reviews of student work are gold — he catches things my tech lead misses.",
        upvotes: 38,
      },
      {
        id: 'j-r3',
        authorName: 'Tomás R.',
        authorInitials: 'TR',
        rating: 4,
        date: '2026-04-30',
        body: "Very thorough coverage of Spring Boot, JPA, and React. The microservices module is excellent. Would have liked more on Kafka/RabbitMQ, but the rabbit hole of REST + JPA + Docker is plenty for a 12-week course.",
        upvotes: 19,
      },
      {
        id: 'j-r4',
        authorName: 'Priyanka G.',
        authorInitials: 'PG',
        rating: 5,
        date: '2026-04-17',
        body: "I'm a CS grad who hadn't touched Java since college. Arjun's 'no magic' explanations of Spring dependency injection, JPA proxies, and React hooks are exactly what experienced devs need. The deploy-to-AWS lab at the end is fantastic.",
        upvotes: 14,
      },
    ],
""",
    "dotnet-fullstack": """    // ---- Coursera guided-project extensions (June 2026) ----
    skills: ['C#', '.NET 8', 'ASP.NET Core', 'Entity Framework Core', 'Blazor', 'REST API Design', 'Azure DevOps'],
    tools: ['.NET 8 SDK', 'Visual Studio 2022', 'SQL Server', 'Blazor', 'Azure', 'Docker', 'Git'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'French', 'German'],
    lastUpdated: '2026-06-08',
    reviewsCount: 982,
    ratingDistribution: [634, 247, 58, 21, 22], // 5★,4★,3★,2★,1★
    instructorBio:
      'Daniel Park is a Senior .NET Architect and Microsoft MVP with 14+ years building enterprise systems at Microsoft, Accenture, and a Series-C SaaS startup. He has shipped production .NET apps to over 4 million users and is a frequent speaker at .NET Conf and NDC. Daniel teaches with a focus on real-world patterns — every lab is based on a system he has actually shipped.',
    instructorCourseCount: 9,
    instructorLearnerCount: '58,912',
    instructorRating: 4.8,
    projectType: 'Guided Project',
    desktopOnly: false,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      {
        id: 'dn-r1',
        authorName: 'Marcus L.',
        authorInitials: 'ML',
        rating: 5,
        date: '2026-05-25',
        body: "I've been a .NET dev for 6 years and still learned a ton — Daniel's coverage of EF Core 8, minimal APIs, and Blazor Server vs. WebAssembly is the best I've seen. The Azure DevOps lab alone made me reconsider how my team deploys.",
        upvotes: 31,
      },
      {
        id: 'dn-r2',
        authorName: 'Elena V.',
        authorInitials: 'EV',
        rating: 5,
        date: '2026-05-11',
        body: "Pivoted from PHP to .NET with this course. Daniel's explanations of LINQ, async/await, and DI are crystal clear. The Blazor module is a fantastic intro — I shipped my first internal tool with it 3 weeks in.",
        upvotes: 24,
      },
      {
        id: 'dn-r3',
        authorName: 'Aiden C.',
        authorInitials: 'AC',
        rating: 4,
        date: '2026-04-29',
        body: "Great course. The EF Core migrations and multi-tenant SaaS lab are directly applicable to my job. Would have liked more on gRPC and SignalR, but the REST + Blazor coverage is comprehensive.",
        upvotes: 13,
      },
      {
        id: 'dn-r4',
        authorName: 'Sofia H.',
        authorInitials: 'SH',
        rating: 5,
        date: '2026-04-14',
        body: "Daniel is the rare instructor who actually ships production .NET apps. The architecture patterns he teaches (CQRS, repository, specification) are exactly what senior .NET roles expect. Worth every cent.",
        upvotes: 11,
      },
    ],
""",
    "mobile-dev": """    // ---- Coursera guided-project extensions (June 2026) ----
    skills: ['React Native', 'Mobile App Development', 'iOS Development', 'Android Development', 'Mobile UX', 'App Store Deployment'],
    tools: ['React Native 0.74', 'Expo SDK 51', 'TypeScript', 'Xcode', 'Android Studio', 'Firebase', 'Fastlane'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Portuguese', 'Hindi'],
    lastUpdated: '2026-06-12',
    reviewsCount: 743,
    ratingDistribution: [498, 178, 41, 14, 12], // 5★,4★,3★,2★,1★
    instructorBio:
      'Max Oliveira is a Senior Mobile Engineer with 11+ years shipping consumer apps at Instagram, Nubank, and two YC startups. His apps have been downloaded 30M+ times across iOS and Android. Max is an Expo community maintainer and a frequent speaker at React Native EU and Chain React. He teaches with a ship-fast, iterate-quickly philosophy grounded in real App Store and Play Store launches.',
    instructorCourseCount: 7,
    instructorLearnerCount: '41,206',
    instructorRating: 4.8,
    projectType: 'Guided Project',
    desktopOnly: true,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      {
        id: 'mb-r1',
        authorName: 'Chen Y.',
        authorInitials: 'CY',
        rating: 5,
        date: '2026-05-22',
        body: "Max's Expo-first approach saved me months. The EAS Build + Fastlane lab got my app to TestFlight in a single afternoon. The push-notifications module (with Firebase + APNs) is the cleanest implementation I've seen.",
        upvotes: 28,
      },
      {
        id: 'mb-r2',
        authorName: 'Olivia T.',
        authorInitials: 'OT',
        rating: 5,
        date: '2026-05-08',
        body: "Shipped my first React Native app to the Play Store by week 6. Max's coverage of native modules, deep linking, and offline-first with WatermelonDB is exactly what production apps need. Highly recommend.",
        upvotes: 19,
      },
      {
        id: 'mb-r3',
        authorName: 'Ravi P.',
        authorInitials: 'RP',
        rating: 4,
        date: '2026-04-26',
        body: "Excellent, ship-focused course. The App Store + Play Store submission labs are gold. Only complaint: I wish there was more on animations, but Reanimated 3 is covered well enough to ship.",
        upvotes: 11,
      },
      {
        id: 'mb-r4',
        authorName: 'Jamal W.',
        authorInitials: 'JW',
        rating: 5,
        date: '2026-04-11',
        body: "I went from web dev to mobile dev with this course. Max's mental model for thinking in components, navigation state, and platform-specific UX is exactly what senior mobile engineers do. Got a senior mobile role 2 months after finishing.",
        upvotes: 9,
      },
    ],
""",
    "flutter-dev": """    // ---- Coursera guided-project extensions (June 2026) ----
    skills: ['Flutter', 'Dart', 'Mobile App Development', 'Cross-Platform Development', 'State Management', 'Mobile UX Design'],
    tools: ['Flutter 3.22', 'Dart 3.4', 'VS Code', 'Android Studio', 'Firebase', 'Riverpod', 'Codemagic'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Portuguese', 'French'],
    lastUpdated: '2026-06-14',
    reviewsCount: 612,
    ratingDistribution: [423, 142, 32, 8, 7], // 5★,4★,3★,2★,1★
    instructorBio:
      'Aria Nakamura is a Flutter GDE (Google Developer Expert) and senior mobile engineer with 9+ years shipping cross-platform apps at Google, Reflectly, and a fitness startup. She has shipped 12 production Flutter apps with 8M+ combined downloads. Aria is a Flutter contributor (plugins + docs) and a speaker at Flutter Engage and FlutterCon. She teaches with a focus on pixel-perfect UI and rigorous state management.',
    instructorCourseCount: 6,
    instructorLearnerCount: '34,718',
    instructorRating: 4.9,
    projectType: 'Guided Project',
    desktopOnly: true,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      {
        id: 'fl-r1',
        authorName: 'Kenji S.',
        authorInitials: 'KS',
        rating: 5,
        date: '2026-05-30',
        body: "Aria's Riverpod 2.0 module is the best explanation of state management I've seen in any mobile course. The pixel-perfect UI labs teach you to actually match Figma designs — not just 'close enough'. Shipped my app to both stores by week 8.",
        upvotes: 36,
      },
      {
        id: 'fl-r2',
        authorName: 'Sara M.',
        authorInitials: 'SM',
        rating: 5,
        date: '2026-05-15',
        body: "I tried 3 other Flutter courses before this. Aria's coverage of custom painters, animations, and Codemagic CI/CD is genuinely production-grade. The Firebase Auth + Riverpod integration is the cleanest pattern I've used.",
        upvotes: 22,
      },
      {
        id: 'fl-r3',
        authorName: 'Tom B.',
        authorInitials: 'TB',
        rating: 4,
        date: '2026-05-02',
        body: "Great course with excellent code quality. The animations and custom widget labs are top-tier. Would have liked more on testing (unit + integration), but the manual + widget testing coverage is solid.",
        upvotes: 12,
      },
      {
        id: 'fl-r4',
        authorName: 'Priya R.',
        authorInitials: 'PR',
        rating: 5,
        date: '2026-04-19',
        body: "Aria is the rare instructor who is both a great engineer AND a great teacher. Her mental model for thinking in widgets, providers, and async state is exactly what senior Flutter devs do. Got a Flutter role at a fintech 5 weeks after finishing.",
        upvotes: 8,
      },
    ],
""",
}


def find_injection_point(text: str, course_id: str) -> int:
    """Find the line index of `modules: [` for the given course.
    Returns the index in `text.splitlines()` of the line containing `modules: [`.
    """
    # Find `id: '<course_id>'` first
    lines = text.split("\n")
    id_marker = f"id: '{course_id}'"
    id_idx = None
    for i, line in enumerate(lines):
        if id_marker in line:
            id_idx = i
            break
    if id_idx is None:
        raise ValueError(f"Course {course_id} not found")

    # Find next `modules: [` after id_idx
    for i in range(id_idx, len(lines)):
        if "modules: [" in lines[i]:
            return i
    raise ValueError(f"modules: [ not found after id of {course_id}")


def inject(text: str, course_id: str, block: str) -> str:
    """Insert the metadata block just before the `modules: [` line for this course."""
    lines = text.split("\n")
    modules_idx = find_injection_point(text, course_id)
    # Insert block (which already has trailing newline) before modules_idx
    block_lines = block.rstrip("\n").split("\n")
    new_lines = lines[:modules_idx] + block_lines + lines[modules_idx:]
    return "\n".join(new_lines)


def main():
    text = COURSES_FILE.read_text()
    # Sanity check: ensure none of the courses already have the marker
    for cid in METADATA_BLOCKS:
        # Quick check — if 'reviewsCount:' appears between this course's id and the next course's id, skip
        if "reviewsCount:" in text.split(f"id: '{cid}'")[1].split("id: '")[0]:
            print(f"  ! {cid}: already has Coursera metadata, skipping")
            continue
        print(f"  + {cid}: injecting metadata block")
        text = inject(text, cid, METADATA_BLOCKS[cid])

    COURSES_FILE.write_text(text)
    print(f"\nWrote {COURSES_FILE}")


if __name__ == "__main__":
    main()
