import Notice from './Notice';

/** Shown instead of the app until .env.local names a Firebase project. */
export default function ConnectFirebase() {
  return (
    <Notice title="Connect Firebase">
      <p>
        The dashboard has no Firebase project yet. Copy <code>.env.example</code> to <code>.env.local</code> in the{' '}
        <code>dashboard</code> folder, fill in your web app's settings from the Firebase console, and restart{' '}
        <code>npm run dev</code>.
      </p>
      <p>
        Every step is in <code>dashboard/README.md</code>, under “Setting up Firebase”.
      </p>
    </Notice>
  );
}
