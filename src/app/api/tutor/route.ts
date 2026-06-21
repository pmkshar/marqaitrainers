import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  courseContext?: string;
}

const SYSTEM_PROMPT = `You are TutorAI, an expert software engineering instructor on a personalized learning platform.
You help students learn software development topics including: AI & Machine Learning, Full Stack Java, .NET, Mobile App Development (React Native), Flutter, and Python.

Your teaching style:
- Be concise but thorough. Lead with the direct answer, then explain the "why".
- Use short code snippets (5-20 lines) with language tags when helpful.
- Prefer plain language; define jargon on first use.
- When a learner is confused, ask one clarifying question instead of dumping more information.
- Encourage best practices: testing, security, accessibility, and clean code.
- If a learner asks for the answer to a quiz, gently redirect them to reason through it themselves.
- Stay on the topic of software engineering and learning. Politely decline off-topic requests.

Keep responses focused. Use Markdown formatting (headings, lists, code blocks, bold) for readability.`;

interface ZAIConfig {
  baseUrl: string;
  apiKey: string;
  chatId?: string;
  userId?: string;
  token?: string;
}

/**
 * Resolve ZAI credentials from (in priority order):
 *   1. Explicit env vars: ZAI_BASE_URL + ZAI_API_KEY (recommended for Vercel)
 *   2. ZAI_API_KEY only (uses default public base URL)
 *   3. JSON file at one of the SDK search paths (local dev with .z-ai-config)
 *
 * Returns null if no configuration is found.
 */
async function resolveZAIConfig(): Promise<ZAIConfig | null> {
  // 1) Env vars (Vercel / production)
  const envKey = process.env.ZAI_API_KEY;
  const envBase = process.env.ZAI_BASE_URL;
  if (envKey && envBase) {
    return { baseUrl: envBase, apiKey: envKey };
  }
  if (envKey) {
    // Default public ZAI OpenAI-compatible endpoint
    return { baseUrl: 'https://api.z.ai/api/paas/v4', apiKey: envKey };
  }

  // 2) Fall back to .z-ai-config JSON file (local dev / sandbox)
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    const candidates = [
      path.join(process.cwd(), '.z-ai-config'),
      path.join(os.default.homedir(), '.z-ai-config'),
      '/etc/.z-ai-config',
    ];
    for (const p of candidates) {
      try {
        const raw = await fs.default.readFile(p, 'utf-8');
        const cfg = JSON.parse(raw);
        if (cfg.baseUrl && cfg.apiKey) return cfg as ZAIConfig;
      } catch {
        // skip missing / invalid file
      }
    }
  } catch {
    // fs unavailable — fall through
  }

  return null;
}

// =========================================================================
// Rule-based fallback tutor
// -------------------------------------------------------------------------
// When no ZAI credentials are configured (e.g. on Vercel without env vars),
// we fall back to a deterministic, helpful rule-based tutor. This ensures
// the AI tutor is ALWAYS responsive — never shows "unavailable" errors.
// =========================================================================

interface Rule {
  keywords: string[];
  topic: string;
  reply: string;
}

