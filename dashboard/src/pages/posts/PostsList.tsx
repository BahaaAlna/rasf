import { Link, useSearchParams } from 'react-router';
import { usePosts } from './usePosts';
import { LANGS, titleOf } from '../../lib/posts';
import Pager from '../../layout/Pager';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** As on the website's blog: eight posts to a page. */
const PER_PAGE = 8;

/**
 * Every post, newest first, numbered, eight to a page as on the site,
 * with which languages it's written in. The page is in the address
 * (?page=2), so a refresh or the back button lands on the same one.
 */
export default function PostsList() {
  const { posts, error } = usePosts();
  const [params, setParams] = useSearchParams();

  // Same-day posts in a fixed order, the website's: by address.
  const sorted = posts
    ? [...posts].sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.slug.localeCompare(b.slug))
    : [];
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1));
  const first = (page - 1) * PER_PAGE;
  const shown = sorted.slice(first, first + PER_PAGE);
  const drafts = sorted.filter((p) => p.draft).length;

  const go = (n: number) => {
    setParams(n > 1 ? { page: String(n) } : {});
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <header className="screen__head">
        <div>
          <h1 className="screen__title">
            Blog<span className="dot">.</span>
          </h1>
          {posts && posts.length > 0 && (
            <p className="screen__lead mono">
              {posts.length} posts · {posts.length - drafts} live · {drafts} drafts
            </p>
          )}
        </div>
        <Link className="button" to="/posts/new">
          New post
        </Link>
      </header>

      {error && <p className="form__error">{error}</p>}
      {!posts && !error && <p className="empty">Loading…</p>}
      {posts && posts.length === 0 && <p className="empty">No posts yet. Write the first one.</p>}

      {posts && posts.length > 0 && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th className="mono table__num">No.</th>
                <th className="mono">Title</th>
                <th className="mono">Address</th>
                <th className="mono">Languages</th>
                <th className="mono">Date</th>
                <th className="mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((post, i) => (
                <tr key={post.slug}>
                  <td className="mono table__num">{String(first + i + 1).padStart(2, '0')}</td>
                  <td>
                    <Link className="table__title" to={`/posts/${post.slug}`} dir="auto">
                      {titleOf(post)}
                    </Link>
                  </td>
                  <td className="mono">/blog/{post.slug}</td>
                  <td className="mono">
                    {LANGS.filter((l) => post[l])
                      .map((l) => l.toUpperCase())
                      .join(' · ')}
                  </td>
                  <td className="mono">{formatDate(post.date)}</td>
                  <td>
                    <span className={`tag ${post.draft ? 'tag--draft' : ''}`}>{post.draft ? 'Draft' : 'Live'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pager page={page} pages={pages} onChange={go} />
        </>
      )}
    </>
  );
}
