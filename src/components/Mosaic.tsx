import { useEffect, useRef, useState } from 'react';
import { LOGO_DOT } from '../data/logoDot';
import type { OriginContent } from '../data/origin';
import styles from './Mosaic.module.css';

interface Props {
  /** The logotype. Its pixels ARE the layout. */
  src: string;
  locale: 'ar' | 'en';
  copy: OriginContent;
}

/*
  Stone rows down the word, not columns across it — the columns are
  derived from the logotype's own proportions.

  A fixed column count gives the two languages very different detail:
  the Arabic mark is about 4:1, so 104 columns left it only 26 rows
  tall, and the 13 of them above the dot could not render a legible
  question mark — 22 stones for the whole hook. Fixing the ROWS instead
  gives both wordmarks the same vertical resolution.
*/
const ROWS = 42;
/** Share of the scroll spent staggering the laying order. */
const SPREAD = 0.5;
/**
 * Share of the pin by which the last stone has landed.
 *
 * The section is pinned for exactly as long as it takes to lay the word
 * and no longer: no dead scroll in front of the first stone, only a
 * short hold behind the last.
 */
const SETTLED = 0.8;
/**
 * Share of the stage's exit spent lifting the stones again.
 *
 * Under 1 so the word is back off the page while there is still some of
 * the stage left to see, rather than only finishing once it is out of
 * frame anyway.
 */
const UNDO = 0.7;
/** How hard the scrubbed scroll progress is smoothed. */
const SCROLL_EASE = 0.14;
/** How hard each stone chases its target. Lower drifts more. */
const TILE_EASE = 0.12;
/** How solid a stone is the moment it crosses the edge. */
const RESTING = 0.55;
/** Pointer reach, as a share of the canvas width. */
const REACH = 0.17;
/** Peak shove at the centre of the pointer, in stone widths. */
const SHOVE = 2.6;
/** Share of the screen width the word takes, corner to corner. */
const WORD = 0.86;
/** The tallest the word may be, as a share of the screen. */
const WORD_H = 0.34;
/** Where the word's middle sits — high, to clear the columns below. */
const WORD_Y = 0.42;
/** Laid-ness past which the lead line and the columns are let in. */
const REVEAL = 0.86;

