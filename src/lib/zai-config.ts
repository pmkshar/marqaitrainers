// ============================================================
// ZAI (Z.ai) shared config + LLM client helper
// ------------------------------------------------------------
// Used by /api/tutor, /api/interview/*, /api/resume/reform.
// Keeps the credential resolution logic in one place so all
// routes can fall back to rule-based behaviour when no ZAI
// credentials are configured (e.g. on Vercel without env vars).
// ============================================================

export interface ZAIConfig {
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
export async function resolveZAIConfig(): Promise<ZAIConfig | null> {
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

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Call the ZAI chat-completions endpoint.
 * Returns the assistant's text content, or null if anything went wrong
 * (caller is expected to fall back to a rule-based response).
 */
export async function callZAIChat(
  config: ZAIConfig,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string | null> {
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
        messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1200,
        thinking: { type: 'disabled' },
      }),
    });
  } catch (err) {
    console.error('ZAI fetch error:', err);
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '(no body)');
    console.error('ZAI API error:', response.status, errorText.slice(0, 200));
    return null;
  }

  const data = await response.json();
  return (data?.choices?.[0]?.message?.content as string | undefined) ?? null;
}
