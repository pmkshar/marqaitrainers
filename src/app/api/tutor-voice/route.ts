import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================
// Tutor Voice API
// ------------------------------------------------------------
// Generates voice-over audio for the AI tutor's explanation
// of a chapter slide. Uses ZAI TTS via z-ai-web-dev-sdk.
//
// POST /api/tutor-voice
//   body: { text, voice, speed }
//   response: audio/wav (binary)
//
// Text longer than 1000 chars is split at sentence boundaries
// into multiple TTS calls; the resulting WAV buffers are
// concatenated into a single playable WAV stream.
// ============================================================

interface VoiceRequestBody {
  text: string;
  voice?: 'tongtong' | 'chuichui' | 'xiaochen' | 'jam' | 'kazi' | 'douji' | 'luodo';
  speed?: number;
}

interface ZaiInstance {
  audio: {
    tts: {
      create: (opts: Record<string, unknown>) => Promise<Response>;
    };
  };
}

const MAX_CHUNK_LEN = 1000; // ZAI TTS limit is 1024; leave some safety margin

/** Split text into TTS-safe chunks at sentence boundaries. */
function splitIntoChunks(text: string, maxLen = MAX_CHUNK_LEN): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return [cleaned];

  // Match sentences ending in . ! ? or paragraph breaks
  const sentences = cleaned.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [cleaned];
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((cur + ' ' + trimmed).length <= maxLen) {
      cur = cur ? cur + ' ' + trimmed : trimmed;
    } else {
      if (cur) chunks.push(cur);
      // If a single sentence is still too long, hard-split it
      if (trimmed.length > maxLen) {
        for (let i = 0; i < trimmed.length; i += maxLen) {
          chunks.push(trimmed.slice(i, i + maxLen));
        }
        cur = '';
      } else {
        cur = trimmed;
      }
    }
  }
  if (cur) chunks.push(cur);
  return chunks.filter(Boolean);
}

/**
 * Concatenate multiple WAV (PCM) buffers into one playable WAV.
 * Assumes all inputs are 16-bit PCM mono at the same sample rate
 * (ZAI TTS output is 24kHz mono 16-bit PCM).
 */
function concatWav(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];

  // Use the first buffer's header (44 bytes for standard PCM WAV)
  const headerSize = 44;
  const header = buffers[0].subarray(0, headerSize);

  // Sum all data segments
  let totalDataSize = 0;
  const dataSegments: Buffer[] = [];
  for (const buf of buffers) {
    if (buf.length <= headerSize) continue;
    totalDataSize += buf.length - headerSize;
    dataSegments.push(buf.subarray(headerSize));
  }

  // Build the combined buffer
  const combined = Buffer.concat([header, ...dataSegments], headerSize + totalDataSize);

  // Patch the RIFF chunk size (offset 4, 4 bytes LE) = total file size - 8
  combined.writeUInt32LE(combined.length - 8, 4);
  // Patch the data subchunk size (offset 40, 4 bytes LE) = totalDataSize
  combined.writeUInt32LE(totalDataSize, 40);

  return combined;
}

let zaiPromise: Promise<ZaiInstance> | null = null;

/**
 * Construct a ZAI SDK instance from env vars (Vercel) or fall back
 * to the file-based loader (local dev with /etc/.z-ai-config).
 *
 * Required env vars on Vercel:
 *   ZAI_API_KEY  (e.g. "Z.ai")
 *   ZAI_BASE_URL (e.g. "https://internal-api.z.ai/v1")
 * Optional:
 *   ZAI_CHAT_ID, ZAI_USER_ID, ZAI_TOKEN
 */
