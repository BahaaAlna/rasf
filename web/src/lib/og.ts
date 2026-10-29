/*
  The pictures a link shows when it's shared (WhatsApp, LinkedIn, X…),
  drawn as the site builds, at the size those apps expect: 1200 × 630.

  - A post: its title on paper, the logo above it and the address below,
    in the post's language. Text is set by sharp's Pango, which shapes
    Arabic (joined letters, right to left) as a browser would.
  - A project: its name and kind on one side, and its own picture whole,
    framed, on the other, in the page's language.

  Fonts come from src/assets/fonts (both OFL, licences beside them);
  paths are from the project folder, where every build runs.
*/

import path from 'node:path';
import sharp from 'sharp';
import type { Locale } from './i18n';

export const OG = { width: 1200, height: 630 } as const;

const PAPER = '#f5f2eb';
const INK = '#18181c';
const MUTED = '#86837b';
const ACCENT = '#183fc0';
const MARGIN = 96;

const file = (...parts: string[]) => path.resolve(...parts);
const FONT = {
  ar: { file: file('src/assets/fonts/Lateef-SemiBold.ttf'), family: 'Lateef SemiBold', scale: 1.25 },
  en: { file: file('src/assets/fonts/BricolageGrotesque.ttf'), family: 'Bricolage Grotesque Medium', scale: 1 },
} as const;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A block of text as a transparent picture, wrapped to `width`. */
async function text(words: string, locale: Locale, size: number, color: string, width: number) {
  const font = FONT[locale];
  return sharp({
    text: {
      text: `<span foreground="${color}">${escape(words)}</span>`,
      font: `${font.family} ${Math.round(size * font.scale)}`,
      fontfile: font.file,
      width,
      align: locale === 'ar' ? 'right' : 'left',
      wrap: 'word',
      rgba: true,
      spacing: Math.round(size * 0.12),
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/** A post's card: logo, its title as large as fits, a hairline, the address and the dot. */
export async function postCard(title: string, locale: Locale): Promise<Buffer> {
  const rtl = locale === 'ar';
  const inner = OG.width - MARGIN * 2;
  // Start at the side the language starts from.
  const place = (w: number) => (rtl ? OG.width - MARGIN - w : MARGIN);

  // The largest size at which the title fits its band in three lines or so.
  let block = await text(title, locale, 68, INK, inner);
  for (const size of [60, 52, 46, 40]) {
    if (block.info.height <= 270) break;
    block = await text(title, locale, size, INK, inner);
  }

  const logo = await sharp(file(`src/assets/logo-${locale}.png`))
    .resize({ height: 54 })
    .toBuffer({ resolveWithObject: true });
  const site = await text('rasf.studio', 'en', 26, MUTED, 400);
  const dot = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="10" fill="${ACCENT}"/></svg>`);
  const rule = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${inner}" height="1"><rect width="${inner}" height="1" fill="${INK}" fill-opacity="0.14"/></svg>`);

  const titleTop = Math.round(150 + (300 - block.info.height) / 2);
  const footTop = OG.height - MARGIN + 10;

  return sharp({ create: { width: OG.width, height: OG.height, channels: 3, background: PAPER } })
    .composite([
      { input: logo.data, top: MARGIN - 20, left: place(logo.info.width) },
      { input: block.data, top: titleTop, left: place(block.info.width) },
      { input: rule, top: footTop - 34, left: MARGIN },
      // The address at the start of the line, the dot at its end.
      { input: site.data, top: footTop - 6, left: rtl ? OG.width - MARGIN - site.info.width : MARGIN },
      { input: dot, top: footTop, left: rtl ? MARGIN : OG.width - MARGIN - 20 },
    ])
    .png()
    .toBuffer();
}

/** A project's card: the logo, its name and kind at the start, its picture whole at the end. */
export async function projectCard(project: { name: string; kind: string; image: string }, locale: Locale): Promise<Buffer> {
  const rtl = locale === 'ar';
  const shot = { width: 600, height: 450 };
  const column = OG.width - MARGIN * 2 - shot.width - 56;
  const place = (w: number) => (rtl ? OG.width - MARGIN - w : MARGIN);

  // The picture, whole, with rounded corners and a hairline, like a window.
  const radius = 14;
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${shot.width}" height="${shot.height}"><rect width="${shot.width}" height="${shot.height}" rx="${radius}" fill="#fff"/></svg>`,
  );
  const picture = await sharp(file('public', project.image.replace(/^\//, '')))
    .resize(shot.width, shot.height, { fit: 'cover', position: 'top' })
    .composite([{ input: frame, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const edge = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${shot.width}" height="${shot.height}"><rect x="0.5" y="0.5" width="${shot.width - 1}" height="${shot.height - 1}" rx="${radius}" fill="none" stroke="${INK}" stroke-opacity="0.16"/></svg>`,
  );

  let name = await text(project.name, locale, 58, INK, column);
  for (const size of [50, 44, 38]) {
    if (name.info.height <= 170) break;
    name = await text(project.name, locale, size, INK, column);
  }
  const kind = project.kind ? await text(project.kind, locale, 26, MUTED, column) : null;
  const logo = await sharp(file(`src/assets/logo-${locale}.png`))
    .resize({ height: 46 })
    .toBuffer({ resolveWithObject: true });
  const dot = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="10" fill="${ACCENT}"/></svg>`);

  const shotLeft = rtl ? MARGIN : OG.width - MARGIN - shot.width;
  const shotTop = Math.round((OG.height - shot.height) / 2);
  const nameTop = 230;
  const layers: sharp.OverlayOptions[] = [
    { input: picture, top: shotTop, left: shotLeft },
    { input: edge, top: shotTop, left: shotLeft },
    { input: logo.data, top: shotTop, left: place(logo.info.width) },
    { input: name.data, top: nameTop, left: place(name.info.width) },
    { input: dot, top: shotTop + shot.height - 20, left: place(20) },
  ];
  if (kind) layers.push({ input: kind.data, top: nameTop + name.info.height + 18, left: place(kind.info.width) });

  return sharp({ create: { width: OG.width, height: OG.height, channels: 3, background: PAPER } })
    .composite(layers)
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

/** Only pictures that are photographs or screenshots make a project card; drawings fall back to the site's. */
export const hasPhoto = (image: string) => /^\/work\/[^/]+\.(jpe?g|png|webp)$/i.test(image);
