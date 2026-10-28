import { useState, type FormEvent } from 'react';
import { HOOK_PATTERN, saveHook, usePublishState } from '../lib/publish';

/*
  The dashboard's own settings. For now, one: the address the Publish
  button calls to build the site again, Cloudflare's deploy hook. It's
  read from Firestore, where only admins can see it.
*/
export default function Settings() {
  const { state, error } = usePublishState();
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [saved, setSaved] = useState(false);

  const hook = draft ?? state?.hook ?? '';

  async function submit(event: FormEvent) {
    event.preventDefault();
    setProblem('');
    setSaved(false);
    if (!HOOK_PATTERN.test(hook.trim())) {
      setProblem('That isn’t a Cloudflare Pages deploy hook. It starts with https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/');
      return;
    }
    setBusy(true);
    try {
      await saveHook(hook);
      setDraft(null);
      setSaved(true);
    } catch {
      setProblem('Couldn’t save. Check the connection, and that the latest Firestore rules are published.');
    }
    setBusy(false);
  }

  return (
    <form className="form editor" onSubmit={submit} noValidate>
      <header className="screen__head">
        <div>
          <h1 className="screen__title">
            Settings<span className="dot">.</span>
          </h1>
          <p className="screen__lead">How the dashboard reaches the live site.</p>
        </div>
        <div className="form__actions">
          <button className="button" type="submit" disabled={busy || !state}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {(error || problem) && (
        <p className="form__error" role="alert">
          {error || problem}
        </p>
      )}
      {saved && <p className="form__note">Saved. The Publish button in the sidebar is ready.</p>}

      <section className="shared">
        <h2 className="mono shared__title">Publishing</h2>
        <label className="field">
          <span className="mono">Deploy hook</span>
          <input
            type="url"
            dir="ltr"
            spellCheck={false}
            value={hook}
            placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…"
            onChange={(e) => {
              setDraft(e.target.value);
              setSaved(false);
            }}
          />
          <span className="field__hint">
            In Cloudflare: Workers &amp; Pages → rasf-web → Settings → Builds → Deploy hooks → Add deploy hook (any
            name, branch main). Copy the address it gives you here. Keep it to yourself: anyone with it can start a
            build.
          </span>
        </label>
      </section>
    </form>
  );
}
