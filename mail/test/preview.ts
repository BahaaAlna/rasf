// Writes the note's HTML to preview.html, to look at in a browser.
import { writeFileSync } from 'node:fs';
import { html } from '../src/note.ts';

writeFileSync(new URL('../preview.html', import.meta.url), html());
console.log('preview.html written');
