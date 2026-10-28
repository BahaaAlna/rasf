/*
  How a section of the site is described to the dashboard: the fields it
  has, so one editor can draw a form for any of them.

  A section's content is stored as one Firestore document,
  content/{section id}: the words in each language under `ar` and `en`,
  and anything the same in both (an email, a list of product names) at
  the top level.
*/

export type Field =
  /** One line of text, or several with `long`. `ltr` for addresses, links and the like. */
  | { kind: 'text'; key: string; label: string; hint?: string; long?: boolean; ltr?: boolean }
  | { kind: 'number'; key: string; label: string; hint?: string; step?: number }
  /** On or off, drawn as the dot switch. */
  | { kind: 'switch'; key: string; label: string; hint?: string }
  /** One of a few fixed values, e.g. which page a project is listed on. */
  | { kind: 'choice'; key: string; label: string; hint?: string; options: { value: string; label: string }[] }
  /**
   * The site's icon: an uploaded image, turned into a small tab icon and a
   * home-screen icon. Null keeps the site's default.
   */
  | { kind: 'icon'; key: string; label: string; hint?: string }
  /** A list of short lines, one per row. */
  | { kind: 'lines'; key: string; label: string; hint?: string; ltr?: boolean }
  /** A few fields kept together, e.g. the nav's labels. */
  | { kind: 'group'; key: string; label: string; fields: Field[] }
  /**
   * A list of things with the same fields, e.g. projects. `fixed` when the
   * site draws one picture per item, so items can be edited but not added
   * or removed.
   */
  | { kind: 'items'; key: string; label: string; hint?: string; itemName: string; fields: Field[]; fixed?: boolean };

export type Values = Record<string, unknown>;

/** A section as stored: each language's words, plus what both share. */
export interface SectionDoc extends Values {
  ar: Values;
  en: Values;
}

export interface Section {
  id: string;
  title: string;
  /** Where it shows on the site, so it's clear what's being edited. */
  description: string;
  /** Edited once per language. */
  words: Field[];
  /** Edited once, the same in both languages. */
  shared?: Field[];
  /** The site's current text, to start from. */
  current: () => SectionDoc;
}

/** An empty value for a field, for a new item in a list. */
export function blank(field: Field): unknown {
  switch (field.kind) {
    case 'text':
      return '';
    case 'number':
      return 0;
    case 'icon':
      return null;
    case 'switch':
      return false;
    case 'choice':
      return field.options[0]?.value ?? '';
    case 'lines':
    case 'items':
      return [];
    case 'group':
      return Object.fromEntries(field.fields.map((f) => [f.key, blank(f)]));
  }
}
