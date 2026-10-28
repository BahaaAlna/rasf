/*
  Whether the dashboard has a Firebase project to talk to, worked out
  from .env.local (see .env.example) without loading Firebase itself.
  Firebase refuses to start without an API key, so this has to be
  checked first and on its own: main.tsx only loads the app, and with it
  Firebase, once this says yes.
*/

const env = import.meta.env;

/** VITE_USE_EMULATORS: talk to the local emulators instead of a real project. */
export const useEmulators = env.VITE_USE_EMULATORS === 'true';

export const isConfigured = useEmulators || Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