async function getZAI(): Promise<ZaiInstance> {
  if (!zaiPromise) {
    const mod = await import('z-ai-web-dev-sdk');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ZAI = (mod as any).default;

    const envKey = process.env.ZAI_API_KEY;
    const envBase = process.env.ZAI_BASE_URL;
    if (envKey && envBase) {
      // Build config from env vars (Vercel production)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfg: Record<string, string> = { baseUrl: envBase, apiKey: envKey };
      if (process.env.ZAI_CHAT_ID) cfg.chatId = process.env.ZAI_CHAT_ID;
      if (process.env.ZAI_USER_ID) cfg.userId = process.env.ZAI_USER_ID;
      if (process.env.ZAI_TOKEN) cfg.token = process.env.ZAI_TOKEN;
      // Construct directly — bypasses the SDK's file-based loader
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zaiPromise = Promise.resolve(new ZAI(cfg) as ZaiInstance);
    } else {
      // Fall back to file-based loader (local dev with /etc/.z-ai-config)
      zaiPromise = ZAI.create() as Promise<ZaiInstance>;
    }
  }
  return zaiPromise;
}

async function generateOneChunk(
  zai: ZaiInstance,
  text: string,
  voice: string,
  speed: number,
): Promise<Buffer> {
  let response: Response;
  try {
    // IMPORTANT: Z.ai's TTS gateway requires `model` to be set to the
    // same value as `voice` (e.g. model:"tongtong" voice:"tongtong").
    // Without `model`, the gateway returns HTTP 400 with code 1214
    // "The model code cannot be empty." This is the public/internal
    // TTS gateway contract as of 2026.
    response = await zai.audio.tts.create({
      input: text,
      voice,
      model: voice, // <-- required by Z.ai TTS gateway
      speed,
      response_format: 'wav',
      stream: false,
    });
  } catch (fetchErr) {
    // Node's fetch wraps underlying errors; expose cause if present
    const cause = (fetchErr as { cause?: { code?: string; message?: string } }).cause;
    const causeMsg = cause ? ` (cause: ${cause.code ?? cause.message})` : '';
    throw new Error(`fetch failed: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}${causeMsg}`);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '(no body)');
    throw new Error(`ZAI TTS HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(new Uint8Array(arrayBuffer));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VoiceRequestBody;
    const text = (body.text ?? '').trim();
    const voice = body.voice ?? 'tongtong';
    const speed = typeof body.speed === 'number' ? Math.min(2, Math.max(0.5, body.speed)) : 1.0;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No speakable text' }, { status: 400 });
    }

    const zai = await getZAI();

    // Generate each chunk sequentially (the ZAI API serialises anyway)
    const buffers: Buffer[] = [];
    const errors: string[] = [];
    for (const chunk of chunks) {
      try {
        const buf = await generateOneChunk(zai, chunk, voice, speed);
        if (buf.length > 44) {
          buffers.push(buf);
        } else {
          errors.push(`chunk too small (${buf.length} bytes)`);
        }
      } catch (chunkErr) {
        const msg = chunkErr instanceof Error ? chunkErr.message : String(chunkErr);
        console.error('TTS chunk error:', chunkErr);
        errors.push(msg);
      }
    }

    if (buffers.length === 0) {
      // Distinguish auth errors (need real ZAI_API_KEY) from network errors
      const isAuthError = errors.some((e) => e.includes('401') || e.includes('Authentication'));
      const isFetchError = errors.some((e) => e.includes('fetch failed'));
      const hint = isAuthError
        ? 'The ZAI_API_KEY configured on Vercel is rejected by the public ZAI API. Set a valid ZAI_API_KEY for https://api.z.ai to enable voice-over. Voice-over still works in local dev where /etc/.z-ai-config is present.'
        : isFetchError
        ? 'Could not reach the ZAI TTS API from Vercel. Check ZAI_BASE_URL and network connectivity.'
        : 'All TTS chunks failed for unknown reasons.';
      return NextResponse.json(
        {
          error: 'TTS generation failed for all chunks',
          hint,
          details: errors.slice(0, 3),
          chunkCount: chunks.length,
          textPreview: text.slice(0, 80),
        },
        { status: 502 },
      );
    }

    const combined = buffers.length > 1 ? concatWav(buffers) : buffers[0];

    // Convert Buffer to a fresh ArrayBuffer for NextResponse (BodyInit accepts ArrayBuffer)
    const ab = combined.buffer.slice(combined.byteOffset, combined.byteOffset + combined.byteLength) as ArrayBuffer;

    return new NextResponse(ab, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('Tutor voice API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Voice generation failed', detail: message },
      { status: 500 },
    );
  }
}
