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

  if (error) return <p className="publish__note publish__note--problem">{error}</p>;
  if (!state) return null;

  if (!state.hook) {
    return (
      <div className="publish">
        <Link className="button publish__button" to="/settings">
          Set up publishing
        </Link>
        <p className="publish__note">Connect the site’s Cloudflare build once, in Settings.</p>
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
      <button className="button publish__button" type="button" onClick={go} disabled={busy}>
        <span className={`publish__dot ${pending ? 'publish__dot--pending' : ''}`} aria-hidden="true" />
        {busy ? 'Publishing…' : 'Publish site'}
      </button>
      <p className={`publish__note ${problem ? 'publish__note--problem' : ''}`} role="status">
        {problem ||
          (sentAt
            ? 'Building now. Live in a minute or two.'
            : pending
              ? 'Changes not live yet.'
              : `Up to date${state.lastPublishedAt ? ` · ${when(state.lastPublishedAt)}` : ''}.`)}
      </p>
    </div>
  );
}
