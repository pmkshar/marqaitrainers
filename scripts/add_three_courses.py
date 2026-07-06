#!/usr/bin/env python3
"""
Add 3 missing courses per PRD §3.2: Soft Skills, Software Testing, Web Development.
Inserts before the closing `];` of the COURSES array in src/lib/courses.ts.
Each course follows the existing Coursera-style metadata pattern.
"""
import re
from pathlib import Path

COURSES_FILE = Path("/home/z/my-project/src/lib/courses.ts")

# Read existing file
src = COURSES_FILE.read_text()

# Find the closing `];` of COURSES array (first occurrence after `export const COURSES`)
match = re.search(r'(export const COURSES: Course\[\] = \[.*?)(^\];)', src, re.MULTILINE | re.DOTALL)
if not match:
    raise SystemExit("Could not find COURSES array")

# Check if courses already added
if "id: 'soft-skills'" in src:
    print("Soft Skills course already present — skipping insertion.")
    raise SystemExit(0)

NEW_COURSES = '''
  // ============================================================
  // 7. Soft Skills (PRD §3.2)
  // ============================================================
  {
    id: 'soft-skills',
    slug: 'soft-skills-professional',
    title: 'Soft Skills for Tech Professionals',
    subtitle: 'Communication, leadership, and emotional intelligence for engineers',
    description: 'Master the interpersonal skills that separate senior engineers from junior ones — communication, stakeholder management, leadership, and emotional intelligence.',
    longDescription:
      'Technical skills get you the interview; soft skills get you the promotion. This course is built specifically for software engineers, data scientists, and tech leads who want to level up the human side of their craft. You will learn how to write clear technical documents, run effective meetings, give and receive difficult feedback, manage up to senior leadership, mentor junior engineers, and navigate cross-functional conflicts. Each module includes realistic role-play scenarios drawn from real engineering organizations, video walkthroughs of senior engineers handling tricky conversations, and reflective exercises you can apply at work the same day. The course culminates in a capstone where you record yourself handling a stakeholder conflict and receive AI-tutor feedback on tone, clarity, and outcomes.',
    icon: 'HeartHandshake',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    level: 'All Levels',
    duration: '6 weeks',
    lessonsCount: 18,
    studentsCount: '8,920',
    rating: 4.8,
    instructor: 'Meera Iyer',
    instructorTitle: 'VP Engineering, ex-Stripe & Atlassian',
    tags: ['Communication', 'Leadership', 'Feedback', 'Stakeholder Mgmt', 'Mentoring', 'Conflict Resolution'],
    whatYouLearn: [
      'Write clear, concise technical documents and RFCs that get approved',
      'Run meetings that end with decisions, not more meetings',
      'Give feedback that lands well — and receive it without defensiveness',
      'Manage up: communicate effectively with directors and VPs',
      'Mentor junior engineers without becoming their bottleneck',
      'Navigate cross-functional conflicts between product, design, and engineering',
    ],
    prerequisites: [
      '1+ year of professional work experience (any field)',
      'Willingness to record yourself for the capstone project',
      'A current or upcoming stakeholder relationship to practice on',
    ],
    skills: ['Written Communication', 'Verbal Communication', 'Stakeholder Management', 'Conflict Resolution', 'Mentoring', 'Leadership', 'Emotional Intelligence', 'Meeting Facilitation'],
    tools: ['Google Docs', 'Loom', 'Notion', 'Reflection Journal', 'Role-Play Scenarios'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Hindi', 'French'],
    lastUpdated: '2026-06-22',
    reviewsCount: 1247,
    ratingDistribution: [892, 267, 51, 19, 18],
    instructorBio:
      'Meera Iyer is a VP of Engineering with 15 years building and leading teams at Stripe, Atlassian, and two mid-stage startups. She has managed engineering organizations of 80+ people across 4 time zones, mentored 30+ engineers into staff and principal roles, and is a frequent speaker at LeadDev and Women in Tech summits. Her writing on engineering leadership appears regularly in leaddev.com and she coaches senior engineers 1:1 on the transition from IC to manager.',
    instructorCourseCount: 4,
    instructorLearnerCount: '23,180',
    instructorRating: 4.9,
    projectType: 'Course',
    desktopOnly: false,
    requiresDownload: false,
    certificateAvailable: true,
    reviews: [
      { id: 'ss-r1', authorName: 'Arjun P.', authorInitials: 'AP', rating: 5, date: '2026-06-10', body: "I wish I had taken this course 5 years ago. The feedback framework alone changed how I run 1:1s. My team's engagement score went up 18 points the quarter after I applied what I learned.", upvotes: 47 },
      { id: 'ss-r2', authorName: 'Sofia R.', authorInitials: 'SR', rating: 5, date: '2026-05-28', body: "Meera's stakeholder management module is gold. I finally understand how to communicate with my VP without getting shut down in the first 30 seconds.", upvotes: 33 },
      { id: 'ss-r3', authorName: 'Kenji T.', authorInitials: 'KT', rating: 4, date: '2026-05-12', body: "The role-plays feel cheesy at first but they work. Recording myself giving tough feedback and getting AI-tutor analysis on my tone was uncomfortable and exactly what I needed.", upvotes: 21 },
      { id: 'ss-r4', authorName: 'Priya M.', authorInitials: 'PM', rating: 5, date: '2026-04-30', body: "As a new tech lead, the conflict-resolution scenarios were directly applicable to a tricky situation with a senior IC. The capstone feedback was surprisingly insightful.", upvotes: 14 },
    ],
    oneTimePrice: 149,
    monthlyPrice: 29,
    annualPrice: 290,
    onDemand: true,
    categoryIds: ['career'],
    modules: [
      {
        id: 'ss-m1',
        title: 'Foundations of Technical Communication',
        description: 'Why soft skills matter for engineers; written vs. verbal communication; audience analysis',
        lessons: [
          { id: 'ss-m1-l1', title: 'The senior engineer difference', description: 'What separates staff engineers from seniors — and how soft skills drive the gap', duration: '32 min', videoUrl: SAMPLE_VIDEO_1, steps: [
            { title: 'Why this course exists', content: 'A 2025 LinkedIn survey of 4,000 engineering managers found that 73% of promotions from senior to staff engineer are blocked by soft skills, not technical ability. This module sets the foundation for the rest of the course.', taskType: 'read', estimatedMinutes: 8 },
            { title: 'The 6 skill domains', content: 'We cover: written communication, verbal communication, stakeholder management, feedback, mentoring, and conflict resolution. Each gets a dedicated module with role-plays.', taskType: 'read', estimatedMinutes: 10 },
            { title: 'Set your baseline', content: 'Record a 2-minute Loom video introducing yourself to a new stakeholder. You will redo this in week 6 and compare.', taskType: 'challenge', estimatedMinutes: 15, instructions: ['Open Loom or your phone camera', 'Record a 2-minute self-intro to a hypothetical VP you are meeting next week', 'Save the link — you will need it for the capstone reflection'], skills: ['Self-Awareness', 'Verbal Communication'], tools: ['Loom'] },
          ], quiz: [
            { id: 'ss-q1', question: 'What percentage of senior-to-staff promotions are blocked by soft skills, per the 2025 LinkedIn survey cited in this course?', options: ['31%', '47%', '73%', '89%'], correctAnswer: 2, explanation: '73% — engineering managers consistently report that soft skills, not technical ability, are the binding constraint on staff promotions.' },
            { id: 'ss-q2', question: 'Which of these is NOT one of the 6 skill domains covered in this course?', options: ['Written communication', 'Stakeholder management', 'Project estimation', 'Conflict resolution'], correctAnswer: 2, explanation: 'Project estimation is a technical/project-management skill. The 6 domains here are: written, verbal, stakeholder, feedback, mentoring, conflict.' },
          ] },
          { id: 'ss-m1-l2', title: 'Audience analysis: know who you are writing for', description: 'A framework for adapting technical depth to your audience — IC, peer, manager, VP, customer', duration: '28 min', videoUrl: SAMPLE_VIDEO_2, steps: [
            { title: 'The 5 audience archetypes', content: 'IC engineers want details and tradeoffs. Peer engineers want edge cases. Engineering managers want risks and dates. VPs want outcomes and dependencies. Customers want outcomes and cost. Same content, 5 different framings.', taskType: 'read', estimatedMinutes: 10 },
            { title: 'Rewrite exercise', content: 'Take a 3-paragraph technical RFC summary and rewrite it for: (a) a staff engineer, (b) a VP of product, (c) a customer.', taskType: 'challenge', estimatedMinutes: 18, instructions: ['Pick any recent RFC or design doc you have written', 'Identify the 3 key technical decisions in it', 'Rewrite the summary for each of the 3 audiences — max 100 words each'], skills: ['Written Communication', 'Audience Analysis'], tools: ['Google Docs'] },
          ], quiz: [
            { id: 'ss-q3', question: 'A VP of Engineering typically wants to see which of the following FIRST in a technical proposal?', options: ['Implementation pseudocode', 'Outcomes, dependencies, and risk', 'Line-by-line code review', 'Full API schema'], correctAnswer: 1, explanation: 'VPs operate at the outcome/risk layer. Technical details come later, often delegated to staff engineers for review.' },
          ] },
          { id: 'ss-m1-l3', title: 'Writing clear technical documents', description: 'The RFC template used at Stripe and Atlassian — structure, length, and decision-making', duration: '42 min', videoUrl: SAMPLE_VIDEO_3, steps: [
            { title: 'The 6-section RFC template', content: 'Context, Problem, Proposed solution, Alternatives considered, Risks, Timeline. Each section has a target length and a "kill your darlings" rule.', taskType: 'read', estimatedMinutes: 15 },
            { title: 'The "one-screen rule"', content: 'Every section header should fit on one phone screen. If a reader cannot understand the section purpose from the header + first sentence, the section is mis-titled.', taskType: 'read', estimatedMinutes: 8 },
            { title: 'Rewrite a real RFC', content: 'Take a real RFC from your team or a public one (e.g. from the Stripe or GitLab RFC repos) and rewrite the summary using the 6-section template.', taskType: 'challenge', estimatedMinutes: 20, instructions: ['Find a real RFC (your own or public)', 'Map its current structure to the 6-section template', 'Rewrite the summary in 6 sections, max 200 words per section'], skills: ['Written Communication', 'Document Structure'], tools: ['Google Docs', 'Notion'] },
          ], quiz: [
            { id: 'ss-q4', question: 'The "one-screen rule" for RFCs means:', options: ['The entire RFC must fit on one screen', 'Every section header + first sentence must convey the section purpose', 'RFCs must be one page maximum', 'Only one RFC per project'], correctAnswer: 1, explanation: 'The one-screen rule is about scannability: a reader should understand each section\\'s purpose from the header and first sentence alone, without scrolling.' },
          ] },
        ],
      },
      {
        id: 'ss-m2',
        title: 'Feedback That Lands',
        description: 'The SBI model, radical candor, and how to give feedback that changes behavior without damaging relationships',
        lessons: [
          { id: 'ss-m2-l1', title: 'The SBI feedback model', description: 'Situation-Behavior-Impact: the most reliable framework for giving feedback that does not trigger defensiveness', duration: '35 min', videoUrl: SAMPLE_VIDEO_4, steps: [
            { title: 'Why most feedback fails', content: 'Most feedback is framed as identity ("you are not strategic") instead of behavior ("in the Q2 roadmap review, you listed 12 features without prioritizing them"). Identity feedback triggers defensiveness; behavioral feedback enables change.', taskType: 'read', estimatedMinutes: 10 },
            { title: 'SBI walkthrough', content: 'Situation: when and where. Behavior: what the person did or said, observable. Impact: what happened as a result, on you or the team. Concrete examples in next step.', taskType: 'read', estimatedMinutes: 8 },
            { title: 'Convert identity feedback to SBI', content: 'Take 3 examples of identity-framed feedback (provided) and rewrite each as SBI feedback.', taskType: 'challenge', estimatedMinutes: 17, instructions: ['Review the 3 identity-framed examples in the worksheet', 'For each, identify the situation, the observable behavior, and the impact', 'Rewrite as a single SBI statement, max 3 sentences'], skills: ['Feedback', 'Written Communication'], tools: ['Reflection Journal'] },
          ], quiz: [
            { id: 'ss-q5', question: 'Which of the following is an SBI-formatted feedback statement?', options: ['"You are not a team player."', '"In yesterday\\'s design review, you interrupted Sarah three times. She stopped contributing after the third interruption, and we lost her API schema suggestion."', '"You need to be more collaborative."', '"Your behavior in meetings is unprofessional."'], correctAnswer: 1, explanation: 'Option B specifies Situation (yesterday\\'s design review), Behavior (interrupted Sarah three times), and Impact (she stopped contributing, we lost her schema suggestion). The others are identity judgments.' },
          ] },
          { id: 'ss-m2-l2', title: 'Receiving feedback without defensiveness', description: 'The 90-second rule, the "thank you, tell me more" pattern, and how to process feedback later', duration: '30 min', videoUrl: SAMPLE_VIDEO_5, steps: [
            { title: 'The 90-second rule', content: 'When you receive critical feedback, your fight-or-flight response activates within 90 seconds. Your only job in those 90 seconds is to NOT respond defensively. Use "thank you, tell me more" as your default.', taskType: 'read', estimatedMinutes: 8 },
            { title: 'Process, then decide', content: 'You do not have to agree with feedback in the moment. Thank the giver, ask clarifying questions, then process privately. Decide later whether to act on it.', taskType: 'read', estimatedMinutes: 7 },
          ], quiz: [
            { id: 'ss-q6', question: 'When you receive critical feedback, the recommended default response in the first 90 seconds is:', options: ['Explain your reasoning immediately', 'Say "thank you, tell me more"', 'Ask for specific examples', 'Disagree respectfully'], correctAnswer: 1, explanation: 'The fight-or-flight response peaks in 90 seconds. "Thank you, tell me more" buys time, signals openness, and gets you specific examples without triggering defensive escalation.' },
          ] },
        ],
      },
      {
        id: 'ss-m3',
        title: 'Stakeholder Management & Managing Up',
        description: 'How to communicate with directors, VPs, and customers — and how to manage your own manager',
        lessons: [
          { id: 'ss-m3-l1', title: 'The stakeholder map', description: 'Identify your 5 key stakeholders, their goals, and their preferred communication channel', duration: '40 min', videoUrl: SAMPLE_VIDEO_6, steps: [
            { title: 'The stakeholder map template', content: 'List 5 key stakeholders. For each: their title, their #1 goal this quarter, their preferred channel (Slack/email/doc/meeting), and their decision-making style (data-driven, consensus, top-down).', taskType: 'read', estimatedMinutes: 12 },
            { title: 'Build your stakeholder map', content: 'Fill out the stakeholder map for your current role. If you do not have 5 stakeholders, include your manager, skip-level, product partner, and 1 peer.', taskType: 'challenge', estimatedMinutes: 28, instructions: ['Open the stakeholder map template', 'List your 5 key stakeholders', 'For each, fill in: title, quarterly goal, preferred channel, decision style', 'Identify the 1 stakeholder you communicate with LEAST effectively — this is your focus for the next 2 weeks'], skills: ['Stakeholder Management', 'Self-Awareness'], tools: ['Notion', 'Reflection Journal'] },
          ], quiz: [
            { id: 'ss-q7', question: 'What is the #1 benefit of explicitly mapping your stakeholders?', options: ['It helps you avoid them', 'It forces you to understand their goals and adapt your communication', 'It is required for performance reviews', 'It helps you get promoted faster'], correctAnswer: 1, explanation: 'A stakeholder map forces empathy: you cannot communicate effectively with someone whose goals and preferred channels you do not know.' },
          ] },
        ],
      },
    ],
  },

  // ============================================================
  // 8. Software Testing (PRD §3.2)
  // ============================================================
  {
    id: 'testing-pro',
    slug: 'software-testing-masterclass',
    title: 'Software Testing Masterclass',
    subtitle: 'Unit, integration, E2E, performance, and security testing for production code',
    description: 'Comprehensive testing course covering pytest, Jest, Playwright, performance, and security testing with real-world strategies.',
    longDescription:
      'Testing is the single highest-leverage skill separating senior engineers from juniors, and yet most engineers learn it on the job, badly, by writing tests that break randomly and provide no safety net. This course fixes that. You will learn the testing pyramid from first principles, write unit tests with pytest and Jest that actually catch bugs, design integration tests that do not flake, build end-to-end test suites with Playwright that survive UI refactors, load-test APIs with k6 and Locust, and run security scans with OWASP ZAP. Every module includes real buggy code (with hidden defects) that you must catch via tests — by the end you will have a portfolio of 6 test suites across 4 languages and 5 testing tools.',
    icon: 'ShieldCheck',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    level: 'Intermediate',
    duration: '10 weeks',
    lessonsCount: 22,
    studentsCount: '6,540',
    rating: 4.9,
    instructor: 'Vikram Patel',
    instructorTitle: 'Principal Engineer, ex-Microsoft & GitHub',
    tags: ['pytest', 'Jest', 'Playwright', 'k6', 'OWASP', 'TDD', 'E2E'],
    whatYouLearn: [
      'Design test suites using the testing pyramid: 70% unit, 20% integration, 10% E2E',
      'Write pytest unit tests with fixtures, parametrize, and mocks that catch real bugs',
      'Build Jest test suites for React/Node with snapshot testing and RTL',
      'Author Playwright E2E tests that survive UI refactors and run in CI',
      'Load-test APIs with k6 — find the throughput where your service falls over',
      'Run OWASP ZAP security scans and interpret the top 10 vulnerabilities',
    ],
    prerequisites: [
      '1+ year of programming experience (Python or JavaScript preferred)',
      'Familiarity with HTTP APIs and the request/response cycle',
      'A laptop that can run Docker (for the security testing module)',
    ],
    skills: ['Unit Testing', 'Integration Testing', 'End-to-End Testing', 'Test-Driven Development', 'Performance Testing', 'Security Testing', 'CI/CD', 'Python', 'JavaScript'],
    tools: ['pytest', 'Jest', 'Playwright', 'k6', 'Locust', 'OWASP ZAP', 'Docker', 'GitHub Actions'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Hindi', 'German'],
    lastUpdated: '2026-06-20',
    reviewsCount: 892,
    ratingDistribution: [678, 167, 28, 11, 8],
    instructorBio:
      'Vikram Patel is a Principal Engineer with 14 years building testing infrastructure at Microsoft (Azure DevOps), GitHub (Actions test platform), and Datadog. He has shipped test suites that run 2M+ tests per day across 4,000+ microservices, and his talk "Kill the flaky test" at GopherCon 2024 has 280K views. Vikram mentors engineers on testing strategy through testingweekly.com and has helped 40+ startups reduce their CI flake rate below 1%.',
    instructorCourseCount: 6,
    instructorLearnerCount: '18,420',
    instructorRating: 4.9,
    projectType: 'Course',
    desktopOnly: true,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      { id: 'ts-r1', authorName: 'Marcus L.', authorInitials: 'ML', rating: 5, date: '2026-06-08', body: "Vikram's pytest fixtures module completely changed how I write tests. My test suite went from 47 seconds to 11 seconds just by applying the fixture-scoping rules in lesson 3. Worth it for that alone.", upvotes: 38 },
      { id: 'ts-r2', authorName: 'Anjali D.', authorInitials: 'AD', rating: 5, date: '2026-05-25', body: "The Playwright module is the best E2E teaching I have seen anywhere. The 'survive a UI refactor' pattern alone saved my team a week of test rewrites.", upvotes: 29 },
      { id: 'ts-r3', authorName: 'Tom B.', authorInitials: 'TB', rating: 4, date: '2026-05-10', body: "Strong course. The k6 load-testing lab caught a real throughput bottleneck in our production API — we found it at 800 RPS, well below our projected launch load. Only complaint: I want more on chaos engineering.", upvotes: 17 },
      { id: 'ts-r4', authorName: 'Yuki S.', authorInitials: 'YS', rating: 5, date: '2026-04-28', body: "OWASP ZAP module is excellent. We found 3 SQL injection vulnerabilities in our staging environment using the exact scanning profile Vikram walks through. Reported and fixed before they hit production.", upvotes: 11 },
    ],
    oneTimePrice: 199,
    monthlyPrice: 39,
    annualPrice: 390,
    onDemand: true,
    categoryIds: ['backend', 'quality'],
    modules: [
      {
        id: 'ts-m1',
        title: 'Testing Foundations & The Pyramid',
        description: 'Why we test, the testing pyramid, test doubles, and the cost of flake',
        lessons: [
          { id: 'ts-m1-l1', title: 'Why testing matters: the cost of bugs', description: 'The 10x rule, the cost of a P0 in production, and how testing shifts left', duration: '30 min', videoUrl: SAMPLE_VIDEO_1, steps: [
            { title: 'The 10x rule', content: 'A bug caught in requirements costs $1. In development: $10. In QA: $100. In production: $1000+. This curve is why testing is not optional — it is the cheapest form of bug prevention.', taskType: 'read', estimatedMinutes: 8 },
            { title: 'Anatomy of a P0', content: 'A single P0 in production costs the average SaaS company $146K in direct costs (incident response, rollback, customer comms) plus $400K+ in reputational damage. We dissect 3 real P0s and the test that would have caught each.', taskType: 'read', estimatedMinutes: 12 },
            { title: 'Calculate your testing ROI', content: 'Use the ROI calculator (Python script) to estimate how much a 1% reduction in production bugs is worth for your team size and revenue.', taskType: 'code', estimatedMinutes: 10, code: '# Testing ROI calculator\\n# Edit these numbers to match your team\\n\\nengineers = 25\\navg_salary = 180_000  # USD fully loaded\\nprod_bugs_per_quarter = 8\\ncost_per_p0 = 146_000\\n\\n# Cost of bugs per quarter\\nbug_cost = prod_bugs_per_quarter * cost_per_p0\\n\\n# If better testing prevents 50% of bugs\\nprevented = bug_cost * 0.5\\n\\n# Cost of testing infrastructure per quarter (1 eng dedicated)\\ntesting_cost = avg_salary / 4\\n\\nroi = (prevented - testing_cost) / testing_cost * 100\\nprint(f"Quarterly bug cost: ${bug_cost:,}")\\nprint(f"Prevented by testing: ${prevented:,.0f}")\\nprint(f"Testing ROI: {roi:.0f}%")', expectedOutput: 'Quarterly bug cost: $1,168,000\\nPrevented by testing: $584,000\\nTesting ROI: 1196%', skills: ['Testing Strategy', 'ROI Analysis'], tools: ['Python'], instructions: ['Edit the engineers, avg_salary, prod_bugs_per_quarter, and cost_per_p0 values to match your team', 'Run the script', 'Note: even a 25-engineer team with 8 prod bugs/quarter sees >1000% ROI on dedicated testing'] },
          ], quiz: [
            { id: 'ts-q1', question: 'Per the 10x rule, a bug caught in production costs roughly how much more than a bug caught in requirements?', options: ['10x more', '100x more', '1000x more', 'The same'], correctAnswer: 2, explanation: 'The classic 10x rule is per-stage: $1 in requirements → $10 in dev → $100 in QA → $1000+ in production. So production vs. requirements is ~1000x.' },
            { id: 'ts-q2', question: 'The average cost of a single P0 production bug at a SaaS company (per the course material) is approximately:', options: ['$14,600', '$146,000', '$1.46M', '$14.6M'], correctAnswer: 1, explanation: '$146,000 in direct costs (incident response, rollback, comms) — plus $400K+ in reputational damage. Source: Ponemon 2024 Cost of Downtime study.' },
          ] },
          { id: 'ts-m1-l2', title: 'The testing pyramid: 70/20/10', description: 'Unit, integration, E2E — why the ratio matters and how to balance your suite', duration: '35 min', videoUrl: SAMPLE_VIDEO_2, steps: [
            { title: 'The pyramid explained', content: '70% unit tests (fast, isolated, deterministic). 20% integration tests (slower, real dependencies, catch contract bugs). 10% E2E (slowest, simulate real user, catch UI bugs). Inverted pyramids are flaky and slow.', taskType: 'read', estimatedMinutes: 10 },
            { title: 'Anti-pattern: the ice cream cone', content: 'Many teams have an ice cream cone — few unit tests, many E2E tests. These suites are slow, flaky, and provide little safety. We diagnose 3 real ice-cream suites and refactor them.', taskType: 'read', estimatedMinutes: 12 },
            { title: 'Audit your suite', content: 'Run this script to count your tests by type and compute your pyramid ratio.', taskType: 'code', estimatedMinutes: 13, code: '# Pyramid audit — count your tests by type\\nimport os, glob\\n\\nunit_tests = glob.glob("test_*.py", recursive=True) + glob.glob("**/test_*.py", recursive=True)\\nintegration_tests = glob.glob("integration_test_*.py", recursive=True) + glob.glob("**/integration_*.py", recursive=True)\\ne2e_tests = glob.glob("e2e_*.py", recursive=True) + glob.glob("**/e2e_*.spec.ts", recursive=True) + glob.glob("**/e2e_*.spec.js", recursive=True)\\n\\ntotal = len(unit_tests) + len(integration_tests) + len(e2e_tests)\\nif total == 0:\\n    print("No tests found. You have a bigger problem than ratios.")\\nelse:\\n    u, i, e = len(unit_tests)/total*100, len(integration_tests)/total*100, len(e2e_tests)/total*100\\n    print(f"Unit:        {u:5.1f}% (target: 70%)")\\n    print(f"Integration: {i:5.1f}% (target: 20%)")\\n    print(f"E2E:         {e:5.1f}% (target: 10%)")\\n    if e > 25:\\n        print("⚠ Ice cream cone — too many E2E tests, your suite will be slow and flaky")\\n    elif u < 50:\\n        print("⚠ Inverted pyramid — not enough unit tests")\\n    else:\\n        print("✓ Healthy pyramid")', expectedOutput: 'Unit:        68.2% (target: 70%)\\nIntegration: 21.4% (target: 20%)\\nE2E:         10.4% (target: 10%)\\n✓ Healthy pyramid', skills: ['Testing Strategy'], tools: ['Python'], instructions: ['Save this script as pyramid_audit.py in your repo root', 'Run: python pyramid_audit.py', 'Compare your ratios to the 70/20/10 target'] },
          ], quiz: [
            { id: 'ts-q3', question: 'A healthy testing pyramid has roughly what ratio of unit : integration : E2E tests?', options: ['10% : 20% : 70%', '70% : 20% : 10%', '33% : 33% : 33%', '50% : 30% : 20%'], correctAnswer: 1, explanation: '70% unit, 20% integration, 10% E2E. Unit tests are fast and should dominate; E2E tests are slow and should be few but cover critical paths.' },
            { id: 'ts-q4', question: 'An "ice cream cone" test suite has:', options: ['Many unit tests, few E2E tests', 'Many E2E tests, few unit tests', 'All integration tests', 'No tests at all'], correctAnswer: 1, explanation: 'Ice cream cone = wide at the top (E2E), narrow at the bottom (unit). These suites are slow, flaky, and provide poor safety. Common in teams that skipped unit testing.' },
          ] },
        ],
      },
      {
        id: 'ts-m2',
        title: 'Unit Testing with pytest',
        description: 'Fixtures, parametrize, mocks, and the patterns that catch real bugs',
        lessons: [
          { id: 'ts-m2-l1', title: 'pytest fixtures: the right way', description: 'Setup, teardown, scoping, and the fixture patterns that 10x test readability', duration: '45 min', videoUrl: SAMPLE_VIDEO_3, steps: [
            { title: 'Fixture basics', content: 'A fixture is reusable test setup. Use @pytest.fixture to define. Pass the fixture name as a parameter to use it. Fixtures can be function, module, class, or session scoped.', taskType: 'read', estimatedMinutes: 12 },
            { title: 'Write your first fixture', content: 'Build a fixture that creates a temporary SQLite database, returns a connection, and tears it down after the test.', taskType: 'code', estimatedMinutes: 18, code: 'import pytest, sqlite3\\n\\n@pytest.fixture\\ndef db():\\n    """Temporary in-memory SQLite DB that tears down after the test."""\\n    conn = sqlite3.connect(":memory:")\\n    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)")\\n    yield conn  # yield, not return — for teardown\\n    conn.close()\\n\\ndef test_insert_user(db):\\n    db.execute("INSERT INTO users (email) VALUES (?)", ("alice@example.com",))\\n    db.commit()\\n    cur = db.execute("SELECT COUNT(*) FROM users")\\n    assert cur.fetchone()[0] == 1\\n\\ndef test_unique_email(db):\\n    db.execute("INSERT INTO users (email) VALUES (?)", ("alice@example.com",))\\n    db.commit()\\n    with pytest.raises(sqlite3.IntegrityError):\\n        db.execute("INSERT INTO users (email) VALUES (?)", ("alice@example.com",))\\n        db.commit()', expectedOutput: 'test_insert_user PASSED\\ntest_unique_email PASSED\\n2 passed in 0.03s', skills: ['Unit Testing', 'pytest'], tools: ['pytest', 'Python'] },
          ], quiz: [
            { id: 'ts-q5', question: 'In a pytest fixture, you should use `yield` instead of `return` when:', options: ['Never — return is always correct', 'You need teardown logic after the test runs', 'You want the fixture to be cached', 'You are using session scope'], correctAnswer: 1, explanation: 'yield lets code AFTER the yield run as teardown, even if the test fails. return cannot do teardown — the connection would leak.' },
          ] },
        ],
      },
    ],
  },

  // ============================================================
  // 9. Web Development (PRD §3.2)
  // ============================================================
  {
    id: 'web-dev',
    slug: 'full-stack-web-development',
    title: 'Full Stack Web Development',
    subtitle: 'Modern web stack: Next.js, React, TypeScript, Tailwind, Prisma, and PostgreSQL',
    description: 'Build production web apps with the modern stack used at Vercel, Linear, and Cal.com.',
    longDescription:
      'This is the web development course we wish existed when we were learning. Instead of teaching you 14 different frameworks superficially, we teach one modern stack deeply: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma, PostgreSQL, and Vercel. You will build 4 real applications — a blog, a SaaS dashboard, a real-time chat app, and an AI-powered tool — and ship each one to production on Vercel with a real custom domain. Every lesson is built around the actual workflow used at companies like Vercel, Linear, Cal.com, and Loom: type-safe end-to-end, server actions for mutations, optimistic UI updates, and edge runtime for global performance. By the end you will have a portfolio of 4 deployed apps and the exact patterns used by senior full-stack engineers at top product companies.',
    icon: 'Globe',
    color: 'sky',
    gradient: 'from-sky-500 to-cyan-600',
    level: 'Intermediate',
    duration: '12 weeks',
    lessonsCount: 28,
    studentsCount: '15,720',
    rating: 4.9,
    instructor: 'Daniel Kim',
    instructorTitle: 'Senior Engineer at Vercel, ex-Linear',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Prisma', 'PostgreSQL', 'Vercel'],
    whatYouLearn: [
      'Build full-stack apps with Next.js 16 App Router and Server Components',
      'Type-safe database access with Prisma and PostgreSQL end-to-end',
      'Design beautiful UIs with Tailwind CSS 4 and shadcn/ui components',
      'Implement auth with NextAuth.js (Google, GitHub, magic link)',
      'Ship real-time features with server actions and optimistic updates',
      'Deploy to Vercel with edge runtime, ISR, and global CDN caching',
    ],
    prerequisites: [
      'Comfortable with JavaScript ES6+ (arrow functions, destructuring, async/await)',
      'Basic HTML and CSS',
      'A laptop with Node.js 20+ installed',
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Server Components', 'REST API Design', 'Authentication', 'Deployment'],
    tools: ['Next.js 16', 'React 19', 'TypeScript 5', 'Tailwind CSS 4', 'Prisma 6', 'PostgreSQL 16', 'Vercel', 'shadcn/ui'],
    language: 'English',
    availableLanguages: ['English', 'Spanish', 'Hindi', 'French', 'German'],
    lastUpdated: '2026-06-25',
    reviewsCount: 2314,
    ratingDistribution: [1789, 412, 67, 28, 18],
    instructorBio:
      'Daniel Kim is a Senior Engineer at Vercel working on the Next.js App Router, previously at Linear where he built the real-time collaboration layer. He has shipped 6 production Next.js applications with combined traffic of 40M+ monthly visits, is a contributor to React 19 Server Components, and writes the weekly newsletter nextjsweekly.dev read by 87K engineers. Daniel has mentored 60+ engineers into senior full-stack roles at Vercel, Linear, Cal.com, and Loom.',
    instructorCourseCount: 8,
    instructorLearnerCount: '47,890',
    instructorRating: 4.9,
    projectType: 'Course',
    desktopOnly: false,
    requiresDownload: true,
    certificateAvailable: true,
    reviews: [
      { id: 'wd-r1', authorName: 'Elena V.', authorInitials: 'EV', rating: 5, date: '2026-06-15', body: "I tried 3 other web dev bootcamps before this. Daniel's course is the first one that taught the actual modern stack (App Router + Server Components + Prisma) instead of the 2020 stack (Pages Router + Redux + Express). Got a job at a Vercel-tier startup 2 months after finishing.", upvotes: 78 },
      { id: 'wd-r2', authorName: 'Hiroshi K.', authorInitials: 'HK', rating: 5, date: '2026-06-01', body: "The real-time chat app module alone is worth the full price. Daniel teaches the exact optimistic-UI pattern Linear uses, with the tradeoffs explained. I shipped a similar feature at work the next week.", upvotes: 56 },
      { id: 'wd-r3', authorName: 'Fatima A.', authorInitials: 'FA', rating: 5, date: '2026-05-20', body: "Best TypeScript teaching I have seen. The end-to-end type safety module (Prisma schema → server action → client component → form) is the single most useful lesson I have taken in any course, period.", upvotes: 41 },
      { id: 'wd-r4', authorName: 'Carlos M.', authorInitials: 'CM', rating: 4, date: '2026-05-05', body: "Excellent course, only minor complaint: I wish there was more on testing. The testing module is solid but I wanted a deeper dive on Playwright. Otherwise perfect — the deployment module saved me hours.", upvotes: 22 },
    ],
    oneTimePrice: 219,
    monthlyPrice: 39,
    annualPrice: 390,
    onDemand: true,
    categoryIds: ['frontend', 'backend', 'fullstack'],
    modules: [
      {
        id: 'wd-m1',
        title: 'Modern Next.js Foundations',
        description: 'App Router, Server Components, Server Actions, and the mental model that makes Next.js 16 different',
        lessons: [
          { id: 'wd-m1-l1', title: 'The App Router mental model', description: 'Server Components by default, Client Components opt-in — and why this changes everything', duration: '40 min', videoUrl: SAMPLE_VIDEO_1, steps: [
            { title: 'Server vs. Client Components', content: 'In Next.js 16, every component is a Server Component by default. Server Components render on the server, can access the DB directly, and ship 0 JS to the client. Add "use client" only when you need state, effects, or event handlers.', taskType: 'read', estimatedMinutes: 12 },
            { title: 'The mental shift', content: 'In the Pages Router you thought: "what is on the client?" In the App Router you think: "what MUST be on the client?" Everything else stays on the server. This shifts your default — and dramatically reduces bundle size.', taskType: 'read', estimatedMinutes: 10 },
            { title: 'Identify Client Components', content: 'Look at this component tree and mark which components need "use client".', taskType: 'code', estimatedMinutes: 18, code: '// Mark each component: Server (S) or Client (C)?\\n\\n// 1. ProductList — fetches products from DB, renders list\\n// → S (no state, no effects — server fetch is fine)\\n\\n// 2. AddToCartButton — onClick handler, optimistically updates UI\\n// → C (needs onClick + state)\\n\\n// 3. ProductCard — pure display, no interactivity\\n// → S (just renders props)\\n\\n// 4. SearchBar — controlled input, debounced API call\\n// → C (controlled input = state)\\n\\n// 5. ProductGrid — maps over products, renders ProductCards\\n// → S (can render children server-side)\\n\\n// 6. CartProvider — React Context provider, holds cart state\\n// → C (Context requires client)\\n\\n// Rule of thumb: if it uses useState, useEffect, onClick, onChange,\\n// or React Context — it needs "use client".\\n\\nconsole.log("Rules identified. Now apply to your own codebase.")', expectedOutput: 'Rules identified. Now apply to your own codebase.', skills: ['React', 'Next.js', 'Server Components'], tools: ['Next.js', 'React'], instructions: ['Read each of the 6 components and the answer', 'The pattern: anything with useState/useEffect/onClick/onChange = Client', 'Open your own Next.js project and audit which components have "use client" — can any be moved to Server?'] },
          ], quiz: [
            { id: 'wd-q1', question: 'In Next.js 16 App Router, which directive marks a component as a Client Component?', options: ['"use server"', '"use client"', '"client-only"', 'No directive needed — client is default'], correctAnswer: 1, explanation: '"use client" at the top of the file marks it as a Client Component. Without it, the component is a Server Component by default.' },
            { id: 'wd-q2', question: 'Which of these components MUST be a Client Component?', options: ['A component that fetches data from the database', 'A component that renders a list of products', 'A component that uses useState to track a form input', 'A component that displays a static header'], correctAnswer: 2, explanation: 'useState is a React hook that only runs on the client. Any component using hooks (useState, useEffect, useContext, etc.) must be a Client Component.' },
          ] },
          { id: 'wd-m1-l2', title: 'Server Actions: the modern mutation pattern', description: 'Why Server Actions replace fetch + API routes for most mutations, and when to still use API routes', duration: '45 min', videoUrl: SAMPLE_VIDEO_2, steps: [
            { title: 'What Server Actions replace', content: 'Pre-Next.js 16: you wrote an API route, called fetch from the client, handled loading/error states. With Server Actions: you write an async function with "use server", call it directly from a form onSubmit, get progressive enhancement for free.', taskType: 'read', estimatedMinutes: 12 },
            { title: 'A complete Server Action', content: 'Build a "create post" Server Action with Zod validation, Prisma insert, and revalidatePath.', taskType: 'code', estimatedMinutes: 25, code: '"use server"\\n\\nimport { z } from "zod"\\nimport { prisma } from "@/lib/prisma"\\nimport { revalidatePath } from "next/cache"\\n\\nconst schema = z.object({\\n  title: z.string().min(3).max(100),\\n  body: z.string().min(10).max(10000),\\n})\\n\\nexport async function createPost(formData: FormData) {\\n  // 1. Validate\\n  const parsed = schema.safeParse({\\n    title: formData.get("title"),\\n    body: formData.get("body"),\\n  })\\n  if (!parsed.success) {\\n    return { ok: false, errors: parsed.error.flatten().fieldErrors }\\n  }\\n\\n  // 2. Insert\\n  const post = await prisma.post.create({\\n    data: parsed.data,\\n  })\\n\\n  // 3. Revalidate the page that lists posts\\n  revalidatePath("/")\\n\\n  // 4. Return success\\n  return { ok: true, post }\\n}', expectedOutput: 'Server Action compiled successfully. Call from a Client Component via form action={createPost}.', skills: ['Server Actions', 'TypeScript', 'Prisma'], tools: ['Next.js', 'Prisma', 'Zod'] },
          ], quiz: [
            { id: 'wd-q3', question: 'Server Actions in Next.js 16 require which directive at the top of the file?', options: ['"use server"', '"use client"', '"server-only"', 'No directive needed'], correctAnswer: 0, explanation: '"use server" marks a file as containing Server Actions. These can be imported into Client Components and called directly, but execute on the server.' },
            { id: 'wd-q4', question: 'Which function from next/cache do you call to refresh the data on a page after a Server Action mutation?', options: ['refresh()', 'revalidate()', 'revalidatePath()', 'router.refresh()'], correctAnswer: 2, explanation: 'revalidatePath("/path") purges the cache for that path so the next render fetches fresh data. router.refresh() works too but is client-side and less efficient.' },
          ] },
        ],
      },
    ],
  },
'''

# Insert before the closing `];`
new_src = src[:match.end(1)] + NEW_COURSES + src[match.start(2):]
COURSES_FILE.write_text(new_src)

# Count courses added
course_count = new_src.count("    id: '")  # rough count of course ids (also matches lesson ids, so just a sanity check)
print(f"Inserted 3 new courses (soft-skills, testing-pro, web-dev) into {COURSES_FILE}")
print(f"File size: {len(src)} → {len(new_src)} bytes (+{len(new_src)-len(src)})")
