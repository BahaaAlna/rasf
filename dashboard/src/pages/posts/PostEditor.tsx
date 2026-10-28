import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import DateField from '../../components/DateField';
import {
  deletePost,
  getPost,
  LANG_NAMES,
  LANGS,
  postExists,
  savePost,
  SLUG_PATTERN,
  type Lang,
  type PostVersion,
} from '../../lib/posts';

/*
  Writing or editing one post. The address and date sit at the top,
  then a tab per language; a language is on the site only if it's
  switched on here. The address can't change once a post is saved,
  since the post is stored under it and links to it would break.
*/

/** The languages as named in the dashboard's own English; the tabs use their own names. */
const IN_ENGLISH: Record<Lang, string> = { ar: 'Arabic', en: 'English' };

const blankVersion = (): PostVersion => ({ title: '', description: '', body: '' });

/** Dates as the date field speaks them: yyyy-mm-dd, in UTC like the website's dates. */
const toDateInput = (date: Date) => date.toISOString().slice(0, 10);
const fromDateInput = (value: string) => new Date(`${value}T00:00:00Z`);

interface Draft {
  slug: string;
  date: string;
  draft: boolean;
  /** Which languages are switched on. */
  on: Record<Lang, boolean>;
  versions: Record<Lang, PostVersion>;
}

const newDraft = (): Draft => ({
  slug: '',
  date: toDateInput(new Date()),
  draft: true,
  on: { ar: true, en: true },
  versions: { ar: blankVersion(), en: blankVersion() },
});

export default function PostEditor() {
  const { slug: existingSlug } = useParams();
  const isNew = !existingSlug;
  const navigate = useNavigate();

  const [post, setPost] = useState<Draft | null>(isNew ? newDraft() : null);
  const [tab, setTab] = useState<Lang>('ar');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let live = true;
    getPost(existingSlug)
      .then((found) => {
        if (!live) return;
        if (!found) {
          setError('There’s no post at this address.');
          return;
        }
        setPost({
          slug: found.slug,
          date: toDateInput(found.date),
          draft: found.draft,
          on: { ar: Boolean(found.ar), en: Boolean(found.en) },
          versions: { ar: found.ar ?? blankVersion(), en: found.en ?? blankVersion() },
        });
      })
      .catch(() => live && setError('Couldn’t load this post.'));
    return () => {
      live = false;
    };
  }, [existingSlug, isNew]);

  // Leaving the page with unsaved work asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!post) {
    return error ? (
      <>
        <p className="form__error">{error}</p>
        <Link className="button button--quiet" to="/posts">
          All posts
        </Link>
      </>
    ) : (
      <p className="empty">Loading…</p>
    );
  }

  const change = (next: Partial<Draft>) => {
    setPost({ ...post, ...next });
    setDirty(true);
    setSaved(false);
  };

  const changeVersion = (lang: Lang, field: keyof PostVersion, value: string) =>
    change({ versions: { ...post.versions, [lang]: { ...post.versions[lang], [field]: value } } });

  function problem(): string {
    if (!SLUG_PATTERN.test(post!.slug)) {
      return 'The address can only use lowercase English letters, numbers and single hyphens, like my-first-post.';
    }
    if (!post!.date) return 'Pick a date.';
    const on = LANGS.filter((l) => post!.on[l]);
    if (on.length === 0) return 'Switch on at least one language.';
    for (const lang of on) {
      const v = post!.versions[lang];
      if (!v.title.trim() || !v.description.trim() || !v.body.trim()) {
        return `The ${IN_ENGLISH[lang]} version needs a title, a description and some text — or switch it off.`;
      }
    }
    return '';
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const issue = problem();
    if (issue) {
      setError(issue);
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (isNew && (await postExists(post!.slug))) {
        setError('A post already lives at this address. Pick another.');
        setBusy(false);
        return;
      }
      const version = (lang: Lang) => {
        if (!post!.on[lang]) return null;
        const v = post!.versions[lang];
        return { title: v.title.trim(), description: v.description.trim(), body: v.body };
      };
      await savePost({
        slug: post!.slug,
        date: fromDateInput(post!.date),
        draft: post!.draft,
        ar: version('ar'),
        en: version('en'),
      });
      setDirty(false);
      setSaved(true);
      if (isNew) navigate(`/posts/${post!.slug}`, { replace: true });
    } catch {
      setError('Couldn’t save. Check the connection, and that this account is an admin.');
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm('Delete this post for good? It comes off the site and can’t be brought back.')) return;
    setBusy(true);
    try {
      await deletePost(post!.slug);
      setDirty(false);
      navigate('/posts', { replace: true });
    } catch {
      setError('Couldn’t delete. Check the connection.');
      setBusy(false);
    }
  }

  const version = post.versions[tab];
  const dir = tab === 'ar' ? 'rtl' : 'ltr';

  return (
    <form className="form editor" onSubmit={submit} noValidate>
      <header className="screen__head">
        <div>
          <Link className="mono back" to="/posts">
            ← All posts
          </Link>
          <h1 className="screen__title">
            {isNew ? 'New post' : 'Edit post'}
            <span className="dot">.</span>
          </h1>
        </div>
        <div className="form__actions">
          {!isNew && (
            <button className="button button--danger" type="button" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      {saved && !dirty && <p className="form__note">Saved.</p>}

      <div className="editor__meta">
        <label className="field">
          <span className="mono">Address</span>
          <span className="slug">
            <span className="slug__prefix mono">/blog/</span>
            <input
              value={post.slug}
              onChange={(e) => change({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="my-first-post"
              disabled={!isNew}
              dir="ltr"
              spellCheck={false}
            />
          </span>
        </label>
        <DateField label="Date" value={post.date} onChange={(date) => change({ date })} />
        <label className="toggle">
          <input type="checkbox" checked={post.draft} onChange={(e) => change({ draft: e.target.checked })} />
          <span>Draft — keep it off the live site</span>
        </label>
      </div>

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
            {!post.on[lang] && <span className="mono tabs__off">off</span>}
          </button>
        ))}
      </div>

      <div className="version" role="tabpanel">
        <label className="toggle">
          <input
            type="checkbox"
            checked={post.on[tab]}
            onChange={(e) => change({ on: { ...post.on, [tab]: e.target.checked } })}
          />
          <span>Publish in {IN_ENGLISH[tab]}</span>
        </label>

        <fieldset className="version__fields" disabled={!post.on[tab]}>
          <label className="field">
            <span className="mono">Title</span>
            <input
              className="input--title"
              dir={dir}
              lang={tab}
              value={version.title}
              onChange={(e) => changeVersion(tab, 'title', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="mono">Description — one or two lines, shown in the list and in search results</span>
            <textarea
              dir={dir}
              lang={tab}
              rows={2}
              value={version.description}
              onChange={(e) => changeVersion(tab, 'description', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="mono">Text — Markdown: ## for a heading, - for a list, [words](link) for a link</span>
            <textarea
              className="input--body"
              dir={dir}
              lang={tab}
              rows={18}
              value={version.body}
              onChange={(e) => changeVersion(tab, 'body', e.target.value)}
            />
          </label>
        </fieldset>
      </div>
    </form>
  );
}
