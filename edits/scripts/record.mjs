/*
  Films the site scrolling, frame by frame, for the device scenes.

  The page runs on a stand-in clock: requestAnimationFrame, timers,
  performance.now, Date.now and every CSS animation and transition move
  only when this script says a frame has passed. So each frame is a
  photograph of exactly 1/60 s later, however long the photograph took,
  and the smooth scrolling, the reveals and the scroll-driven sections
  all play as they do for a visitor, without a dropped frame.

  The script scrolls the page from section to section, holding on each.
  On the Mac it also moves the mouse, so the site's own cursor and hover
  states show, and clicks Copy on the email at the end.

  Out: public/rec/<device>-<locale>.mp4 and a .json beside it saying
  when the page reaches each section and when a finger swipes.

  Usage: node scripts/record.mjs [iphone|mac] [ar|en] [base url]
         (default: both devices, both languages, the local dev server)
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FFMPEG = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const FPS = 60;
const STEP = 1000 / FPS;

const devices = {
  // iPhone 15 Pro: 393 × 852 points, less the status bar and Safari's bar.
  iphone: { width: 393, height: 724, scale: 2, mobile: true },
  // MacBook Pro 14": 1512 × 982 points, less Safari's toolbar.
  mac: { width: 1512, height: 930, scale: 1, mobile: false },
};

/*
  The visit, in seconds: a hold on the hero, then each section in turn.
  `move` is how long the page takes to get there; `hold` how long it
  stays. On the Mac, `point` is what the mouse goes to while it holds.
*/
const visit = [
  { id: 'hero', hold: 1.3, point: '#main a[href="#contact"], #main a[href*="contact"]' },
  { id: 'work', move: 1.1, hold: 1.2, point: '#work a[href*="/work/"], #work li a' },
  { id: 'services', move: 1.1, hold: 1.2, point: '#services article, #services li' },
  { id: 'about', move: 1.1, hold: 1.1 },
  { id: 'contact', move: 1.2, hold: 2.0, point: '.direct__email', click: '.direct__copy' },
];

const [onlyDevice, onlyLocale, base = 'http://localhost:4321'] = process.argv.slice(2);

// The stand-in clock, put in place before any of the page's own code runs.
const clock = () => {
  let now = 0;
  const epoch = Date.now();
  let frames = new Map();
  let ids = 0;
  const timers = new Map();
  const started = new WeakMap();

  window.requestAnimationFrame = (cb) => (frames.set(++ids, cb), ids);
  window.cancelAnimationFrame = (id) => frames.delete(id);
  performance.now = () => now;
  Date.now = () => epoch + now;
  window.setTimeout = (fn, ms = 0, ...args) => (timers.set(++ids, { fn, at: now + Math.max(0, ms), args }), ids);
  window.setInterval = (fn, ms = 0, ...args) => (timers.set(++ids, { fn, at: now + ms, args, every: Math.max(1, ms) }), ids);
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);

  window.__advance = (ms) => {
    const until = now + ms;
    for (;;) {
      let next;
      for (const entry of timers) if (entry[1].at <= until && (!next || entry[1].at < next[1].at)) next = entry;
      if (!next) break;
      const [id, t] = next;
      now = Math.max(now, t.at);
      if (t.every) t.at += t.every;
      else timers.delete(id);
      try {
        typeof t.fn === 'function' ? t.fn(...t.args) : (0, eval)(t.fn);
      } catch (e) {
        console.error(e);
      }
    }
    now = until;
    const due = frames;
    frames = new Map();
    for (const cb of due.values()) {
      try {
        cb(now);
      } catch (e) {
        console.error(e);
      }
    }
    for (const a of document.getAnimations()) {
      if (!started.has(a)) {
        started.set(a, now - (Number(a.currentTime) || 0));
        a.pause();
      }
      a.currentTime = now - started.get(a);
    }
  };
};

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const encode = (dir, out) =>
  new Promise((resolve, reject) => {
    const ff = spawn(FFMPEG, [
      '-y', '-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'),
      // The sizes above are all even, as the encoder needs.
      '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p',
      out,
    ], { stdio: 'ignore' });
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });

