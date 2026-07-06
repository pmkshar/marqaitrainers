// Quick local test of ZAI TTS
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function test() {
  try {
    console.log('Creating ZAI instance...');
    const zai = await ZAI.create();
    console.log('ZAI created.');

    console.log('Calling TTS...');
    const response = await zai.audio.tts.create({
      input: 'Hello, I am Professor Maya. Welcome to the AI and Machine Learning course.',
      voice: 'tongtong',
      speed: 1.0,
      response_format: 'wav',
      stream: false,
    });

    console.log('Response type:', typeof response);
    console.log('Response ok:', response?.ok);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    console.log('Buffer size:', buffer.length, 'bytes');

    fs.writeFileSync('/tmp/test-tts.wav', buffer);
    console.log('Saved to /tmp/test-tts.wav');
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
