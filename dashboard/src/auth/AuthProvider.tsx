import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

/*
  Who is signed in, and whether they may use the dashboard.

  Signing in only proves who someone is. Being an admin is a separate
  fact: a document at admins/{uid}, created by hand in the Firebase
  console. The security rules check the same document, so the screen
  and the database always agree on who is allowed.
*/

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'not-admin'; user: User }
  | { status: 'admin'; user: User };

interface AuthContextValue {
  state: AuthState;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setState({ status: 'signed-out' });
          return;
        }
        setState({ status: 'loading' });
        try {
          const admin = await getDoc(doc(db, 'admins', user.uid));
          setState(admin.exists() ? { status: 'admin', user } : { status: 'not-admin', user });
        } catch {
          // A refused read means the rules don't know this user as an admin.
          setState({ status: 'not-admin', user });
        }
      }),
    [],
  );

  return <AuthContext value={{ state, signOut: () => fbSignOut(auth) }}>{children}</AuthContext>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
