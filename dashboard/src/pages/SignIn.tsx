import { useState, type FormEvent } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../lib/firebase';
import Notice from '../layout/Notice';

/*
  Email and password only. Accounts aren't created here: they're added in
  the Firebase console (Authentication → Users), so nobody can sign
  themselves up.
*/

// Projects with email enumeration protection (the default) only ever say
// invalid-credential; older projects and the emulator say which part was wrong.
const NO_MATCH = 'That email and password don’t match an account.';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': NO_MATCH,
  'auth/wrong-password': NO_MATCH,
  'auth/user-not-found': NO_MATCH,
  'auth/invalid-email': 'That doesn’t look like an email address.',
  'auth/too-many-requests': 'Too many tries. Wait a few minutes, or reset the password.',
  'auth/network-request-failed': 'Couldn’t reach Firebase. Check the connection.',
};

const explain = (error: unknown) =>
  (error instanceof FirebaseError && MESSAGES[error.code]) || 'Something went wrong. Try again.';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNote('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(explain(e));
      setBusy(false);
    }
  }

  async function reset() {
    setError('');
    setNote('');
    if (!email.trim()) {
      setError('Enter your email first, then ask for the reset link.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNote('If that account exists, a reset link is on its way.');
    } catch (e) {
      setError(explain(e));
    }
  }

  return (
    <Notice title="Sign in">
      <form className="form signin" onSubmit={submit}>
        <label className="field">
          <span className="mono">Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span className="mono">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}
        {note && <p className="form__note">{note}</p>}
        <div className="form__actions">
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <button className="button button--quiet" type="button" onClick={reset}>
            Forgot password
          </button>
        </div>
      </form>
    </Notice>
  );
}
