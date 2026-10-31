import { useState, type ReactNode } from 'react';
import { blank, type Field, type Values } from '../../content/fields';
import { makeIcon, type SiteIcon } from '../../content/icon';
import defaultIcon from '../../../../web/public/apple-touch-icon.png';
import ChoiceField from '../../components/ChoiceField';

/*
  One field of a section, drawn from its description: a line, a box, a
  number, a list of lines, a group of fields, or a list of items each
  with fields of its own. Groups and items draw their fields with this
  same component, so any shape of section gets a form.
*/

interface Props {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  /** The language being edited, for direction and font; none for shared fields. */
  lang?: 'ar' | 'en';
}

export default function FieldEditor({ field, value, onChange, lang }: Props) {
  const dir = lang === 'ar' && !('ltr' in field && field.ltr) ? 'rtl' : 'ltr';
  const textLang = dir === 'rtl' ? 'ar' : lang;
  const hint = 'hint' in field && field.hint ? <span className="field__hint">{field.hint}</span> : null;

  switch (field.kind) {
    case 'text': {
      const props = {
        dir,
        lang: textLang,
        value: typeof value === 'string' ? value : '',
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      };
      return (
        <label className="field">
          <span className="mono">{field.label}</span>
          {field.long ? (
            // Grows with what's in it, so a long text is all in view.
            <textarea rows={Math.min(24, Math.max(3, props.value.split('\n').length + 1))} {...props} />
          ) : (
            <input {...props} />
          )}
          {hint}
        </label>
      );
    }

    case 'switch':
      return (
        <div className="field">
          <label className="toggle">
            <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
            <span>{field.label}</span>
          </label>
          {hint}
        </div>
      );

    case 'choice':
      return (
        <ChoiceField
          label={field.label}
          value={typeof value === 'string' ? value : (field.options[0]?.value ?? '')}
          options={field.options}
          onChange={onChange}
          hint={hint}
        />
      );

    case 'number':
      return (
        <label className="field field--short">
          <span className="mono">{field.label}</span>
          <input
            type="number"
            step={field.step ?? 1}
            value={typeof value === 'number' ? value : 0}
            onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          />
          {hint}
        </label>
      );

    case 'icon':
      return (
        <IconField label={field.label} hint={hint} value={value as SiteIcon | null} onChange={onChange} />
      );

    case 'lines': {
      const lines = Array.isArray(value) ? (value as string[]) : [];
      return (
        <label className="field">
          <span className="mono">{field.label}</span>
          <textarea
            dir={dir}
            lang={textLang}
            rows={Math.max(3, lines.length + 1)}
            value={lines.join('\n')}
            // Empty lines are kept while typing, and dropped on save.
            onChange={(e) => onChange(e.target.value.split('\n'))}
          />
          {hint}
        </label>
      );
    }

    case 'group': {
      const group = (value ?? {}) as Values;
      return (
        <fieldset className="group">
          <legend className="mono">{field.label}</legend>
          {field.fields.map((f) => (
            <FieldEditor
              key={f.key}
              field={f}
              lang={lang}
              value={group[f.key]}
              onChange={(v) => onChange({ ...group, [f.key]: v })}
            />
          ))}
        </fieldset>
      );
    }

    case 'items': {
      const items = Array.isArray(value) ? (value as Values[]) : [];
      const set = (next: Values[]) => onChange(next);
      const move = (from: number, to: number) => {
        const next = [...items];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        set(next);
      };
      const empty = () => Object.fromEntries(field.fields.map((f) => [f.key, blank(f)])) as Values;

      return (
        <fieldset className="group">
          <legend className="mono">{field.label}</legend>
          {hint}
          <ol className="items">
            {items.map((item, i) => (
              <li className="item" key={i}>
                <div className="item__head">
                  <span className="mono">
                    {field.itemName} {i + 1}
                  </span>
                  {!field.fixed && (
                    <span className="item__tools">
                      <button type="button" className="chip" disabled={i === 0} onClick={() => move(i, i - 1)}>
                        Up
                      </button>
                      <button
                        type="button"
                        className="chip"
                        disabled={i === items.length - 1}
                        onClick={() => move(i, i + 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="chip chip--danger"
                        onClick={() => set(items.filter((_, j) => j !== i))}
                      >
                        Remove
                      </button>
                    </span>
                  )}
                </div>
                {field.fields.map((f) => (
                  <FieldEditor
                    key={f.key}
                    field={f}
                    lang={lang}
                    value={item[f.key]}
                    onChange={(v) => set(items.map((it, j) => (j === i ? { ...it, [f.key]: v } : it)))}
                  />
                ))}
              </li>
            ))}
          </ol>
          {!field.fixed && (
            <button type="button" className="button button--quiet" onClick={() => set([...items, empty()])}>
              Add {field.itemName}
            </button>
          )}
        </fieldset>
      );
    }
  }
}

/** The icon: what the site shows now, a way to replace it, and a way back to the default. */
function IconField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: ReactNode;
  value: SiteIcon | null;
  onChange: (value: SiteIcon | null) => void;
}) {
  const [error, setError] = useState('');

  async function pick(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      onChange(await makeIcon(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t read that image.');
    }
  }

  return (
    <div className="field">
      <span className="mono">{label}</span>
      <div className="icon">
        <img className="icon__touch" src={value?.touch ?? defaultIcon} alt="" width={72} height={72} />
        {value && <img className="icon__tab" src={value.tab} alt="" width={24} height={24} />}
        <div className="icon__actions">
          <label className="button button--quiet">
            {value ? 'Replace' : 'Upload an icon'}
            <input
              className="u-hidden"
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          {value && (
            <button type="button" className="chip" onClick={() => onChange(null)}>
              Use the default dot
            </button>
          )}
          <span className="field__hint">{value ? 'Your icon. Save to keep it.' : 'The default: the blue dot.'}</span>
        </div>
      </div>
      {error && <p className="form__error">{error}</p>}
      {hint}
    </div>
  );
}
