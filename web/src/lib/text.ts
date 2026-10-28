/*
  Text written in the dashboard, into HTML: the little Markdown a
  project's explanation needs, and nothing more. Paragraphs are split by
  a blank line; `## ` and `### ` start headings, `- ` list items;
  [words](address) is a link and **words** are strong.

  Everything is escaped first, so whatever is typed can only ever come
  out as text, never as markup of its own.
*/

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Links and strong words inside one block, already escaped. */
function inline(text: string): string {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, words: string, href: string) => {
      // Only ordinary links: web addresses, email, or paths on the site.
      if (!/^(https?:\/\/|mailto:|\/|#)/.test(href)) return words;
      const away = href.startsWith('http');
      return `<a href="${href}"${away ? ' target="_blank" rel="noopener"' : ''}>${words}</a>`;
    });
}

export function textToHtml(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((line) => /^- /.test(line))) {
        return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
      }
      const heading = block.match(/^(#{2,3}) (.+)$/);
      if (heading && lines.length === 1) {
        const level = heading[1].length;
        return `<h${level}>${inline(heading[2])}</h${level}>`;
      }
      return `<p>${lines.map(inline).join('<br />')}</p>`;
    })
    .join('\n');
}
