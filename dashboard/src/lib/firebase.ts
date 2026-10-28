/*
  The one Firebase app the dashboard uses, and its Auth and Firestore.
  Configured from .env.local (see .env.example). With VITE_USE_EMULATORS
  it talks to the local emulators instead, so it can be run and tried
  without touching the real project.

  Imported only once config.ts says there is a project: without one,
  getAuth throws as this file loads.
*/

import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { useEmulators } from './config';

const env = import.meta.env;

export const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || (useEmulators ? 'emulator' : undefined),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  // The emulators accept any project id; this one matches .firebaserc.
  projectId: env.VITE_FIREBASE_PROJECT_ID || (useEmulators ? 'demo-rasf' : undefined),
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
