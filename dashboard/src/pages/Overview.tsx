import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { usePosts } from './posts/usePosts';
import { titleOf } from '../lib/posts';
import { sectionDates } from '../lib/content';
import { SECTIONS } from '../content/sections';
import { importAll, waitingPosts, type ImportResult } from '../content/importAll';

const when = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Where the dashboard opens: every section of the site, then the latest posts. */
export default function Overview() {
  const [version, setVersion] = useState(0);
  const { posts, error } = usePosts(version);
  const [dates, setDates] = useState<Record<string, Date | null> | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState('');
  /** Posts written as files, not brought in yet. */
  const [waiting, setWaiting] = useState<string[]>([]);

  useEffect(() => {
    sectionDates()
      .then(setDates)
      .catch(() => setDates({}));
    waitingPosts()
      .then(setWaiting)
      .catch(() => setWaiting([]));
  }, [version]);

  const unsaved = dates ? SECTIONS.filter((s) => !(s.id in dates)).length : 0;
  const waitingCount = waiting.length;

  async function bringIn() {
    setImporting(true);
    setImportError('');
    try {
      setImported(await importAll());
      setVersion((v) => v + 1);
    } catch {
      setImportError('Couldn’t bring everything in. Check the connection, and that the security rules are published.');
    }
    setImporting(false);
  }

  return (
    <>
      <header className="screen__head">
        <div>
          <h1 className="screen__title">
            Overview<span className="dot">.</span>
          </h1>
          <p className="screen__lead">
            Everything on the site, section by section. Saved changes go live the next time the site is built.
          </p>
        </div>
      </header>

      {error && <p className="form__error">{error}</p>}

      {dates && unsaved > 0 && !imported && (
        <section className="import">
          <div>
            <h2 className="import__title">Bring in the site as it is</h2>
            <p className="import__text">
              {unsaved === SECTIONS.length ? 'None' : `${SECTIONS.length - unsaved} of ${SECTIONS.length}`} of the
              site’s sections are saved here yet. This saves every one that isn’t, exactly as the site shows it now,
              along with the blog posts written as files. Nothing already saved here is changed.
            </p>
          </div>
          <button className="button" type="button" onClick={bringIn} disabled={importing}>
            {importing ? 'Bringing it in…' : 'Bring everything in'}
          </button>
        </section>
      )}
      {dates && unsaved === 0 && waitingCount > 0 && !imported && (
        <section className="import">
          <div>
            <h2 className="import__title">
              {waitingCount} new post{waitingCount > 1 ? 's' : ''} written as files
            </h2>
            <p className="import__text">
              They aren’t in the dashboard yet. This brings them in as they are, drafts staying drafts, so you can read
              them in Posts, edit them, and publish the ones you want. Nothing already here is changed.
            </p>
          </div>
          <button className="button" type="button" onClick={bringIn} disabled={importing}>
            {importing ? 'Bringing them in…' : 'Bring them in'}
          </button>
        </section>
      )}
      {importError && <p className="form__error">{importError}</p>}
      {imported && (
        <p className="form__note">
          Done.{' '}
          {imported.sections.length > 0 && `Saved ${imported.sections.length} sections (${imported.sections.join(', ')}). `}
          {imported.posts.length > 0 && `Brought in ${imported.posts.length} post${imported.posts.length > 1 ? 's' : ''}. `}
          {imported.sections.length === 0 && imported.posts.length === 0 && 'Everything was already here.'}
        </p>
      )}

      <section className="panel">
        <div className="panel__head">
          <h2 className="mono">Site</h2>
        </div>
        <ul className="cards">
          {SECTIONS.map((s) => {
            const at = dates?.[s.id];
            return (
              <li key={s.id}>
                <Link className="card" to={`/content/${s.id}`}>
                  <span className="card__title">{s.title}</span>
                  <span className="card__desc">{s.description}</span>
                  <span className="mono card__meta">
                    {!dates ? '…' : s.id in dates ? (at ? `Saved ${when(at)}` : 'Saved') : 'Site’s current text'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="mono">
            Latest posts
            {posts && ` · ${posts.filter((p) => !p.draft).length} live, ${posts.filter((p) => p.draft).length} drafts`}
          </h2>
          <Link className="button button--quiet" to="/posts/new">
            New post
          </Link>
        </div>
        {posts && posts.length === 0 && <p className="empty">No posts yet.</p>}
        <ul className="rows">
          {posts?.slice(0, 5).map((post) => (
            <li key={post.slug}>
              <Link className="row" to={`/posts/${post.slug}`}>
                <span className="row__title" dir="auto">
                  {titleOf(post)}
                </span>
                <span className={`tag ${post.draft ? 'tag--draft' : ''}`}>{post.draft ? 'Draft' : 'Live'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
