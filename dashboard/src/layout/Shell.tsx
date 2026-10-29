import { useState, type ReactNode } from 'react';
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

  On a narrow screen the sidebar folds into a bar with a menu button;
  choosing anything in the menu folds it away again.
*/
export default function Shell() {
  const { state, signOut } = useAuth();
  const email = state.status === 'admin' ? (state.user.email ?? '') : '';
  const { messages } = useMessages();
  const unread = messages?.filter((m) => !m.read).length ?? 0;
  const [open, setOpen] = useState(false);

  return (
    <div className={`shell ${open ? 'shell--open' : ''}`}>
      <aside className="side">
        <div className="side__bar">
          <Wordmark />
          <button
            type="button"
            className="side__menu mono"
            aria-expanded={open}
            aria-controls="side-panel"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* A click on any link inside closes the menu on a narrow screen. */}
        <div className="side__panel" id="side-panel" onClick={(e) => (e.target as Element).closest('a') && setOpen(false)}>
          <nav className="side__nav" aria-label="Sections">
            <ul className="side__list">
              <Item to="/" end mark={<Glyph d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" />}>
                Overview
              </Item>
              <Item to="/messages" mark={<Glyph d="M2.5 4h11v8h-11zM2.5 4.5 8 9l5.5-4.5" />} count={unread}>
                Messages
              </Item>
            </ul>

            <p className="side__group mono">
              Site <span className="side__tally">{SECTIONS.length}</span>
            </p>
            <ul className="side__list">
              {SECTIONS.map((s, i) => (
                <Item key={s.id} to={`/content/${s.id}`} mark={String(i + 1).padStart(2, '0')}>
                  {s.title}
                </Item>
              ))}
            </ul>

            <p className="side__group mono">Work</p>
            <ul className="side__list">
              <Item to="/projects" mark={<Glyph d="M2.5 5h11v8h-11zM6 5V3h4v2M2.5 8.5h11" />}>
                Projects
              </Item>
            </ul>

            <p className="side__group mono">Blog</p>
            <ul className="side__list">
              <Item to="/posts" mark={<Glyph d="M10.5 3 13 5.5 6 12.5H3.5V10zM9 4.5l2.5 2.5" />}>
                Posts
              </Item>
            </ul>
          </nav>

          <div className="side__foot">
            <PublishButton email={email} />
            <div className="side__account">
              <span className="side__avatar" aria-hidden="true">
                {email.charAt(0).toUpperCase() || '·'}
              </span>
              <span className="side__email" title={email}>
                {email}
              </span>
              <NavLink to="/settings" className="side__tool" aria-label="Settings" title="Settings">
                <Glyph d="M8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
              </NavLink>
              <button type="button" className="side__tool" aria-label="Sign out" title="Sign out" onClick={signOut}>
                <Glyph d="M6.5 2.5h-4v11h4M10 5l3 3-3 3M13 8H6" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="screen">
        <Outlet />
      </main>
    </div>
  );
}

/** One line of the sidebar: its mark (a number or a small drawing), its name, and the dot when it's open. */
function Item({
  to,
  end,
  mark,
  count = 0,
  children,
}: {
  to: string;
  end?: boolean;
  mark: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <li>
      <NavLink to={to} end={end} className="side__link">
        <span className="side__mark" aria-hidden="true">
          {mark}
        </span>
        <span className="side__name">{children}</span>
        {count > 0 && (
          <span className="side__count" aria-label={`${count} unread`}>
            {count}
          </span>
        )}
      </NavLink>
    </li>
  );
}

/** A small line drawing on a 16-unit grid, drawn in the text's colour. */
function Glyph({ d }: { d: string }) {
  return (
    <svg className="glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