const FALLBACK_RULES: Rule[] = [
  {
    topic: 'gradient descent',
    keywords: ['gradient descent', 'gradient', 'descent'],
    reply: `**Gradient Descent** is an optimization algorithm used to minimize a function (usually a loss function) by iteratively moving in the direction of steepest descent.

### How it works
1. Start at a random point on the cost function surface.
2. Compute the gradient (slope) at that point.
3. Take a small step in the *opposite* direction of the gradient.
4. Repeat until the gradient is near zero (a minimum).

### The update rule
\`\`\`python
theta = theta - learning_rate * gradient_of_cost(theta)
\`\`\`

### Intuition
Imagine you're blindfolded on a hill and want to reach the valley. You feel the slope with your feet, take a step downhill, and repeat. Smaller steps = slower but safer; bigger steps = faster but riskier (you might overshoot).

### Types
- **Batch GD** — uses the entire dataset each step (slow but stable).
- **Stochastic GD (SGD)** — uses one sample per step (fast, noisy).
- **Mini-batch GD** — uses a small batch (the practical default, ~32–256).

### Common pitfalls
- **Learning rate too high** → diverges.
- **Learning rate too low** → too slow or stuck on a plateau.
- **Local minima** → in high-dimensional spaces, usually not a real issue; saddle points are the bigger concern.`,
  },
  {
    topic: 'spring vs spring boot',
    keywords: ['spring vs', 'spring boot', 'spring framework'],
    reply: `**Spring** is a comprehensive application framework for Java. **Spring Boot** is an opinionated layer on top of Spring that simplifies setup.

### Spring Framework
- Provides core features: DI, AOP, transaction management, MVC.
- You wire everything yourself: configs (XML or Java), servers, dependencies.
- Maximum flexibility, more boilerplate.

### Spring Boot
- Auto-configures sensible defaults based on classpath.
- Embeds Tomcat/Jetty — no WAR deployment needed.
- Starter POMs bundle common dependencies (\`spring-boot-starter-web\`, \`-data-jpa\`, etc.).
- Production-ready features: metrics, health checks, externalized config.

### Quick comparison
| Aspect | Spring | Spring Boot |
|---|---|---|
| Setup | Manual | Auto |
| Server | External (Tomcat/JBoss) | Embedded |
| Config | XML / Java | Defaults + \`application.yml\` |
| Time to first endpoint | Hours | Minutes |

### When to use which
- New project? **Spring Boot.** Always.
- Maintaining legacy Spring XML apps? Stick with Spring, migrate gradually to Boot.`,
  },
  {
    topic: 'flutter center div',
    keywords: ['center a div', 'center div', 'center flutter'],
    reply: `In **Flutter**, there's no DOM/CSS — everything is a widget. To center content you wrap it in a \`Center\` widget (or use \`AxisAlignment\`).

### Center a single child
\`\`\`dart
Center(
  child: Text('Hello, Flutter!'),
)
\`\`\`

### Center in a Column (vertical + horizontal)
\`\`\`dart
Column(
  mainAxisAlignment: MainAxisAlignment.center, // vertical
  crossAxisAlignment: CrossAxisAlignment.center, // horizontal
  children: [Text('Centered')],
)
\`\`\`

### Center a card on screen with constraints
\`\`\`dart
Scaffold(
  body: Center(
    child: SizedBox(
      width: 300,
      child: Card(child: ListTile(title: Text('Centered card'))),
    ),
  ),
)
\`\`\`

### Pro tip
Use \`Center\` for one-offs. For richer layouts (multiple children, space-between, etc.), prefer \`Column\`/\`Row\` with \`mainAxisAlignment\` and \`crossAxisAlignment\`.`,
  },
  {
    topic: 'react native vs flutter',
    keywords: ['react native vs flutter', 'react native or flutter', 'rn vs flutter'],
    reply: `Both let you build cross-platform mobile apps from one codebase, but the philosophy differs.

### TL;DR
- **React Native** — JavaScript/TypeScript, renders to native UI components, huge ecosystem.
- **Flutter** — Dart, renders to a custom canvas, excellent performance & UI consistency.

### Comparison
| Aspect | React Native | Flutter |
|---|---|---|
| Language | JS/TS | Dart |
| UI rendering | Native components | Skia canvas (custom) |
| Performance | Good | Excellent (60–120 fps) |
| Hot reload | Yes | Yes (faster) |
| Ecosystem | npm (huge) | pub.dev (growing fast) |
| Learning curve | Easy if you know React | New language + widgets |
| Native feel | Auto (uses platform UI) | Manual theming |

### When to pick which
- **Choose React Native** if your team already knows React, you need to share code with a React web app, or you want maximum npm packages.
- **Choose Flutter** if you want pixel-perfect UI consistency across iOS/Android, buttery animations, or your team is starting fresh.`,
  },
  {
    topic: 'python hello world',
    keywords: ['python', 'hello world', 'print'],
    reply: `Welcome to Python — one of the most beginner-friendly languages.

### Hello, World!
\`\`\`python
print("Hello, World!")
\`\`\`

### Variables and types
\`\`\`python
name = "Priya"          # str
age = 28                # int
height = 5.6            # float
is_member = True        # bool

# f-strings (Python 3.6+)
print(f"{name} is {age} years old")
\`\`\`

### Control flow
\`\`\`python
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teen")
else:
    print("Child")

for i in range(5):
    print(i)
\`\`\`

### A function
\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

### Run it
Save as \`hello.py\` and run with \`python hello.py\`. Want to follow along? Check the Python Programming course on the dashboard — it walks through syntax, data structures, OOP, web dev, and data science step-by-step.`,
  },
  {
    topic: 'javascript',
    keywords: ['javascript', 'js ', 'node'],
    reply: `**JavaScript** is the language of the web — runs in browsers, servers (Node.js), and even mobile/desktop apps now.

### Hello, World! in browser
\`\`\`javascript
console.log("Hello, World!");
\`\`\`

### Modern ES6+ essentials
\`\`\`javascript
// arrow functions
const add = (a, b) => a + b;

// destructuring
const { name, age } = user;
const [first, ...rest] = arr;

// template literals
const greeting = \`Hello, \${name}!\`;

// async/await
async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}
\`\`\`

### Common pitfalls
- \`==\` does type coercion; always use \`===\`.
- \`this\` is dynamic — use arrow functions when you need lexical \`this\`.
- Async errors need \`try/catch\` or \`.catch()\`.

### Recommended path
1. Learn syntax (variables, functions, control flow).
2. Learn the DOM and events.
3. Learn fetch + promises + async/await.
4. Pick a framework (React recommended).
5. Learn Node.js for the backend.`,
  },
  {
    topic: 'java',
    keywords: ['java', 'jvm', 'spring'],
    reply: `**Java** is a statically typed, OOP-first language that runs on the JVM (Java Virtual Machine).

### Hello, World!
\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### Key concepts to learn
- **Classes & objects** — Java is purely OOP.
- **Interfaces & abstract classes** — for contracts and shared behavior.
- **Generics** — type-safe collections.
- **Streams API** (Java 8+) — functional-style data processing.
- **Exception handling** — checked vs unchecked.

### Spring Boot quickstart
\`\`\`bash
# Generate a project at https://start.spring.io
./mvnw spring-boot:run
\`\`\`

### A simple REST endpoint
\`\`\`java
@RestController
@RequestMapping("/api")
public class HelloController {
    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello, World!");
    }
}
\`\`\`

### Recommended path
1. Core Java (syntax, OOP, collections, exceptions).
2. JDBC + databases.
3. Maven or Gradle build tooling.
4. Spring Core → Spring Boot → Spring Data JPA → Spring Security.
5. Build a REST API with auth.`,
  },
  {
    topic: '.net',
    keywords: ['.net', 'dotnet', 'c#', 'csharp'],
    reply: `**.NET** (formerly .NET Core) is Microsoft's cross-platform, high-performance runtime. C# is its flagship language.

### Hello, World! in C#
\`\`\`csharp
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}
\`\`\`

### Modern C# essentials (C# 10+)
\`\`\`csharp
// top-level statements (no boilerplate Main)
var name = "Priya";
Console.WriteLine($"Hello, {name}!");

// records (immutable value types)
public record User(string Name, int Age);

// pattern matching
var discount = user.Age switch {
    < 18 => 0.5,
    >= 65 => 0.3,
    _ => 0.0,
};
\`\`\`

### ASP.NET Core minimal API
\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/hello", () => new { message = "Hello, World!" });
app.Run();
\`\`\`

### Recommended path
1. C# syntax + OOP.
2. LINQ + async/await.
3. ASP.NET Core MVC/Web API.
4. Entity Framework Core.
5. Build a REST API with auth.`,
  },
  {
    topic: 'mobile',
    keywords: ['mobile', 'react native', 'android', 'ios'],
    reply: `**Mobile app development** spans native, cross-platform, and web-based approaches.

### Options at a glance
| Approach | Languages | Tools | Best for |
|---|---|---|---|
| Native iOS | Swift | Xcode | Apple-first, max polish |
| Native Android | Kotlin | Android Studio | Android-first, max perf |
| React Native | JS/TS | Expo / CLI | JS team, cross-platform |
| Flutter | Dart | Flutter SDK | Pixel-perfect UI, fast |
| PWA | HTML/JS | Any | Web-only, no app store |

### React Native quickstart (Expo)
\`\`\`bash
npx create-expo-app my-app
cd my-app
npx expo start
\`\`\`

### A simple component
\`\`\`tsx
import { View, Text, Pressable } from 'react-native';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <View style={{ padding: 20 }}>
      <Text>Count: {count}</Text>
      <Pressable onPress={() => setCount(c => c + 1)}>
        <Text>Increment</Text>
      </Pressable>
    </View>
  );
}
\`\`\`

### Recommended path
1. Pick a stack (React Native recommended if you know React).
2. Learn core components (View, Text, Pressable, FlatList).
3. Learn navigation (React Navigation).
4. State management (Zustand, Redux Toolkit, or React Context).
5. Native modules + deployment to Play Store / App Store.`,
  },
  {
    topic: 'flutter',
    keywords: ['flutter', 'dart', 'widget'],
    reply: `**Flutter** is Google's UI toolkit for building natively compiled apps from a single Dart codebase.

### Hello, World!
\`\`\`dart
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('Hello')),
        body: Center(child: Text('Hello, Flutter!')),
      ),
    );
  }
}
\`\`\`

### Core concepts
- **Everything is a widget** — composition over inheritance.
- **StatelessWidget** — immutable, no internal state.
- **StatefulWidget** — has mutable state via \`setState\`.
- **Build method** — describes the UI; Flutter re-runs it when state changes.

### State management options
1. \`setState\` — local widget state.
2. \`Provider\` / \`InheritedNotifier\` — simple shared state.
3. **Riverpod** — modern, testable, recommended for new apps.
4. **BLoC** — event-driven, scales well for complex apps.

### Recommended path
1. Dart language basics.
2. Widgets tree + layout (Row, Column, Stack, Container).
3. Navigation (\`go_router\`).
4. State management (Riverpod).
5. HTTP + persistence (\`dio\`, \`hive\`, \`sqflite\`).`,
  },
];

