import { Color } from 'three';

const PALETTE_SIZE = 6;

/**
 * The cover's palette: its most common colours (12-bit buckets, saturated ones weighted up), distinct
 * from each other, most prominent first, pushed to full saturation like 16-colour palette entries.
 * Cached per cover URL.
 */
const cache = new Map<string, Promise<Color[]>>();

export function coverPalette(url: string): Promise<Color[]> {
  let p = cache.get(url);
  if (!p) cache.set(url, (p = loadPalette(url)));
  return p;
}

function loadPalette(url: string): Promise<Color[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 48;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve([]);
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      const buckets = new Map<number, { score: number; color: Color }>();
      const hsl = { h: 0, s: 0, l: 0 };
      for (let i = 0; i < data.length; i += 4) {
        const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
        const color = new Color(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
        color.getHSL(hsl);
        // greys, paper white and ink black say little about the cover: only its colours count
        if (hsl.s < 0.3 || hsl.l < 0.12 || hsl.l > 0.88) continue;
        const weight = hsl.s * (1 - Math.abs(hsl.l - 0.5) * 2);
        const b = buckets.get(key);
        if (b) b.score += weight;
        else buckets.set(key, { score: weight, color });
      }
      const picked: Color[] = [];
      for (const { color } of [...buckets.values()].sort((a, b) => b.score - a.score)) {
        if (picked.every((c) => Math.abs(c.r - color.r) + Math.abs(c.g - color.g) + Math.abs(c.b - color.b) > 0.45)) picked.push(color);
        if (picked.length === PALETTE_SIZE) break;
      }
      // lit lines on a dark landscape: full saturation, mid-bright, like a 16-colour palette entry
      for (const c of picked) {
        c.getHSL(hsl);
        c.setHSL(hsl.h, Math.max(hsl.s, 0.75), Math.min(Math.max(hsl.l, 0.5), 0.65));
      }
      resolve(picked);
    };
    img.onerror = () => resolve([]);
    img.src = url;
  });
}