async function record(browser, deviceName, locale) {
  const device = devices[deviceName];
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(clock);
  await page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.scale,
    isMobile: device.mobile,
    hasTouch: device.mobile,
  });
  const route = locale === 'ar' ? '/' : '/en/';
  await page.goto(base + route, { waitUntil: 'load' });
  await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });

  // Let the loader play out and the first screen settle, unrecorded.
  for (let i = 0; i < FPS * 5; i++) {
    await page.evaluate((ms) => window.__advance(ms), STEP);
    if (i % 10 === 0) await sleep(15);
  }
  await page.evaluate(() => document.fonts.ready);

  const offsets = await page.evaluate((ids) => {
    const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    return Object.fromEntries(
      ids.map((id) => {
        const el = document.getElementById(id);
        const top = id === 'hero' || !el ? 0 : el.getBoundingClientRect().top + scrollY - header * 0.4;
        return [id, Math.max(0, Math.min(max, Math.round(top)))];
      }),
    );
  }, visit.map((v) => v.id));

  // The plan, frame by frame.
  const plan = [];
  const stops = [];
  const swipes = [];
  let y = 0;
  for (const stop of visit) {
    if (stop.move) {
      const n = Math.round(stop.move * FPS);
      const from = y;
      swipes.push({ start: plan.length, end: plan.length + n });
      for (let i = 1; i <= n; i++) plan.push({ y: from + (offsets[stop.id] - from) * ease(i / n) });
      y = offsets[stop.id];
    }
    stops.push({ id: stop.id, frame: plan.length });
    const n = Math.round(stop.hold * FPS);
    for (let i = 0; i < n; i++) plan.push({ y, hold: stop, holdFrame: i, holdFrames: n });
  }

  const dir = path.resolve('out/rec', `${deviceName}-${locale}`);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  let mouse = { x: device.width * 0.62, y: device.height * 0.55 };
  let aim = null;
  for (const [i, step] of plan.entries()) {
    await page.evaluate((top) => window.scrollTo(0, top), step.y);

    if (!device.mobile && step.hold) {
      // On arriving, find what to point at, and glide there over 0.7 s.
      if (step.holdFrame === 0) {
        const target = step.hold.point
          ? await page.evaluate((sel) => {
              const el = [...document.querySelectorAll(sel)].find((e) => {
                const r = e.getBoundingClientRect();
                return r.width && r.top > 60 && r.bottom < innerHeight;
              });
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return { x: r.left + r.width * 0.45, y: r.top + r.height / 2 };
            }, step.hold.point)
          : null;
        aim = { from: { ...mouse }, to: target ?? { x: device.width * 0.55, y: device.height * 0.5 } };
      }
      const t = ease(Math.min(1, step.holdFrame / (FPS * 0.7)));
      mouse = { x: aim.from.x + (aim.to.x - aim.from.x) * t, y: aim.from.y + (aim.to.y - aim.from.y) * t };
      await page.mouse.move(mouse.x, mouse.y);

      // The last stop: over to Copy, and click it.
      if (step.hold.click && step.holdFrame === Math.round(FPS * 0.9)) {
        const copy = await page.evaluate((sel) => {
          const r = document.querySelector(sel)?.getBoundingClientRect();
          return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
        }, step.hold.click);
        if (copy) aim = { from: { ...mouse }, to: copy, clickAt: step.holdFrame + Math.round(FPS * 0.5) };
      }
      if (aim?.clickAt !== undefined && step.holdFrame >= Math.round(FPS * 0.9)) {
        const t2 = ease(Math.min(1, (step.holdFrame - Math.round(FPS * 0.9)) / (FPS * 0.5)));
        mouse = { x: aim.from.x + (aim.to.x - aim.from.x) * t2, y: aim.from.y + (aim.to.y - aim.from.y) * t2 };
        await page.mouse.move(mouse.x, mouse.y);
        if (step.holdFrame === aim.clickAt) await page.mouse.click(mouse.x, mouse.y);
      }
    } else if (!device.mobile) {
      await page.mouse.move(mouse.x, mouse.y);
    }
    step.mouse = device.mobile ? undefined : { ...mouse };

    await page.evaluate((ms) => window.__advance(ms), STEP);
    await page.screenshot({
      path: path.join(dir, `${String(i).padStart(5, '0')}.jpg`),
      type: 'jpeg',
      quality: 92,
      captureBeyondViewport: false,
    });
    if (i % 60 === 0) process.stdout.write(`${deviceName}-${locale} ${i}/${plan.length}\r`);
  }
  await page.close();

  await fs.mkdir('public/rec', { recursive: true });
  const name = `${deviceName}-${locale}`;
  await encode(dir, path.resolve('public/rec', `${name}.mp4`));
  await fs.rm(dir, { recursive: true, force: true });
  const clicks = plan.flatMap((s, i) => (s.hold?.click && s.holdFrame === aim?.clickAt ? [i] : []));
  await fs.writeFile(
    path.join('public/rec', `${name}.json`),
    JSON.stringify({ fps: FPS, frames: plan.length, width: device.width, height: device.height, stops, swipes, clicks }, null, 2),
  );
  console.log(`${name}: ${plan.length} frames`, stops.map((s) => `${s.id}@${s.frame}`).join(' '));
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const context = browser.defaultBrowserContext();
await context.overridePermissions(base, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
for (const deviceName of onlyDevice ? [onlyDevice] : Object.keys(devices)) {
  for (const locale of onlyLocale ? [onlyLocale] : ['ar', 'en']) {
    await record(browser, deviceName, locale);
  }
}
await browser.close();
