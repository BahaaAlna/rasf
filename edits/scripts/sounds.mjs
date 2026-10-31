/*
  Makes the promo's sound: a short music bed and the effects, synthesised
  here from sine waves and noise, so there's nothing to license. Written
  to public/sfx/*.wav (48 kHz, 16-bit, stereo).

  The music follows the promo's timeline (see src/timeline.ts): a pad and
  a rising swell under the logo, the beat dropping in as the device
  arrives, a lift as Contact opens, and a ring-out at the end.

  Usage: node scripts/sounds.mjs
*/

import fs from 'node:fs/promises';
import path from 'node:path';

const RATE = 48000;
const TAU = Math.PI * 2;

// A seeded random, so each run makes the same sounds.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const buffer = (seconds) => [new Float32Array(Math.ceil(seconds * RATE)), new Float32Array(Math.ceil(seconds * RATE))];

/** Adds a mono signal into a stereo buffer at `at` seconds, panned -1…1. */
function mix(out, signal, at = 0, gain = 1, pan = 0) {
  const start = Math.round(at * RATE);
  const l = Math.cos(((pan + 1) * Math.PI) / 4) * gain;
  const r = Math.sin(((pan + 1) * Math.PI) / 4) * gain;
  for (let i = 0; i < signal.length; i++) {
    const j = start + i;
    if (j < 0 || j >= out[0].length) continue;
    out[0][j] += signal[i] * l;
    out[1][j] += signal[i] * r;
  }
}

/** A signal of `seconds`, each sample from f(t, i). */
const make = (seconds, f) => {
  const s = new Float32Array(Math.ceil(seconds * RATE));
  for (let i = 0; i < s.length; i++) s[i] = f(i / RATE, i);
  return s;
};

/** One-pole low-pass, cutoff in Hz (a number or a function of time). */
function lowpass(signal, cutoff) {
  const out = new Float32Array(signal.length);
  let y = 0;
  for (let i = 0; i < signal.length; i++) {
    const fc = typeof cutoff === 'function' ? cutoff(i / RATE) : cutoff;
    const a = 1 - Math.exp((-TAU * fc) / RATE);
    y += a * (signal[i] - y);
    out[i] = y;
  }
  return out;
}

/** State-variable band-pass, centre in Hz (a number or a function of time). */
function bandpass(signal, centre, q = 1.2) {
  const out = new Float32Array(signal.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < signal.length; i++) {
    const fc = typeof centre === 'function' ? centre(i / RATE) : centre;
    const f = 2 * Math.sin((Math.PI * Math.min(fc, RATE / 6)) / RATE);
    low += f * band;
    const high = signal[i] - low - band / q;
    band += f * high;
    out[i] = band;
  }
  return out;
}

const highpass = (signal, cutoff) => {
  const low = lowpass(signal, cutoff);
  return signal.map((v, i) => v - low[i]);
};

const noise = (seconds) => make(seconds, () => rand());
const note = (n) => 440 * 2 ** ((n - 69) / 12);
// Attack, then an exponential fall.
const env = (t, attack, decay) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay));

function normalise(out, peak = 0.89) {
  let max = 0;
  for (const ch of out) for (const v of ch) max = Math.max(max, Math.abs(v));
  if (max === 0) return out;
  for (const ch of out) for (let i = 0; i < ch.length; i++) ch[i] *= peak / max;
  return out;
}

async function write(name, out) {
  const frames = out[0].length;
  const data = Buffer.alloc(44 + frames * 4);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + frames * 4, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(RATE, 24);
  data.writeUInt32LE(RATE * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(frames * 4, 40);
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < 2; c++) {
      const v = Math.max(-1, Math.min(1, out[c][i]));
      data.writeInt16LE(Math.round(v * 32767), 44 + i * 4 + c * 2);
    }
  }
  await fs.writeFile(path.join('public/sfx', `${name}.wav`), data);
  console.log(name, (frames / RATE).toFixed(2), 's');
}

// ---- Effects --------------------------------------------------------------

