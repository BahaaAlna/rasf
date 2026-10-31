import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

/*
  One of a few fixed values, picked from a list drawn in the site's own
  hand, as DateField does for dates: closed, an underlined field like the
  others with a chevron; open, a paper panel with a hairline round it,
  each choice a row, the one chosen in ink with the blue dot beside it.
  Replaces the browser's own list, which can't be styled.

  Arrow keys, Home and End move through the list, Enter or Space picks,
  Escape closes; a click anywhere else closes it too.
*/

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  hint?: ReactNode;
}

export default function ChoiceField({ label, value, options, onChange, hint }: Props) {
  const [open, setOpen] = useState(false);
  const chosen = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  // The row the keyboard is on, inside the open list.
  const [focus, setFocus] = useState(chosen);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  // Close on a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  // Keep the keyboard's row focused as it moves.
  useEffect(() => {
    if (open) list.current?.querySelectorAll<HTMLElement>('[role="option"]')[focus]?.focus();
  }, [open, focus]);

  function show() {
    setFocus(chosen);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  function pick(index: number) {
    onChange(options[index].value);
    close();
  }

  function buttonKeys(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      show();
    }
  }

  function listKeys(event: KeyboardEvent) {
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, focus + 1),
      ArrowUp: Math.max(0, focus - 1),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setFocus(moves[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(focus);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div className="field field--short choice" ref={root}>
      <span className="mono" id={`${id}-label`}>
        {label}
      </span>
      {/* The list hangs from the field itself, above any hint under it. */}
      <div className="choice__anchor">
        <button
          ref={button}
          type="button"
          className="choice__value"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={buttonKeys}
        >
          <span id={`${id}-value`}>{options[chosen]?.label}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <ul className="choice__list" role="listbox" aria-labelledby={`${id}-label`} ref={list} onKeyDown={listKeys}>
            {options.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={i === chosen}
                tabIndex={i === focus ? 0 : -1}
                className="choice__option"
                onClick={() => pick(i)}
                onPointerMove={() => setFocus(i)}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint}
    </div>
  );
}
