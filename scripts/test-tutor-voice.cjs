// Local dev test for the tutor-voice API endpoint.
const { spawn } = require('child_process');
const fs = require('fs');

function main() {
  console.log('Starting Next.js dev server...');
  const dev = spawn('npx', ['next', 'dev', '-p', '4317'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server did not start in 90s')), 90000);
    dev.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      process.stdout.write('[dev] ' + text);
      if (text.includes('Ready') || text.includes('Local:')) {
        clearTimeout(timer);
        setTimeout(() => resolve(), 4000);
      }
    });
    dev.stderr.on('data', (chunk) => process.stderr.write('[dev-err] ' + chunk.toString()));
  });

  ready.then(async () => {
    console.log('\n--- Calling /api/tutor-voice ---');
    const text = 'Hello, I am Professor Maya. Welcome to the AI and Machine Learning course. In this slide, we will learn about gradient descent.';
    const res = await fetch('http://localhost:4317/api/tutor-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'tongtong', speed: 1.0 }),
    });
    console.log('Status:', res.status, res.statusText);
    console.log('Content-Type:', res.headers.get('content-type'));

    if (!res.ok) {
      const errText = await res.text();
      console.log('Error body:', errText);
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('Audio size:', buf.length, 'bytes');
      const magic = buf.subarray(0, 4).toString('ascii');
      console.log('WAV magic:', magic);
      fs.writeFileSync('/tmp/api-test.wav', buf);
      console.log('Saved to /tmp/api-test.wav');
    }

    dev.kill('SIGTERM');
    setTimeout(() => process.exit(0), 1000);
  }).catch((err) => {
    console.error('Test failed:', err);
    dev.kill('SIGTERM');
    process.exit(1);
  });
}

main();
