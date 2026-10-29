/*
  The row of pages under a long list, as the website's blog has it:
  Previous, the page numbers, Next. The open page wears the dot under its
  number. At the ends, the step that goes nowhere keeps its place but
  hides, so the numbers never shift. With one page there's no row.
*/

interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function Pager({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;

  return (
    <nav className="pager" aria-label="Pages">
      <button
        type="button"
        className={`pager__step mono ${page === 1 ? 'pager__step--off' : ''}`}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <Arrow back /> Previous
      </button>

      <ol className="pager__pages">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <button
              type="button"
              className="pager__page mono"
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className={`pager__step mono ${page === pages ? 'pager__step--off' : ''}`}
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
      >
        Next <Arrow />
      </button>
    </nav>
  );
}

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg className="glyph pager__arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d={back ? 'M13 8H3M7 4 3 8l4 4' : 'M3 8h10M9 4l4 4-4 4'} />
    </svg>
  );
}
