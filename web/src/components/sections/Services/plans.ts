/*
  The picture on each service card: a wireframe of the thing itself,
  drawn the same way as the hero's plan (ui/Wireframe). One plan per
  service, in the same order as `data/services.ts`, on a 12-column grid.

  Blocks without a fill are empty slots that only hold the layout open.
  One block per plan takes the accent, like the hero's.
*/
import { FILL, type Cell } from '../../ui/Wireframe/Wireframe';

const gap = (span: number): Cell => ({ span, height: 0.1 });

/** Websites: a landing page — nav, a centred headline and button, a big
    picture, then a row of three cards. */
const website: Cell[] = [
  { span: 3, height: 1.1, fill: FILL.mid },
  gap(3),
  { span: 2, height: 1.1, fill: FILL.faint },
  { span: 2, height: 1.1, fill: FILL.faint },
  { span: 2, height: 1.1, fill: FILL.faint },
  gap(2),
  { span: 8, height: 1.2, fill: FILL.mid },
  gap(2),
  gap(3),
  { span: 6, height: 0.7, fill: FILL.faint },
  gap(3),
  gap(4),
  { span: 4, height: 1.3, fill: FILL.accent, accent: true },
  gap(4),
  { span: 12, height: 4.4, fill: FILL.soft },
  { span: 4, height: 2.6, fill: FILL.soft },
  { span: 4, height: 2.6, fill: FILL.soft },
  { span: 4, height: 2.6, fill: FILL.soft },
];

/** Web apps: a dashboard — a sidebar down the side, a search bar and an
    avatar, three figures, a bar chart rising to the accent, a table row. */
const webApp: Cell[] = [
  { span: 3, rowSpan: 5, fill: FILL.mid },
  { span: 7, height: 1.1, fill: FILL.faint },
  { span: 2, height: 1.1, fill: FILL.strong, round: true },
  { span: 3, height: 2.4, fill: FILL.soft },
  { span: 3, height: 2.4, fill: FILL.soft },
  { span: 3, height: 2.4, fill: FILL.soft },
  { span: 1, height: 2.2, fill: FILL.soft, end: true },
  { span: 1, height: 3.4, fill: FILL.soft, end: true },
  { span: 1, height: 2.8, fill: FILL.soft, end: true },
  { span: 1, height: 4.2, fill: FILL.soft, end: true },
  { span: 1, height: 3.6, fill: FILL.soft, end: true },
  { span: 1, height: 5, fill: FILL.soft, end: true },
  { span: 1, height: 4.4, fill: FILL.soft, end: true },
  { span: 1, height: 5.8, fill: FILL.soft, end: true },
  { span: 1, height: 6.4, fill: FILL.accent, accent: true, end: true },
  { span: 9, height: 0.8, fill: FILL.faint },
  { span: 6, height: 0.8, fill: FILL.faint },
];

/** Online stores: a shop — a nav with the cart, three products, each
    with its name, its price and a button to add it. */
const store: Cell[] = [
  { span: 3, height: 1.1, fill: FILL.mid },
  gap(6),
  { span: 3, height: 1.1, fill: FILL.accent, accent: true },
  { span: 4, height: 4.6, fill: FILL.soft },
  { span: 4, height: 4.6, fill: FILL.soft },
  { span: 4, height: 4.6, fill: FILL.soft },
  { span: 3, height: 0.7, fill: FILL.mid },
  gap(1),
  { span: 3, height: 0.7, fill: FILL.mid },
  gap(1),
  { span: 3, height: 0.7, fill: FILL.mid },
  gap(1),
  { span: 2, height: 0.7, fill: FILL.faint },
  gap(2),
  { span: 2, height: 0.7, fill: FILL.faint },
  gap(2),
  { span: 2, height: 0.7, fill: FILL.faint },
  gap(2),
  { span: 4, height: 1.3, fill: FILL.faint },
  { span: 4, height: 1.3, fill: FILL.faint },
  { span: 4, height: 1.3, fill: FILL.faint },
];

/** Brand identity: a brand board — the logo on its tile, four colour
    swatches, a type specimen, and a row of stationery. */
const brand: Cell[] = [
  { span: 6, rowSpan: 2, fill: FILL.mid },
  { span: 3, height: 2.6, fill: FILL.accent, accent: true, round: true },
  { span: 3, height: 2.6, fill: FILL.ink, round: true },
  { span: 3, height: 2.6, fill: FILL.strong, round: true },
  { span: 3, height: 2.6, fill: FILL.faint, round: true },
  { span: 10, height: 1.6, fill: FILL.mid },
  gap(2),
  { span: 7, height: 0.7, fill: FILL.faint },
  gap(5),
  { span: 4, height: 2.4, fill: FILL.soft },
  { span: 4, height: 2.4, fill: FILL.soft },
  { span: 4, height: 2.4, fill: FILL.soft },
];

export const PLANS: Cell[][] = [website, webApp, store, brand];