function generateFallbackReply(userMessage: string, courseContext?: string): string {
  const lower = userMessage.toLowerCase();
  const matchedRule = FALLBACK_RULES.find((r) =>
    r.keywords.some((k) => lower.includes(k)),
  );

  if (matchedRule) {
    return matchedRule.reply;
  }

  // Generic helpful response
  const contextNote = courseContext
    ? `\n\nYou're currently studying **${courseContext}** — I can dive into any concept from that course, or anything else software-engineering related.`
    : '';

  return `Great question! Here's how I can help:

I'm **TutorAI**, your software-engineering instructor. I cover **Python, AI/ML, Full Stack Java, .NET, Mobile (React Native), and Flutter**.

### What I can do
- **Explain concepts** — from "what is a variable" to "how do transformers work"
- **Write & debug code** — paste a snippet and I'll review it
- **Compare technologies** — React vs Vue, Spring vs Spring Boot, etc.
- **Plan your learning path** — pick a stack and I'll suggest an order

### Try asking me
- "Explain gradient descent in simple terms"
- "What's the difference between Spring and Spring Boot?"
- "How do I center a div in Flutter?"
- "Help me choose between React Native and Flutter"
- "Show me a Python hello world"${contextNote}

### Note
The full AI model isn't configured on this deployment — you're seeing my rule-based fallback responses. To enable the full LLM-backed tutor, set the \`ZAI_API_KEY\` environment variable on Vercel and redeploy.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const messages = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const config = await resolveZAIConfig();

    // -------- FALLBACK: rule-based tutor when no AI credentials configured --------
    // This ensures the AI tutor always responds — never shows "unavailable".
    if (!config) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      const reply = generateFallbackReply(lastUserMsg?.content ?? '', body.courseContext);
      return NextResponse.json({
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        fallback: true,
      });
    }

    const contextualSystem = body.courseContext
      ? `${SYSTEM_PROMPT}\n\nThe learner is currently studying: ${body.courseContext}. Tailor examples to this course when relevant.`
      : SYSTEM_PROMPT;

    const fullMessages = [
      { role: 'system' as const, content: contextualSystem },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
    ];

    // Call the ZAI OpenAI-compatible chat completions endpoint directly.
    const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      'X-Z-AI-From': 'Z',
    };
    if (config.chatId) headers['X-Chat-Id'] = config.chatId;
    if (config.userId) headers['X-User-Id'] = config.userId;
    if (config.token) headers['X-Token'] = config.token;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: fullMessages,
          temperature: 0.5,
          max_tokens: 1200,
          thinking: { type: 'disabled' },
        }),
      });
    } catch (fetchErr) {
      // Network error — fall back to rule-based tutor instead of failing
      console.error('ZAI fetch error, using fallback:', fetchErr);
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      const reply = generateFallbackReply(lastUserMsg?.content ?? '', body.courseContext);
      return NextResponse.json({
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        fallback: true,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ZAI API error:', response.status, errorText);
      // Fall back to rule-based tutor instead of returning an error
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      const reply = generateFallbackReply(lastUserMsg?.content ?? '', body.courseContext);
      return NextResponse.json({
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        fallback: true,
      });
    }

    const data = await response.json();
    const content =
      data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    return NextResponse.json({
      role: 'assistant',
      content,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Tutor API error:', err);
    // Last-resort fallback: still return a helpful response, not an error
    try {
      const body = await req.json();
      const messages = body.messages ?? [];
      const lastUserMsg = [...messages].reverse().find((m: { role: string; content: string }) => m.role === 'user');
      const reply = generateFallbackReply(lastUserMsg?.content ?? '', body.courseContext);
      return NextResponse.json({
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        fallback: true,
      });
    } catch {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        {
          error: 'The AI tutor is unavailable right now. Please try again in a moment.',
          detail: message,
        },
        { status: 500 }
      );
    }
  }
}
