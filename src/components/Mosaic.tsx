import { useEffect, useRef, useState } from 'react';
import { LOGO_DOT } from '../data/logoDot';
import { LETTER_SHADES, LOGO_LETTERS, SPECKLE } from '../data/logoLetters';
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
  tall. Fixing the ROWS instead gives both wordmarks the same vertical
  resolution.
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
/** How hard the open card is pulled toward the pointer. Lower floats more. */
const FLOAT_PULL = 0.018;
/** Velocity kept each frame. Closer to 1 overshoots and drifts longer. */
const FLOAT_DRAG = 0.9;
/** Gap between the pointer and the top of the card hanging under it. */
const FLOAT_GAP = 36;
/** How far above the letters the card stays open, as a share of their height. */
const ZONE_ABOVE = 0.3;

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
  /** 0, 1 or 2 — which card owns it. Null for the logo's dot. */
  group: number | null;
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

/**
 * Purely decorative paving, plus the copy that answers the question the
 * paving asks. Mount with `client:visible`.
 */
export default function Mosaic({ src, locale, copy }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);
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

    let stones: Stone[] = [];
    /** The laid word's bounds, in canvas pixels. Set on measure. */
    let wordBox: number[] | null = null;
    /** The open card: where it is, and how fast it is drifting. */
    const drift = { x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0 };
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

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // A wordmark with mapped letters gives each its own grey and its
      // own card; one without is split into thirds, mirrored under RTL
      // so the first third owns the side its reader starts from.
      const letterOf = LOGO_LETTERS[locale];
      const thirdOf = (col: number) => {
        const third = Math.max(0, Math.min(2, Math.floor((col / cols) * 3)));
        return rtl ? 2 - third : third;
      };

      interface Cell {
        col: number;
        row: number;
        seed: number;
        colour: string;
        group: number | null;
      }
      const cells: Cell[] = [];
      const spot = LOGO_DOT[locale];
      // The brand dot, in cells, with one to spare for its soft edge.
      const dotReach = (spot.d * cols) / 2 + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 4;
          if (data[i + 3] < 128) continue;
          let colour = 'rgb(' + data[i] + ' ' + data[i + 1] + ' ' + data[i + 2] + ')';
          let group: number | null = thirdOf(col);
          if (letterOf) {
            // The dot belongs to no letter: it keeps the brand's colour
            // and opens no card.
            const onDot =
              Math.hypot(col + 0.5 - spot.cx * cols, row + 0.5 - spot.cy * rows) <= dotReach;
            group = onDot ? null : letterOf((col + 0.5) / cols, (row + 0.5) / rows);
            // The word stays black; a seeded scatter of each letter's
            // stones is laid in its own grey, the same ones every time.
            if (group !== null && noise(row * cols + col + 101) < SPECKLE) {
              colour = LETTER_SHADES[group];
            }
          }
          cells.push({ col, row, seed: row * cols + col, colour, group });
        }
      }

      stone = Math.min((width * WORD) / cols, (height * WORD_H) / rows);
      const wordW = stone * cols;
      const wordH = stone * rows;
      const originX = (width - wordW) / 2;
      const originY = height * WORD_Y - wordH / 2;
      wordBox = [originX, originY, originX + wordW, originY + wordH];

      const next: Stone[] = cells.map(({ col, row, seed, colour, group }) => ({
        hx: originX + col * stone,
        hy: originY + row * stone,
        ...launch(seed, width, height),
        cx: 0,
        cy: 0,
        turn: clamp01(col / (cols - 1)),
        alpha: RESTING,
        colour,
        group,
      }));

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
        // The letter keeps its own grey; it stands out because the rest
        // of the word steps back, not because it changes colour.
        ctx.globalAlpha = lit ? s.alpha : s.alpha * (1 - 0.68 * focus);
        ctx.fillStyle = s.colour;
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

      if (active.current !== null) float();

      draw();
      frame = live ? requestAnimationFrame(step) : 0;
    };

    /** Where the card wants to be: hanging just under the pointer. */
    const aim = () => {
      const x = pointer.x - drift.w / 2;
      const y = pointer.y + FLOAT_GAP;
      return {
        x: Math.min(Math.max(x, 12), cv.clientWidth - drift.w - 12),
        y: Math.min(Math.max(y, 12), cv.clientHeight - drift.h - 12),
      };
    };

    /*
      The card follows the pointer as if nothing were holding it down: a
      soft spring that overshoots and settles, a slow bob that never
      quite stops, and a tilt into the direction it is being pulled.
    */
    const float = () => {
      const el = card.current;
      if (!el) return;
      const target = aim();
      drift.vx = (drift.vx + (target.x - drift.x) * FLOAT_PULL) * FLOAT_DRAG;
      drift.vy = (drift.vy + (target.y - drift.y) * FLOAT_PULL) * FLOAT_DRAG;
      drift.x += drift.vx;
      drift.y += drift.vy;

      const t = performance.now() / 1000;
      const bobX = Math.sin(t * 0.9) * 5;
      const bobY = Math.sin(t * 1.3 + 1) * 7;
      const tilt = Math.max(-7, Math.min(7, drift.vx * 0.4)) + Math.sin(t * 0.7) * 1.2;
      el.style.transform =
        'translate(' +
        (drift.x + bobX).toFixed(1) +
        'px, ' +
        (drift.y + bobY).toFixed(1) +
        'px) rotate(' +
        tilt.toFixed(2) +
        'deg)';
    };

    /** The letter whose stones lie nearest the pointer. */
    const groupAt = (x: number, y: number) => {
      let best = Infinity;
      let found: number | null = null;
      // Home positions, not live ones: the stones shy away from the
      // pointer, and chasing them would make the card flicker.
      for (const s of stones) {
        if (s.group === null) continue;
        const d = Math.hypot(s.hx + stone / 2 - x, s.hy + stone / 2 - y);
        if (d < best) {
          best = d;
          found = s.group;
        }
      }
      return found;
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

      // Anywhere inside the name's box keeps a card open, the paper
      // between and inside the letters included, and it belongs to the
      // nearest letter. The box reaches a little above the letters, so
      // the space over ف's dot still counts. Leaving it — further up,
      // below or past either end — puts the card away.
      let next: number | null = null;
      if (wordBox && pointer.on && shown) {
        const [x0, y0, x1, y1] = wordBox;
        const top = y0 - (y1 - y0) * ZONE_ABOVE;
        if (pointer.x >= x0 && pointer.x <= x1 && pointer.y >= top && pointer.y <= y1) {
          next = groupAt(pointer.x, pointer.y);
        }
      }

      if (next === lastZone) return;
      const opening = lastZone === null;
      lastZone = next;
      active.current = next;
      setZone(next);

      // A card that has just opened starts where it is going, rather
      // than sailing in from wherever the last one was let go.
      if (next !== null && opening && card.current) {
        drift.w = card.current.offsetWidth;
        drift.h = card.current.offsetHeight;
        const start = aim();
        drift.x = start.x;
        drift.y = start.y;
        drift.vx = 0;
        drift.vy = 0;
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

    image.onload = start;

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

        {/* The paved wordmark is a picture; the question is asked here,
            in words, in full. */}
        <p id="origin-q" className={styles.lead + ' ' + veil}>
          {copy.lead} {locale === 'ar' ? 'رصف؟' : 'Rasf?'}
        </p>

        {/*
          The visual card. Hidden from assistive tech on purpose: it is
          an echo of the list below, which is always in the document.
          Width is fixed in CSS, so the size measured when it opens
          keeps its edge-clamping right whichever letter it shows.
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
