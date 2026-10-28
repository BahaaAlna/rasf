/*
  Turning an uploaded image into the site's two icons, in the browser:
  a 64px one for tabs, on nothing, and a 180px one for home screens, on
  the paper colour, since phones fill any transparency with black. Both
  are PNG data, small enough to keep in the section's document.
*/

export interface SiteIcon {
  tab: string;
  touch: string;
}

const PAPER = '#f5f2eb';

function load(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file isn’t an image the browser can read.'));
    img.src = url;
  });
}

/** The whole image, fitted inside a square of `size`, `inset` of it left as margin. */
function draw(img: HTMLImageElement, size: number, inset: number, background?: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }
  const room = size * (1 - inset * 2);
  // SVGs without a size report 0; treat them as square.
  const w = img.naturalWidth || 1;
  const h = img.naturalHeight || 1;
  const scale = room / Math.max(w, h);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (size - w * scale) / 2, (size - h * scale) / 2, w * scale, h * scale);
  return canvas.toDataURL('image/png');
}

export async function makeIcon(file: File): Promise<SiteIcon> {
  const img = await load(file);
  return { tab: draw(img, 64, 0), touch: draw(img, 180, 0.14, PAPER) };
}
