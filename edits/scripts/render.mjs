/*
  Renders every version of the promo (or the ones named) to out/.

  Usage: node scripts/render.mjs [composition ...]   e.g. IphoneAr MacEn
*/

import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const all = ['PhoneAr', 'PhoneEn', 'IphoneAr', 'IphoneEn', 'MacAr', 'MacEn', 'MacReelAr', 'MacReelEn'];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const names = { Phone: 'phone', Iphone: 'iphone', Mac: 'mac', MacReel: 'mac-reel' };

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id });
  const [, device, locale] = id.match(/^(Phone|Iphone|MacReel|Mac)(Ar|En)$/);
  const outputLocation = path.resolve('out', `promo-${names[device]}-${locale.toLowerCase()}.mp4`);
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: 'h264',
    crf: 16,
    outputLocation,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) process.stdout.write(`${id} ${(last = pct)}%\n`);
    },
  });
  console.log(outputLocation);
}
