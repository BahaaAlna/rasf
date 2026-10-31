import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import FieldEditor from '../content/FieldEditor';
import SharePreview from '../../components/SharePreview';
import type { Field } from '../../content/fields';
import { LANG_NAMES, LANGS, type Lang } from '../../lib/posts';
import { blankProject, getProjects, HOME_LIMIT, isSlug, nameOf, saveProjects, type Project } from '../../lib/projects';

/*
  One project on a page of its own, in four parts: what's the same in
  both languages, its pictures, its words in Arabic and English, one tab
  each, and how its link will look when shared, in the tab's language. Saving reads the list fresh and puts this project back in its
  place, so two screens never undo each other's work.
*/

const DETAILS: Field[] = [
  {
    kind: 'choice',
    key: 'category',
    label: 'Listed under',
    hint: 'Which page under Work shows it. Every project also shows on the home page.',
    options: [
      { value: 'software', label: 'Software' },
      { value: 'design', label: 'Designs' },
    ],
  },
  { kind: 'text', key: 'link', label: 'Live link', ltr: true, hint: 'The finished site, if it can be visited. Empty for none.' },
  { kind: 'text', key: 'year', label: 'Year' },
  {
    kind: 'switch',
    key: 'featured',
    label: 'Show on the home page',
    hint: `The home page shows up to ${HOME_LIMIT} projects, in the list’s order.`,
  },
  {
    kind: 'text',
    key: 'slug',
    label: 'Page address',
    ltr: true,
    hint: 'Its page: /work/<this>. Lowercase letters, digits and hyphens.',
  },
];

const PICTURES: Field[] = [
  { kind: 'text', key: 'image', label: 'Picture', ltr: true, hint: 'Beside it in lists and at the top of its page. A path like /work/name.jpg, about 4:3.' },
  { kind: 'lines', key: 'gallery', label: 'More pictures', ltr: true, hint: 'One path per line, shown after the text on its page.' },
  {
    kind: 'choice',
    key: 'galleryView',
    label: 'How they’re shown',
    hint: 'A MacBook shows them on its screen one at a time, with arrows, like a deck: best for slides at 16:9.',
    options: [
      { value: 'grid', label: 'Two columns' },
      { value: 'laptop', label: 'MacBook' },
    ],
  },
];

const WORDS: Field[] = [
  { kind: 'text', key: 'name', label: 'Name' },
  { kind: 'text', key: 'kind', label: 'Kind of work', hint: 'Website, web app, online store, identity…' },
  { kind: 'text', key: 'summary', label: 'Summary', long: true, hint: 'One or two sentences, beside its picture on the Software and Designs pages.' },
  {
    kind: 'text',
    key: 'body',
    label: 'Text on its page',
    long: true,
    hint: 'A blank line between paragraphs. ## starts a heading, - a list item, [words](https://…) a link.',
  },
  { kind: 'lines', key: 'scope', label: 'What we did', hint: 'One per line, beside the text on its page.' },
];

/** A fresh editor per project, so moving between them starts clean. */
export default function ProjectRoute() {
  const { slug = '' } = useParams();
  return <ProjectEditor key={slug} slug={slug} />;
}

