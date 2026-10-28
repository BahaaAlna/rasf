import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { SECTIONS } from '../content/sections';
import { useMessages } from '../lib/messages';
import Wordmark from './Wordmark';
import PublishButton from './PublishButton';

/*
  The frame around every signed-in screen: the overview and messages,
  every section of the site in page order, then the blog's posts; the
  publish button and the account at the foot; the screen itself beside.
  Messages carries a count of the unread ones, kept live.
*/
export default function Shell() {
  const { state, signOut } = useAuth();
  const email = state.status === 'admin' ? state.user.email : '';
  const { messages } = useMessages();
  const unread = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="shell">
      <aside className="side">
        <Wordmark />
        <nav className="side__nav" aria-label="Sections">
          <NavLink to="/" end className="side__link">
            Overview
          </NavLink>
          <NavLink to="/messages" className="side__link side__link--count">
            Messages
            {unread > 0 && <span className="side__count">{unread}</span>}
          </NavLink>

          <p className="mono side__group">Site</p>
          {SECTIONS.map((s) => (
            <NavLink key={s.id} to={`/content/${s.id}`} className="side__link">
              {s.title}
            </NavLink>
          ))}

          <p className="mono side__group">Blog</p>
          <NavLink to="/posts" className="side__link">
            Posts
          </NavLink>
        </nav>
        <PublishButton email={email ?? ''} />
        <div className="side__account">
          <p className="mono side__email">{email}</p>
          <NavLink to="/settings" className="side__settings mono">
            Settings
          </NavLink>
          <button className="button button--quiet" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="screen">
        <Outlet />
      </main>
    </div>
  );
}
