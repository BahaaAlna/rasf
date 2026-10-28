import { useState } from 'react';
import { deleteMessage, setRead, useMessages, type Message } from '../lib/messages';

/*
  Everything sent from the website's contact form, newest first, unread
  ones marked with the dot. Opening one marks it read; from there it can
  be answered by email, marked unread again, or deleted.
*/

const when = (date: Date | null) =>
  date ? date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now';

type Filter = 'all' | 'unread';

export default function Messages() {
  const { messages, error } = useMessages();
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [problem, setProblem] = useState('');

  const unread = messages?.filter((m) => !m.read).length ?? 0;
  const shown = messages?.filter((m) => filter === 'all' || !m.read) ?? [];

  const act = async (work: Promise<void>) => {
    setProblem('');
    try {
      await work;
    } catch {
      setProblem('Couldn’t do that. Check the connection, and that this account is an admin.');
    }
  };

  function toggle(message: Message) {
    const opening = open !== message.id;
    setOpen(opening ? message.id : null);
    if (opening && !message.read) act(setRead(message.id, true));
  }

  function remove(message: Message) {
    if (!window.confirm(`Delete the message from ${message.name}? It can’t be brought back.`)) return;
    if (open === message.id) setOpen(null);
    act(deleteMessage(message.id));
  }

  return (
    <>
      <header className="screen__head">
        <div>
          <h1 className="screen__title">
            Messages<span className="dot">.</span>
          </h1>
          <p className="screen__lead">
            What visitors send from the contact form, as it arrives.
            {messages && ` ${messages.length} in all, ${unread} unread.`}
          </p>
        </div>
        <div className="tabs tabs--pills" role="tablist" aria-label="Show">
          {(['all', 'unread'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className="tabs__tab"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : `Unread${unread ? ` (${unread})` : ''}`}
            </button>
          ))}
        </div>
      </header>

      {(error || problem) && <p className="form__error">{error || problem}</p>}
      {!messages && !error && <p className="empty">Loading…</p>}
      {messages && shown.length === 0 && (
        <p className="empty">{filter === 'unread' ? 'Nothing unread.' : 'No messages yet.'}</p>
      )}

      <ul className="messages">
        {shown.map((m) => {
          const isOpen = open === m.id;
          return (
            <li key={m.id} className={`message ${m.read ? '' : 'message--unread'} ${isOpen ? 'message--open' : ''}`}>
              <button type="button" className="message__head" onClick={() => toggle(m)} aria-expanded={isOpen}>
                <span className="message__dot" aria-label={m.read ? undefined : 'Unread'} />
                <span className="message__from">
                  <span className="message__name" dir="auto">
                    {m.name}
                  </span>
                  <span className="mono message__email">{m.email}</span>
                </span>
                <span className="message__preview" dir="auto">
                  {m.message || m.needs.join(' · ') || '—'}
                </span>
                <span className="mono message__when">{when(m.createdAt)}</span>
              </button>

              {isOpen && (
                <div className="message__body">
                  {m.needs.length > 0 && (
                    <ul className="message__needs" aria-label="What they need">
                      {m.needs.map((need) => (
                        <li key={need} className="tag tag--draft" dir="auto">
                          {need}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="message__text" dir="auto" lang={m.locale}>
                    {m.message || <span className="empty">No message, only the choices above.</span>}
                  </p>
                  <p className="mono">
                    Sent from the {m.locale === 'ar' ? 'Arabic' : 'English'} site · {when(m.createdAt)}
                  </p>
                  <div className="form__actions">
                    <a className="button" href={`mailto:${m.email}?subject=${encodeURIComponent('Rasf')}`}>
                      Reply by email
                    </a>
                    <button type="button" className="button button--quiet" onClick={() => act(setRead(m.id, false))}>
                      Mark unread
                    </button>
                    <button type="button" className="button button--danger" onClick={() => remove(m)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
