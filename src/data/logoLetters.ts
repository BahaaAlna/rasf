/*
  Which letter of the logotype a point belongs to, so each one can carry
  its own scatter of grey and own its own card.

  Measured from `logo-ar.png` and `logo-en.png`, as fractions of the logo box like the dot
  in `logoDot.ts`. ر is a shape of its own, but its tail runs back under
  ص below the line — ص never reaches lower than 0.78 — so it is told
  apart by height as well as by width. ص and ف are one joined shape, cut
  in the middle of the kashida that joins them.

  Groups are in reading order: 0 is ر, the letter the reader meets first.

  `logo-en.png` has four letters for the three cards, so R and a share
  the first: Ra · s · f. Each letter there is its own shape, so plain
  cuts in the gaps between them are enough — a ends at 0.517 and s
  starts at 0.530; s and f touch at 0.767.

  Anything without an entry here keeps being split into thirds.

  Remeasure alongside the assets if the logotype is ever redrawn.
*/
export type LetterOf = (fx: number, fy: number) => 0 | 1 | 2;

export const LOGO_LETTERS: Partial<Record<'ar' | 'en', LetterOf>> = {
  ar: (fx, fy) => (fx >= 0.898 || fy > 0.8 ? 0 : fx >= 0.5 ? 1 : 2),
  en: (fx) => (fx < 0.523 ? 0 : fx < 0.767 ? 1 : 2),
};

/**
 * One grey per letter, in the same reading order. The letters stay in
 * the logotype's own black; these only mark the scattered stones that
 * show each letter has a meaning of its own.
 */
export const LETTER_SHADES = ['#55555c', '#8a8a91', '#bcbcc1'] as const;

/** Share of each letter's stones laid in its grey rather than black. */
export const SPECKLE = 0.13;
