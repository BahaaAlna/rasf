import { useState } from 'react';
import { Link } from 'react-router';
import { publish, usePublishState } from '../lib/publish';

/*
  At the foot of the sidebar, always in reach: whether the site is up to
  date with what's saved here, and the button that builds it again. The
  dot beside the label turns blue when there's something not yet live.
*/

const when = (date: Date) =>
  date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function PublishButton({ email }: { email: string }) {
  const { state, error } = usePublishState();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [sentAt, setSentAt] = useState<Date | null>(null);

  if (error) {
    return (
      <div className="publish">
        <p className="publish__note publish__note--problem">{error}</p>
      </div>
    );
  }
  if (!state) return null;

  if (!state.hook) {
    return (
      <div className="publish">
        <p className="publish__status">
          <span className="publish__dot" aria-hidden="true" />
          Not connected yet
        </p>
        <Link className="button publish__button" to="/settings">
          Set up publishing
        </Link>
      </div>
    );
  }

  const pending =
    !state.lastPublishedAt || (state.lastChangeAt !== null && state.lastChangeAt > state.lastPublishedAt);

  async function go() {
    if (!state?.hook) return;
    setBusy(true);
    setProblem('');
    try {
      await publish(state.hook, email);
      setSentAt(new Date());
    } catch {
      setProblem('Couldn’t reach Cloudflare. Check the connection and try again.');
    }
    setBusy(false);
  }

  return (
    <div className="publish">
      <p className={`publish__status ${problem ? 'publish__status--problem' : ''}`} role="status">
        <span className={`publish__dot ${pending || sentAt ? 'publish__dot--pending' : ''}`} aria-hidden="true" />
        {problem ||
          (sentAt
            ? 'Building now, live in a minute or two'
            : pending
              ? 'Changes not live yet'
              : `Up to date${state.lastPublishedAt ? ` · ${when(state.lastPublishedAt)}` : ''}`)}
      </p>
      <button className="button publish__button" type="button" onClick={go} disabled={busy}>
        {busy ? 'Publishing…' : 'Publish site'}
      </button>
    </div>
  );
}
