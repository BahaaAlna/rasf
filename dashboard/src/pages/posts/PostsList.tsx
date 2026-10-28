import { Link } from 'react-router';
import { usePosts } from './usePosts';
import { LANGS, titleOf } from '../../lib/posts';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Every post, newest first, with which languages it's written in. */
export default function PostsList() {
  const { posts, error } = usePosts();

  return (
    <>
      <header className="screen__head">
        <h1 className="screen__title">
          Blog<span className="dot">.</span>
        </h1>
        <Link className="button" to="/posts/new">
          New post
        </Link>
      </header>

      {error && <p className="form__error">{error}</p>}
      {!posts && !error && <p className="empty">Loading…</p>}
      {posts && posts.length === 0 && <p className="empty">No posts yet. Write the first one.</p>}

      {posts && posts.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="mono">Title</th>
              <th className="mono">Address</th>
              <th className="mono">Languages</th>
              <th className="mono">Date</th>
              <th className="mono">Status</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug}>
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
      )}
    </>
  );
}
