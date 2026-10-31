/*
  A contact sheet: renders the given frames of a composition and lays them
  side by side in one image, to check a draft without watching it.

  Usage: node scripts/sheet.mjs <composition> <frame,frame,...> [out.png]
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import puppeteer from 'puppeteer-core';

const [id, list, out = `out/check/${process.argv[2]}.png`] = process.argv.slice(2);
const frames = list.split(',').map(Number);
const dir = path.resolve('out/check/frames');
await fs.mkdir(dir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
const files = [];
for (const frame of frames) {
  const output = path.join(dir, `${id}-${frame}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale: 0.35 });
  files.push(output);
}

const wide = composition.width > composition.height;
const cols = wide ? 3 : Math.min(frames.length, 5);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
const cells = await Promise.all(
  files.map(async (f, i) => {
    const data = (await fs.readFile(f)).toString('base64');
    return `<figure><img src="data:image/png;base64,${data}"><figcaption>${frames[i]}</figcaption></figure>`;
  }),
);
await page.setContent(`<style>
  body{margin:0;background:#888;font:14px monospace;display:grid;grid-template-columns:repeat(${cols},auto);gap:6px;padding:6px;width:max-content}
  figure{margin:0} img{display:block} figcaption{color:#fff}
</style>${cells.join('')}`);
await page.setViewport({ width: 400, height: 300 });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out);