/** Air rushing past: noise through a band that sweeps up and back. */
function whoosh(seconds = 0.7, from = 300, to = 3200) {
  const out = buffer(seconds);
  const n = bandpass(noise(seconds), (t) => {
    const x = t / seconds;
    return from + (to - from) * Math.sin(Math.PI * x) ** 1.5;
  }, 0.9);
  const shaped = n.map((v, i) => v * Math.sin((Math.PI * i) / n.length) ** 2);
  for (let i = 0; i < shaped.length; i++) {
    const pan = -0.7 + 1.4 * (i / shaped.length);
    out[0][i] += shaped[i] * Math.cos(((pan + 1) * Math.PI) / 4);
    out[1][i] += shaped[i] * Math.sin(((pan + 1) * Math.PI) / 4);
  }
  return normalise(out, 0.8);
}

/** The dot landing: a falling pitch with a soft thump under it. */
function pop() {
  const out = buffer(0.5);
  let phase = 0;
  mix(out, make(0.5, (t) => {
    phase += (TAU * (260 + 700 * Math.exp(-t * 40))) / RATE;
    return Math.sin(phase) * env(t, 0.002, 0.07);
  }));
  let sub = 0;
  mix(out, make(0.5, (t) => {
    sub += (TAU * (60 + 90 * Math.exp(-t * 30))) / RATE;
    return Math.sin(sub) * env(t, 0.003, 0.12);
  }), 0, 0.9);
  mix(out, highpass(noise(0.01), 2000), 0, 0.25);
  return normalise(out, 0.85);
}

/** A bright bell, for the tagline settling. */
function shimmer() {
  const out = buffer(2.2);
  [note(88), note(95), note(100), note(107)].forEach((f, k) => {
    mix(out, make(2.2, (t) => Math.sin(TAU * f * t + 0.3 * Math.sin(TAU * f * 2.01 * t)) * env(t, 0.004 + k * 0.01, 0.55 - k * 0.08)), k * 0.035, 0.5 - k * 0.08, -0.4 + k * 0.27);
  });
  return normalise(out, 0.6);
}

/** One key of a soft keyboard; `k` varies it a little. */
function key(k) {
  const out = buffer(0.08);
  const pitch = 1800 + ((k * 397) % 600);
  mix(out, bandpass(noise(0.08), pitch, 2).map((v, i) => v * env(i / RATE, 0.0005, 0.008)), 0, 1);
  mix(out, make(0.08, (t) => Math.sin(TAU * (pitch / 3) * t) * env(t, 0.0005, 0.006)), 0, 0.5);
  return normalise(out, 0.7);
}

/** A tap or a mouse click: down, then up. */
function click() {
  const out = buffer(0.15);
  for (const [at, f, g] of [[0, 3200, 1], [0.065, 4200, 0.6]]) {
    mix(out, bandpass(noise(0.03), f, 3).map((v, i) => v * env(i / RATE, 0.0003, 0.004)), at, g);
  }
  return normalise(out, 0.7);
}

/** A finger flick on glass: short, low, airy. */
function swipe() {
  const out = buffer(0.4);
  mix(out, lowpass(noise(0.4), (t) => 600 + 2200 * Math.sin((Math.PI * t) / 0.4)).map((v, i) => v * Math.sin((Math.PI * i) / (0.4 * RATE)) ** 3), 0, 1, 0.2);
  return normalise(out, 0.5);
}

/** A swell that climbs into the Contact scene. */
function riser(seconds = 1.4) {
  const out = buffer(seconds);
  const n = bandpass(noise(seconds), (t) => 300 + 5000 * (t / seconds) ** 2, 1.5);
  mix(out, n.map((v, i) => v * (i / n.length) ** 2), 0, 0.8);
  let phase = 0;
  mix(out, make(seconds, (t) => {
    phase += (TAU * (180 + 900 * (t / seconds) ** 2)) / RATE;
    return Math.sin(phase) * (t / seconds) ** 3;
  }), 0, 0.3);
  return normalise(out, 0.7);
}

/** A deep hit as the dark ground opens. */
function impact() {
  const out = buffer(2.5);
  let phase = 0;
  mix(out, make(2.5, (t) => {
    phase += (TAU * (42 + 70 * Math.exp(-t * 9))) / RATE;
    return Math.tanh(1.6 * Math.sin(phase)) * env(t, 0.004, 0.55);
  }));
  mix(out, lowpass(noise(2.5), 900).map((v, i) => v * env(i / RATE, 0.002, 0.25)), 0, 0.7);
  return normalise(out, 0.9);
}

