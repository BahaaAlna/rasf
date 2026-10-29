import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from './auth/AuthProvider';
import Shell from './layout/Shell';
import Notice from './layout/Notice';
import SignIn from './pages/SignIn';
import Overview from './pages/Overview';
import PostsList from './pages/posts/PostsList';
import PostEditor from './pages/posts/PostEditor';
import SectionEditor from './pages/content/SectionEditor';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import ProjectsList from './pages/work/ProjectsList';
import ProjectEditor from './pages/work/ProjectEditor';

/*
  Every screen sits behind the same gate: someone must be signed in, and
  they must be an admin. Each failed step gets its own plain explanation
  instead of a blank page. (Before either, main.tsx checks there's a
  Firebase project at all.)
*/
export default function App() {
  const { state, signOut } = useAuth();

  if (state.status === 'loading') return <Notice title="Loading…" />;

  if (state.status === 'signed-out') return <SignIn />;

  if (state.status === 'not-admin') {
    return (
      <Notice title="Not an admin">
        <p>
          You're signed in as <strong>{state.user.email}</strong>, but this account can't use the dashboard yet. In
          the Firebase console, create a document in the <code>admins</code> collection whose ID is this user's UID:
        </p>
        <p>
          <code className="notice__uid">{state.user.uid}</code>
        </p>
        <button className="button button--quiet" type="button" onClick={signOut}>
          Sign out
        </button>
      </Notice>
    );
  }

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Overview />} />
        <Route path="content/:id" element={<SectionEditor />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/new" element={<ProjectEditor />} />
        <Route path="projects/:slug" element={<ProjectEditor />} />
        <Route path="posts" element={<PostsList />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:slug" element={<PostEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
