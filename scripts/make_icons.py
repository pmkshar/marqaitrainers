#!/usr/bin/env python3
"""Generate PWA icons (192px and 512px) with the MarqAI brand gradient + graduation cap."""
from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, out_path):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Diagonal gradient background (emerald -> teal)
    c1 = (16, 185, 129, 255)   # emerald-500
    c2 = (13, 148, 136, 255)   # teal-600
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(c1[0] * (1 - t) + c2[0] * t)
            g = int(c1[1] * (1 - t) + c2[1] * t)
            b = int(c1[2] * (1 - t) + c2[2] * t)
            img.putpixel((x, y), (r, g, b, 255))
    # Rounded corners (mask)
    mask = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(mask)
    radius = size // 6
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.putalpha(mask)
    # Draw a simple "M" letter (using default font)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(size * 0.6))
    except Exception:
        font = ImageFont.load_default()
    text = 'M'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1]
    # subtle shadow
    draw.text((tx + 2, ty + 2), text, font=font, fill=(0, 0, 0, 60))
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))
    img.save(out_path, 'PNG')
    print(f'Wrote {out_path} ({size}x{size})')

os.makedirs('/home/z/my-project/public', exist_ok=True)
make_icon(192, '/home/z/my-project/public/icon-192.png')
make_icon(512, '/home/z/my-project/public/icon-512.png')
