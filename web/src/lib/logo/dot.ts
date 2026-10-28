/*
  Where the dot sits inside the logotype.

  The dot is part of the artwork, so it cannot be moved while it is
  still painted into the image. It is cut out of the asset instead —
  `logo-*-nodot.png` is the wordmark with that patch erased — and these
  figures put a real element back in exactly the same place. Measured
  from the source PNGs, as fractions of the logo box, so they survive
  any size the header renders it at.

  Regenerate alongside the assets if the logotype is ever redrawn.
*/
export interface DotSpot {
  /** Centre, as a fraction of the logo's width and height. */
  cx: number;
  cy: number;
  /** Diameter, as a fraction of the logo's width. */
  d: number;
}

export const LOGO_DOT: Record<'ar' | 'en', DotSpot> = {
  ar: { cx: 0.02871, cy: 0.63596, d: 0.05417 },
  en: { cx: 0.95229, cy: 0.85949, d: 0.08922 },
};
