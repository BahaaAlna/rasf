import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

/*
  A date, picked from a calendar drawn in the site's own hand: paper and
  ink, mono labels, the chosen day a filled ink circle and today marked
  with the blue dot. Replaces the browser's own picker, which can't be
  styled.

  Closed, it's an underlined field like the others, showing the date in
  words. Open, a month at a time; weeks start on Saturday, as they do in
  Syria. Arrow keys move between days, Enter picks, Escape closes.

  The value is yyyy-mm-dd, read and written as UTC, like the site's dates.
*/

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
/** Saturday first: how many days into the week each JS weekday (Sun = 0) falls. */
const column = (date: Date) => (date.getUTCDay() + 1) % 7;

const toValue = (date: Date) => date.toISOString().slice(0, 10);
const fromValue = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? new Date(toValue(new Date()) + 'T00:00:00Z') : date;
};
const addDays = (date: Date, days: number) => new Date(date.valueOf() + days * 864e5);
const monthStart = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const addMonths = (date: Date, n: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));

const inWords = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthName = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function DateField({ label, value, onChange }: Props) {
  const selected = fromValue(value);
  // Read once; a field left open past midnight can live with yesterday.
  const [today] = useState(() => toValue(new Date()));
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthStart(selected));
  // The day the keyboard is on, inside the open calendar.
  const [focus, setFocus] = useState(selected);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
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

  // Keep the keyboard's day focused as it moves.
  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${toValue(focus)}"]`)?.focus();
  }, [open, focus]);

  function show() {
    setMonth(monthStart(selected));
    setFocus(selected);
    setOpen(true);
  }

  function pick(date: Date) {
    onChange(toValue(date));
    setOpen(false);
  }

  function move(date: Date) {
    setFocus(date);
    if (date.getUTCMonth() !== month.getUTCMonth() || date.getUTCFullYear() !== month.getUTCFullYear()) {
      setMonth(monthStart(date));
    }
  }

  function keys(event: KeyboardEvent) {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in steps) {
      event.preventDefault();
      move(addDays(focus, steps[event.key]));
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // Six weeks from the Saturday on or before the 1st: every month fits.
  const first = addDays(month, -column(month));
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));

  return (
    <div className="field datefield" ref={root}>
      <span className="mono" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        className="datefield__value"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : show())}
      >
        <span id={`${id}-value`}>{inWords(selected)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>

      {open && (
        <div className="calendar" role="dialog" aria-label={`Choose ${label.toLowerCase()}`} onKeyDown={keys}>
          <div className="calendar__head">
            <span className="calendar__month">{monthName(month)}</span>
            <span className="calendar__nav">
              <button type="button" className="chip" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}>
                ←
              </button>
              <button type="button" className="chip" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}>
                →
              </button>
            </span>
          </div>

          <div className="calendar__grid" ref={grid} role="grid">
            {WEEKDAYS.map((d) => (
              <span key={d} className="calendar__weekday mono" role="columnheader">
                {d}
              </span>
            ))}
            {days.map((day) => {
              const v = toValue(day);
              const outside = day.getUTCMonth() !== month.getUTCMonth();
              const classes = [
                'calendar__day',
                outside && 'calendar__day--outside',
                v === value && 'calendar__day--selected',
                v === today && 'calendar__day--today',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={v}
                  type="button"
                  role="gridcell"
                  className={classes}
                  data-day={v}
                  tabIndex={v === toValue(focus) ? 0 : -1}
                  aria-selected={v === value}
                  aria-label={inWords(day)}
                  onClick={() => pick(day)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pick(day);
                    }
                  }}
                >
                  {day.getUTCDate()}
                </button>
              );
            })}
          </div>

          <div className="calendar__foot">
            <button type="button" className="chip" onClick={() => pick(fromValue(today))}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
