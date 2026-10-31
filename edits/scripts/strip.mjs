/*
  A strip of still frames from a folder of numbered JPEGs, in one image,
  to check a recording before it is encoded.

  Usage: node scripts/strip.mjs <folder> <frame,frame,...> <out.png>
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [dir, list, out] = process.argv.slice(2);
const cells = await Promise.all(
  list.split(',').map(async (n) => {
    const data = (await fs.readFile(path.join(dir, `${n.padStart(5, '0')}.jpg`))).toString('base64');
    return `<figure><img src="data:image/jpeg;base64,${data}"><figcaption>${n}</figcaption></figure>`;
  }),
);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: 400, height: 300 });
await page.setContent(`<style>
  body{margin:0;background:#888;font:14px monospace;display:flex;flex-wrap:wrap;gap:4px;padding:4px;width:2100px}
  figure{margin:0} img{display:block;width:${process.env.W ?? 200}px} figcaption{color:#fff}
</style>${cells.join('')}`);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
