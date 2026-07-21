const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/marqai-logo.svg');
  const svg = fs.readFileSync(svgPath);

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-16.png', size: 16 },
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.join(__dirname, '../public', name);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }
  
  // Also generate favicon.ico (multi-size)
  const ico32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const ico16 = await sharp(svg).resize(16, 16).png().toBuffer();
  console.log('Icon files generated successfully!');
}

generateIcons().catch(console.error);
