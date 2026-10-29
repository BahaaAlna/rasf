import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useParams } from 'react-router';
import { getSection, saveSection } from '../../lib/content';
import { sectionById } from '../../content/sections';
import type { Field, SectionDoc, Values } from '../../content/fields';
import { LANG_NAMES, LANGS, type Lang } from '../../lib/posts';
import FieldEditor from './FieldEditor';

/*
  Editing one section of the site. What's saved is shown on top of the
  site's current text, so a field added to the site later still shows up
  here with its current wording. A section never saved opens on the
  site's current text, ready to change and save.
*/

const isObject = (v: unknown): v is Values => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * `over` laid on `base`, object by object. Lists are taken whole, except
 * that each item that's an object is laid on the item at the same place
 * in `base`, so a field added to the site after an item was saved shows
 * the site's value for it. The website reads saved sections the same way.
 */
function layer(base: unknown, over: unknown): unknown {
  if (over === undefined) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    return over.map((item, i) => (isObject(item) && isObject(base[i]) ? layer(base[i], item) : item));
  }
  if (!isObject(base) || !isObject(over)) return over;
  const out: Values = { ...base };
  for (const [key, value] of Object.entries(over)) out[key] = layer(base[key], value);
  return out;
}

/** Ready to save: lines trimmed and empty ones dropped, text trimmed at the ends. */
function tidy(fields: Field[], values: Values): Values {
  const out: Values = { ...values };
  for (const f of fields) {
    const v = values[f.key];
    if (f.kind === 'text' && typeof v === 'string') out[f.key] = v.trim();
    if (f.kind === 'lines' && Array.isArray(v)) out[f.key] = (v as string[]).map((s) => s.trim()).filter(Boolean);
    if (f.kind === 'group' && isObject(v)) out[f.key] = tidy(f.fields, v);
    if (f.kind === 'items' && Array.isArray(v)) out[f.key] = (v as Values[]).map((item) => tidy(f.fields, item));
  }
  return out;
}

/** A fresh editor per section, so switching sections starts clean. */
export default function SectionRoute() {
  const { id = '' } = useParams();
  return <SectionEditor key={id} id={id} />;
}

function SectionEditor({ id }: { id: string }) {
  const section = sectionById(id);

  const [value, setValue] = useState<SectionDoc | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [neverSaved, setNeverSaved] = useState(false);
  const [tab, setTab] = useState<Lang>('ar');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!section) return;
    let live = true;
    getSection(section.id)
      .then((stored) => {
        if (!live) return;
        setValue(layer(section.current(), stored?.doc) as SectionDoc);
        setSavedAt(stored?.updatedAt ?? null);
        setNeverSaved(!stored);
      })
      .catch(() => live && setError('Couldn’t load this section. Check the connection.'));
    return () => {
      live = false;
    };
  }, [section]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!section) return <Navigate to="/" replace />;

  const change = (next: SectionDoc) => {
    setValue(next);
    setDirty(true);
    setSaved(false);
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!value || !section) return;
    setBusy(true);
    setError('');
    // What has moved out of this section (Work's projects) isn't written back.
    const keep = (words: Values) =>
      Object.fromEntries(Object.entries(words).filter(([key]) => !section.moved?.includes(key)));
    const next: SectionDoc = {
      ...tidy(section.shared ?? [], value),
      ar: keep(tidy(section.words, value.ar)),
      en: keep(tidy(section.words, value.en)),
    };
    try {
      await saveSection(section.id, next);
      setValue(next);
      setDirty(false);
      setSaved(true);
      setNeverSaved(false);
      setSavedAt(new Date());
    } catch {
      setError('Couldn’t save. Check the connection, and that this account is an admin.');
    }
    setBusy(false);
  }

  return (
    <form className="form editor" onSubmit={submit} noValidate>
      <header className="screen__head">
        <div>
          <h1 className="screen__title">
            {section.title}
            <span className="dot">.</span>
          </h1>
          <p className="screen__lead">{section.description}</p>
        </div>
        <div className="form__actions">
          <button className="button" type="submit" disabled={busy || !value}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      {saved && !dirty && <p className="form__note">Saved. It goes live the next time the site is built.</p>}
      {neverSaved && !dirty && (
        <p className="form__note form__note--quiet">
          Not saved here yet: this is the text on the site now. Change it and save, and from then on the site takes
          it from here.
        </p>
      )}
      {savedAt && !neverSaved && !saved && (
        <p className="mono">Last saved {savedAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      )}

      {!value && !error && <p className="empty">Loading…</p>}

      {value && (
        <>
          {section.shared && (
            <section className="shared">
              <h2 className="mono shared__title">Both languages</h2>
              {section.shared.map((f) => (
                <FieldEditor key={f.key} field={f} value={value[f.key]} onChange={(v) => change({ ...value, [f.key]: v })} />
              ))}
            </section>
          )}

          <div className="tabs" role="tablist" aria-label="Language">
            {LANGS.map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={tab === lang}
                className="tabs__tab"
                onClick={() => setTab(lang)}
              >
                {LANG_NAMES[lang]}
              </button>
            ))}
          </div>

          <div className="version" role="tabpanel">
            {section.words.map((f) => (
              <FieldEditor
                key={`${tab}-${f.key}`}
                field={f}
                lang={tab}
                value={value[tab][f.key]}
                onChange={(v) => change({ ...value, [tab]: { ...value[tab], [f.key]: v } })}
              />
            ))}
          </div>
        </>
      )}
    </form>
  );
}
