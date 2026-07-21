const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'marqai-logo.svg');
const publicDir = path.join(__dirname, '..', 'public');

const svgBuffer = fs.readFileSync(svgPath);

// Generate PNG icons at various sizes
const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }
  console.log('All icons generated!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