interface Stone {
  hx: number;
  hy: number;
  sx: number;
  sy: number;
  cx: number;
  cy: number;
  turn: number;
  alpha: number;
  colour: string;
  /** 0, 1 or 2 — which column owns it. */
  group: number;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function noise(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A resting place beyond one of the four edges, so it flies in.
 *
 * Off the stage entirely, which is what makes the arrival an arrival: a
 * stone is not on the page at all until it has crossed an edge, and the
 * stage's clip does the rest. Resting them across the screen instead
 * and raising their opacity was tried, and is a different thing — dust
 * that was always lying there, coming up out of the paper. These come
 * in from outside.
 */
function launch(seed: number, width: number, height: number) {
  const side = Math.floor(noise(seed + 13) * 4) % 4;
  const along = noise(seed + 29);
  const out = 0.12 + noise(seed + 53) * 0.55;
  if (side === 0) return { sx: -out * width, sy: along * height };
  if (side === 1) return { sx: width + out * width, sy: along * height };
  if (side === 2) return { sx: along * width, sy: -out * height };
  return { sx: along * width, sy: height + out * height };
}

interface Scanned {
  data: Uint8ClampedArray;
  w: number;
  top: number;
  dotTop: number;
  dotLeft: number;
  dotRight: number;
  bottom: number;
}

/**
 * The hook of a question mark, in grid cells, ready to be laid above a
 * dot that already exists.
 *
 * A question mark is a hook over a dot, and the logotype already ends in
 * one — so the glyph is rendered, split at the empty row above its own
 * dot, and only the top half is kept. Nothing about the wordmark moves.
 *
 * Scaled by the HEIGHT it has to fill, not by matching the glyph's own
 * dot to the real one. That reading is tempting and wrong: the dot in
 * this logotype is a brand mark, drawn at 26% of the cap height where
 * punctuation would sit near 18%, so sizing the hook from it produced a
 * question mark 44 rows tall over a wordmark of 35 — half again taller
 * than the name it belongs to.
 *
 * Cells come back as offsets from the hook's bottom centre, so the
 * caller can hang it directly above the dot already on the page.
 */
function hookCells(mark: string, font: string, hookCellsTall: number) {
  const pad = 40;
  const probe = document.createElement('canvas');

  const scan = (size: number): Scanned | null => {
    probe.width = Math.ceil(size * 1.6 + pad * 2);
    probe.height = Math.ceil(size * 2 + pad * 2);
    const c = probe.getContext('2d', { willReadFrequently: true });
    if (!c) return null;

    c.clearRect(0, 0, probe.width, probe.height);
    c.font = size + 'px ' + font;
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#000';
    c.fillText(mark, pad, probe.height - pad);

    const { data } = c.getImageData(0, 0, probe.width, probe.height);
    const rowHas: boolean[] = [];
    let top = -1;
    let bottom = -1;

    for (let y = 0; y < probe.height; y++) {
      let any = false;
      for (let x = 0; x < probe.width; x++) {
        if (data[(y * probe.width + x) * 4 + 3] > 128) {
          any = true;
          break;
        }
      }
      rowHas[y] = any;
      if (any) {
        if (top < 0) top = y;
        bottom = y;
      }
    }
    if (top < 0) return null;

    // Walk up from the bottom to the gap: below it is the glyph's dot.
    let dotTop = bottom;
    while (dotTop > top && rowHas[dotTop - 1]) dotTop--;
    // No separate dot means this is not a question-mark shape.
    if (dotTop <= top) return null;

    let dotLeft = probe.width;
    let dotRight = -1;
    for (let y = dotTop; y <= bottom; y++) {
      for (let x = 0; x < probe.width; x++) {
        if (data[(y * probe.width + x) * 4 + 3] > 128) {
          if (x < dotLeft) dotLeft = x;
          if (x > dotRight) dotRight = x;
        }
      }
    }
    return { data, w: probe.width, top, dotTop, dotLeft, dotRight, bottom };
  };

  // One pass to measure the hook, a second at the size that makes it
  // exactly as tall as the room above the dot.
  const first = scan(240);
  if (!first) return [];
  const tall = first.dotTop - first.top;
  if (tall < 1) return [];
  const sized = scan(Math.max(18, (240 * hookCellsTall) / tall));
  if (!sized) return [];

  /*
    Horizontally the hook is pinned to the glyph's OWN dot, not to the
    middle of the hook's box. In no typeface does a question mark sit
    squarely over its point: Bricolage puts the hook 6.5px to the right
    of it, Lateef puts it 6px to the left. Centring the box throws that
    away and bends the mark the wrong way — in opposite directions in
    the two languages, which is exactly how it looked wrong in both.

    Vertically it hangs from its own bottom edge, because the dot it has
    to clear on the page is this brand's oversized one, not the glyph's.
  */
  const dotCx = (sized.dotLeft + sized.dotRight) / 2;
  const hookBottom = sized.dotTop - 1;

  const cells: { dc: number; dr: number }[] = [];
  const seen = new Set<string>();
  for (let y = sized.top; y < sized.dotTop; y++) {
    for (let x = 0; x < sized.w; x++) {
      if (sized.data[(y * sized.w + x) * 4 + 3] <= 128) continue;
      const dc = Math.round(x - dotCx);
      const dr = Math.round(y - hookBottom);
      const key = dc + ',' + dr;
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push({ dc, dr });
    }
  }
  return cells;
}

/**
 * Purely decorative paving, plus the copy that answers the question the
 * paving asks. Mount with `client:visible`.
 */
export default function Mosaic({ src, locale, copy }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);
  /** Where each third's card hangs, in canvas pixels. Set on measure. */
  const anchors = useRef<{ x: number[]; y: number; box: number[] } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [zone, setZone] = useState<number | null>(null);

  useEffect(() => {
    const host = section.current;
    const cv = canvas.current;
    if (!host || !cv) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const still = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    const rtl = document.documentElement.dir === 'rtl';
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

    let stones: Stone[] = [];
    let stone = 0;
    let frame = 0;
    let live = false;
    let progress = 0;
    let focus = 0;
    let shown = false;
    const pointer = { x: -1e4, y: -1e4, on: false };

    const image = new Image();
    image.crossOrigin = 'anonymous';

    const sample = () => {
      const rows = ROWS;
      const cols = Math.max(60, Math.round((rows * image.naturalWidth) / image.naturalHeight));

      const probe = document.createElement('canvas');
      probe.width = cols;
      probe.height = rows;
      const pctx = probe.getContext('2d', { willReadFrequently: true });
      if (!pctx) return false;
      pctx.drawImage(image, 0, 0, cols, rows);
      const { data } = pctx.getImageData(0, 0, cols, rows);

      const width = cv.clientWidth;
      const height = cv.clientHeight;
      if (!width || !height) return false;

      stone = Math.min((width * WORD) / cols, (height * WORD_H) / rows);
      const wordH = stone * rows;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const originX = (width - stone * cols) / 2;
      const originY = height * WORD_Y - wordH / 2;

      // Each third's card hangs under the middle of that third. The
      // order is reversed under RTL for the same reason the stone
      // groups are: the first third is the one its reader meets first.
      const wordW = stone * cols;
      const thirds = [0, 1, 2].map((i) => originX + wordW * ((i + 0.5) / 3));
      anchors.current = {
        x: rtl ? thirds.slice().reverse() : thirds,
        y: originY + wordH + stone * 2.5,
        box: [originX, originY, originX + wordW, originY + wordH],
      };

      const place = (col: number, row: number, seed: number, colour: string): Stone => {
        // Thirds of the word, mirrored under RTL so the first column
        // owns the side its reader starts from.
        const third = Math.min(2, Math.floor((col / cols) * 3));
        return {
          hx: originX + col * stone,
          hy: originY + row * stone,
          ...launch(seed, width, height),
          cx: 0,
          cy: 0,
          turn: clamp01(col / (cols - 1)),
          alpha: RESTING,
          colour,
          group: rtl ? 2 - third : third,
        };
      };

      const next: Stone[] = [];
      const tally = new Map<string, number>();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 4;
          if (data[i + 3] < 128) continue;
          const colour = 'rgb(' + data[i] + ' ' + data[i + 1] + ' ' + data[i + 2] + ')';
          tally.set(colour, (tally.get(colour) ?? 0) + 1);
          next.push(place(col, row, row * cols + col, colour));
        }
      }

      // The ink the wordmark is actually drawn in, for the added hook.
      let ink = '#18181c';
      let best = 0;
      tally.forEach((n, colour) => {
        if (n > best) {
          best = n;
          ink = colour;
        }
      });

      // The hook of the question mark, laid over the dot already there.
      const spot = LOGO_DOT[locale];
      const mark = locale === 'ar' ? '؟' : '?';
      const font = getComputedStyle(document.body).fontFamily;
      const dotCol = spot.cx * cols;
      const dotRow = spot.cy * rows;
      // The hook hangs from just above the dot up to the top of the
      // wordmark, so it reads at the same height as the letters.
      const foot = dotRow - (spot.d * cols) / 2 - 1;
      const hook = hookCells(mark, font, Math.max(4, foot));
      for (const cell of hook) {
        next.push(place(dotCol + cell.dc, foot + cell.dr, 7919 + cell.dc * 31 + cell.dr, ink));
      }

      /*
        Seeded at the laid-ness the scroll has already reached, not at
        the scatter. A resize re-measures everything, and every phone
        fires one on nearly every scroll as the URL bar slides: seeding
        from the scatter blew the finished word apart and re-laid it
        each time.
      */
      stones = next;
      for (const s of stones) {
        const laid = still ? 1 : easeOut(clamp01((progress - s.turn * SPREAD) / (1 - SPREAD)));
        s.cx = s.sx + (s.hx - s.sx) * laid;
        s.cy = s.sy + (s.hy - s.sy) * laid;
        s.alpha = RESTING + (1 - RESTING) * laid;
      }
      return true;
    };

    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const size = stone * 0.88;
      const group = active.current;
      for (const s of stones) {
        const lit = group !== null && s.group === group;
        ctx.globalAlpha = lit ? s.alpha : s.alpha * (1 - 0.68 * focus);
        ctx.fillStyle = lit && focus > 0.02 ? accent : s.colour;
        ctx.fillRect(s.cx, s.cy, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      const rect = host.getBoundingClientRect();
      const pin = rect.height - window.innerHeight;
      const past = -rect.top;

      /*
        Two stretches of scroll, not one.

        The pin lays the word. Once the pin is spent the stage comes
        unstuck and rides up out of frame with the page — and it is that
        ride, not a second pin, which lifts the stones again. So the
        reader is never held in place to watch the word come apart: they
        are going down the page the whole time, the name is travelling
        up and away as they go, and it is taking itself up on the way.
      */

      const lay = pin > 0 ? clamp01(past / (pin * SETTLED)) : 1;
      const exit = pin > 0 ? clamp01((past - pin) / (window.innerHeight * UNDO)) : 0;
      const raw = lay * (1 - exit);
      progress += (raw - progress) * SCROLL_EASE;

      focus += ((active.current === null ? 0 : 1) - focus) * 0.16;

      const reach = cv.clientWidth * REACH;
      const shove = stone * SHOVE;

      for (const s of stones) {
        const laid = easeOut(clamp01((progress - s.turn * SPREAD) / (1 - SPREAD)));
        let tx = s.sx + (s.hx - s.sx) * laid;
        let ty = s.sy + (s.hy - s.sy) * laid;

        if (pointer.on && laid > 0.6) {
          const dx = tx - pointer.x;
          const dy = ty - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < reach && dist > 0.001) {
            const force = (1 - dist / reach) ** 2 * shove * laid;
            tx += (dx / dist) * force;
            ty += (dy / dist) * force;
          }
        }

        s.cx += (tx - s.cx) * TILE_EASE;
        s.cy += (ty - s.cy) * TILE_EASE;
        const want = RESTING + (1 - RESTING) * laid;
        s.alpha += (want - s.alpha) * (TILE_EASE * 0.8);
      }

      // The question only makes sense once the name can be read.
      const due = progress > REVEAL;
      if (due !== shown) {
        shown = due;
        setRevealed(due);
      }

      draw();
      frame = live ? requestAnimationFrame(step) : 0;
    };

    let lastZone: number | null = null;

    const onPointer = (event: PointerEvent) => {
      const box = cv.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.on =
        window.matchMedia('(hover: hover)').matches &&
        pointer.x > -80 &&
        pointer.y > -80 &&
        pointer.x < box.width + 80 &&
        pointer.y < box.height + 80;

      // Which third of the paved word the pointer is over, if any. The
      // band is taller than the letters: asking someone to stay inside
      // a 30px strip to keep a card open would be a chore.
      const a = anchors.current;
      let next: number | null = null;
      if (a && pointer.on && shown) {
        const [x0, y0, x1, y1] = a.box;
        const slack = (y1 - y0) * 0.4;
        const inside =
          pointer.x >= x0 && pointer.x <= x1 && pointer.y >= y0 - slack && pointer.y <= y1 + slack;
        if (inside) {
          const third = Math.min(2, Math.max(0, Math.floor(((pointer.x - x0) / (x1 - x0)) * 3)));
          next = rtl ? 2 - third : third;
        }
      }

      if (next === lastZone) return;
      lastZone = next;
      active.current = next;
      setZone(next);

      if (next !== null && a && card.current) {
        // Kept clear of the edges, or a card on an outer third would
        // hang half off the screen.
        const half = card.current.offsetWidth / 2;
        const x = Math.min(Math.max(a.x[next], half + 12), cv.clientWidth - half - 12);
        card.current.style.transform =
          'translate(' + x.toFixed(1) + 'px, ' + a.y.toFixed(1) + 'px) translateX(-50%)';
      }
    };

    const onResize = () => {
      if (sample()) draw();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        live = entry.isIntersecting && !still;
        if (live && !frame) frame = requestAnimationFrame(step);
        // The canvas is fixed to the viewport, so its last frame does
        // not leave with the section: stopping the loop without this
        // left a still field of stones lying over every section below.
        if (!live) ctx.clearRect(0, 0, cv.width, cv.height);
      },
      // Enough either side to cover the fade above, and no more — the
      // field has nothing to say while the section is off screen.
      { rootMargin: '50% 0px' },
    );

