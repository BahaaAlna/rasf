import Wireframe, { FILL, type Cell } from '../../ui/Wireframe/Wireframe';

/*
  Reads as a page layout: masthead, hero split, two lines of copy, then a
  row of three cards. One block takes the accent, tying it to the logo dot.
*/
const CELLS: Cell[] = [
  { span: 6, height: 2.2, fill: FILL.faint },
  { span: 4, height: 6, fill: FILL.mid },
  { span: 2, height: 6, fill: FILL.accent, accent: true },
  { span: 6, height: 0.9, fill: FILL.faint, wideOnly: true },
  { span: 5, height: 0.9, fill: FILL.faint, wideOnly: true },
  { span: 2, height: 4.8, fill: FILL.soft },
  { span: 2, height: 4.8, fill: FILL.soft },
  { span: 2, height: 4.8, fill: FILL.soft },
];

/** The hero's plan: a page being laid out — the literal meaning of رصف. */
export default function WireframeMotif() {
  return <Wireframe cells={CELLS} />;
}