function ProjectEditor({ slug }: { slug: string }) {
  const isNew = slug === '';
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(isNew ? blankProject() : null);
  const [tab, setTab] = useState<Lang>('ar');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let live = true;
    getProjects()
      .then(({ projects }) => {
        if (!live) return;
        const found = projects.find((p) => p.slug === slug);
        if (found) setProject(structuredClone(found));
        else setMissing(true);
      })
      .catch(() => live && setError('Couldn’t load this project. Check the connection.'));
    return () => {
      live = false;
    };
  }, [isNew, slug]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (next: Project) => {
    setProject(next);
    setDirty(true);
    setSaved(false);
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!project) return;
    setError('');

    const address = project.slug.trim();
    if (!isSlug(address)) {
      setError('The page address needs lowercase letters, digits and hyphens only, like tarras-afamia.');
      return;
    }
    if (!project.ar.name.trim() && !project.en.name.trim()) {
      setError('Give the project a name, in Arabic or English.');
      return;
    }

    setBusy(true);
    try {
      // Fresh from the database, so a change made elsewhere isn't undone.
      const { projects } = await getProjects();
      const others = projects.filter((p) => p.slug !== slug && p.featured).length;
      if (project.featured && others >= HOME_LIMIT) {
        setError(`The home page already shows ${HOME_LIMIT} projects. Take one off in the list first.`);
        setBusy(false);
        return;
      }
      const taken = projects.some((p) => p.slug === address && p.slug !== slug);
      if (taken) {
        setError(`Another project already uses /work/${address}.`);
        setBusy(false);
        return;
      }
      const next = { ...project, slug: address };
      const at = projects.findIndex((p) => p.slug === slug);
      const list = at >= 0 && !isNew ? projects.map((p, i) => (i === at ? next : p)) : [...projects, next];
      await saveProjects(list);
      setDirty(false);
      setSaved(true);
      if (address !== slug) navigate(`/projects/${address}`, { replace: true });
    } catch {
      setError('Couldn’t save. Check the connection, and that this account is an admin.');
    }
    setBusy(false);
  }

  async function remove() {
    if (!project || isNew) return;
    if (!window.confirm(`Delete “${nameOf(project)}”? It leaves the site the next time it’s published.`)) return;
    setBusy(true);
    try {
      const { projects } = await getProjects();
      await saveProjects(projects.filter((p) => p.slug !== slug));
      setDirty(false);
      navigate('/projects');
    } catch {
      setError('Couldn’t delete. Check the connection, and that this account is an admin.');
      setBusy(false);
    }
  }

  if (missing) {
    return (
      <>
        <p className="empty">There’s no project at /work/{slug}.</p>
        <Link className="button button--quiet" to="/projects">
          All projects
        </Link>
      </>
    );
  }

  return (
    <form className="form editor" onSubmit={submit} noValidate>
      <header className="screen__head">
        <div>
          <Link className="back mono" to="/projects">
            ← All projects
          </Link>
          <h1 className="screen__title" dir="auto">
            {project && !isNew ? nameOf(project) : 'New project'}
            <span className="dot">.</span>
          </h1>
        </div>
        <div className="form__actions">
          <button className="button" type="submit" disabled={busy || !project}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      {saved && !dirty && <p className="form__note">Saved. It goes live the next time the site is published.</p>}
      {!project && !error && <p className="empty">Loading…</p>}

      {project && (
        <>
          <section className="part">
            <h2 className="part__title mono">
              <span>01</span> The project
            </h2>
            <p className="part__lead">The same in both languages.</p>
            <div className="part__grid">
              {DETAILS.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={project[f.key as keyof Project]}
                  onChange={(v) => change({ ...project, [f.key]: v })}
                />
              ))}
            </div>
          </section>

          <section className="part">
            <h2 className="part__title mono">
              <span>02</span> Pictures
            </h2>
            {PICTURES.map((f) => (
              <FieldEditor
                key={f.key}
                field={f}
                value={project[f.key as keyof Project]}
                onChange={(v) => change({ ...project, [f.key]: v })}
              />
            ))}
          </section>

          <section className="part">
            <h2 className="part__title mono">
              <span>03</span> Words
            </h2>
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
                  {!project[lang].name && <span className="tabs__empty mono"> · empty</span>}
                </button>
              ))}
            </div>
            <div className="version" role="tabpanel">
              {WORDS.map((f) => (
                <FieldEditor
                  key={`${tab}-${f.key}`}
                  field={f}
                  lang={tab}
                  value={project[tab][f.key as keyof Project['ar']]}
                  onChange={(v) => change({ ...project, [tab]: { ...project[tab], [f.key]: v } })}
                />
              ))}
            </div>
          </section>

          <section className="part">
            <h2 className="part__title mono">
              <span>04</span> When it’s shared
            </h2>
            <p className="part__lead">
              Its link in {LANG_NAMES[tab]}, as WhatsApp and X will show it, from what’s typed now. The site draws the real
              picture when it’s published.
            </p>
            <SharePreview project={project} lang={tab} />
          </section>

          {!isNew && (
            <div className="part part--end">
              <button type="button" className="button button--danger" onClick={remove} disabled={busy}>
                Delete project
              </button>
            </div>
          )}
        </>
      )}
    </form>
  );
}