    const start = () => {
      if (!sample()) return;
      draw();
      io.observe(host);
      if (still) {
        setRevealed(true);
        return;
      }
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('resize', onResize);
    };

    // The hook is drawn with the page's own display face, so it has to
    // be the real one by then — a fallback would give the wrong shape.
    image.onload = () => {
      if (document.fonts?.ready) document.fonts.ready.then(start).catch(start);
      else start();
    };

    // Nothing to pave; the runway would otherwise stand as empty page.
    image.onerror = () => {
      host.style.display = 'none';
    };

    image.src = src;

    return () => {
      io.disconnect();
      live = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
    };
  }, [src, locale]);

  const veil = styles.veiled + (revealed ? ' ' + styles.shown : '');

  return (
    <section ref={section} className={styles.section} aria-labelledby="origin-q">
      <div className={styles.stage}>
        {/* Inside the stage, and clipped by it, so a stone that has not
            crossed an edge yet is simply not on the page. */}
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />

        {/* The paved wordmark carries the rest of the question, but it
            is a picture — the readable form of the line lives here. */}
        <p id="origin-q" className={styles.lead + ' ' + veil}>
          {copy.lead} {locale === 'ar' ? 'رصف؟' : 'Rasf?'}
        </p>

        {/*
          The visual card. Hidden from assistive tech on purpose: it is
          an echo of the list below, which is always in the document.
          Width is fixed in CSS, so its edge-clamping stays correct no
          matter which of the three it is showing.
        */}
        <div
          ref={card}
          className={styles.card + (zone === null ? '' : ' ' + styles.cardOut)}
          aria-hidden="true"
        >
          <span className={styles.n}>{copy.columns[zone ?? 0].n}</span>
          <strong className={styles.title}>{copy.columns[zone ?? 0].title}</strong>
          <p className={styles.body}>{copy.columns[zone ?? 0].body}</p>
        </div>

        <p className={styles.hint + ' ' + veil} aria-hidden="true">
          {copy.hint}
        </p>

        {/*
          The same three answers, always present and always readable.
          The cards open on hover alone, which is no use to a keyboard,
          a screen reader or a phone — the words must not live only
          inside an interaction.
        */}
        <dl className={styles.plain}>
          {copy.columns.map((column) => (
            <div key={column.n}>
              <dt>{column.title}</dt>
              <dd>{column.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
