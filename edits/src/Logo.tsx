/*
  The logotype with its dot drawn separately, so the two can move apart:
  the printed dot is cut out of the image and a round one put in its place.

  `reveal` (0–1) writes the letters in, in reading order, behind a soft
  edge. `dot` (0–1) scales the dot; `dotLift` raises it by that many
  pixels.
*/

import { Img, staticFile } from 'remotion';
import { color, logo, type Locale } from './brand';

interface Props {
  locale: Locale;
  width: number;
  reveal?: number;
  dot?: number;
  dotLift?: number;
  /** Light letters, for a dark ground. */
  light?: boolean;
}

const EDGE = 14;

export const Logo = ({ locale, width, reveal = 1, dot = 1, dotLift = 0, light = false }: Props) => {
  const art = logo[locale];
  const height = (width * 1024) / 1536;
  const size = art.dot.size * width;
  // Left to right for English, right to left for Arabic; the soft edge
  // runs from -EDGE% to 100%, so 0 shows nothing and 1 shows it all.
  const at = -EDGE + reveal * (100 + EDGE);
  const mask = `linear-gradient(${locale === 'en' ? 'to right' : 'to left'}, #000 ${at}%, transparent ${at + EDGE}%)`;

  return (
    <div style={{ position: 'relative', width, height }}>
      <div style={{ position: 'absolute', inset: 0, maskImage: mask, WebkitMaskImage: mask }}>
        <Img
          src={staticFile(art.src)}
          style={{
            width: '100%',
            height: '100%',
            clipPath: art.cut,
            filter: light ? 'invert(1) brightness(1.1)' : undefined,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: art.dot.x * width - size / 2,
          top: art.dot.y * height - size / 2 - dotLift,
          width: size,
          height: size,
          borderRadius: '50%',
          background: color.accent,
          transform: `scale(${dot})`,
        }}
      />
    </div>
  );
};