// ---- Music ----------------------------------------------------------------

/*
  One length for every version: they share a timeline. Times in seconds.
  BPM 112; the chords move every bar, F#m9 – Dmaj9 – Amaj9 – E6/9.
*/
function music({ length, drop, lift, end }) {
  const out = buffer(length);
  const beat = 60 / 112;
  const bar = beat * 4;
  const chords = [
    [54, 61, 64, 68, 69], // F#m9
    [50, 57, 61, 64, 66], // Dmaj9
    [45, 52, 56, 59, 61], // Amaj9
    [52, 59, 61, 64, 66], // E6/9
  ];

  // The pad: detuned saws, filtered soft, swelling in over the logo.
  for (let b = 0; b * bar < length; b++) {
    const chord = chords[b % 4];
    const at = b * bar;
    const len = Math.min(bar + 0.6, length - at);
    for (const [k, n] of chord.entries()) {
      for (const detune of [-0.07, 0.07]) {
        const f = note(n + 12) * 2 ** (detune / 12);
        const saw = make(len, (t) => {
          const x = (f * t + k * 0.13) % 1;
          return (2 * x - 1) * Math.min(1, t / 0.5) * Math.min(1, (len - t) / 0.5);
        });
        mix(out, lowpass(saw, (t) => 700 + 500 * Math.sin((TAU * (at + t)) / 7)), at, 0.06, detune * 8);
      }
    }
  }
  // The pad fades in under the dot, so the first frame isn't a wall of sound.
  for (const ch of out) for (let i = 0; i < Math.min(ch.length, 1.2 * RATE); i++) ch[i] *= i / (1.2 * RATE);

  // From the drop: kick on the beat, a pluck arpeggio on the eighths, soft hats.
  const groove = (from, to, level) => {
    for (let t = from; t < to - 0.05; t += beat / 2) {
      const step = Math.round((t - from) / (beat / 2));
      const chord = chords[Math.floor(t / bar) % 4];
      if (step % 2 === 0) {
        let phase = 0;
        mix(out, make(0.45, (u) => {
          phase += (TAU * (48 + 110 * Math.exp(-u * 32))) / RATE;
          return Math.sin(phase) * env(u, 0.002, 0.16);
        }), t, 0.55 * level);
      }
      const n = chord[[1, 2, 3, 4, 3, 2, 4, 1][step % 8]] + 12;
      const f = note(n);
      mix(out, lowpass(make(0.6, (u) => Math.sin(TAU * f * u + 1.2 * Math.exp(-u * 12) * Math.sin(TAU * f * 2 * u)) * env(u, 0.003, 0.18)), 3800), t, 0.16 * level, step % 2 ? 0.35 : -0.35);
      mix(out, highpass(noise(0.05), 7000).map((v, i) => v * env(i / RATE, 0.001, 0.012)), t + beat / 4, 0.05 * level, 0.5);
    }
  };
  groove(drop, lift - 0.1, 1);
  groove(lift + 0.4, end - bar / 2, 0.85);

  // The end: the last chord rings out, and everything fades.
  const fade = end - 1.5;
  for (const ch of out) {
    for (let i = Math.floor(fade * RATE); i < ch.length; i++) {
      ch[i] *= Math.max(0, 1 - (i / RATE - fade) / (length - fade));
    }
  }
  return normalise(out, 0.8);
}

// ---------------------------------------------------------------------------

await fs.mkdir('public/sfx', { recursive: true });
const tl = JSON.parse(await fs.readFile('src/timeline.json', 'utf8'));
const siteStart = tl.logo - tl.logoToSite;
const contactStart = siteStart + tl.siteLead + tl.recording + tl.siteTail - tl.siteToContact;
const end = contactStart + tl.contact;
await write('music', music({ length: end + 0.2, drop: siteStart + tl.siteLead, lift: contactStart, end }));
await write('whoosh', whoosh());
await write('whoosh-long', whoosh(1.1, 200, 2600));
await write('pop', pop());
await write('shimmer', shimmer());
for (let k = 0; k < 6; k++) await write(`key-${k}`, key(k));
await write('click', click());
await write('swipe', swipe());
await write('riser', riser());
await write('impact', impact());
