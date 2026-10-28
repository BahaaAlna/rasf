/*
  Publishing: the website is built ahead of time, so what's saved here
  reaches it only when it's built again. Cloudflare Pages gives each
  project a deploy hook, a secret address that starts a new build when
  something calls it; the Publish button calls it.

  The hook lives in Firestore at settings/publish, which only admins can
  read (see firestore.rules), never in the dashboard's code, where anyone
  could find it. Next to it: when it was last called, and by whom, so the
  dashboard can say whether anything has changed since.
*/

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const settings = doc(db, 'settings', 'publish');

/** What a Cloudflare Pages deploy hook looks like. */
export const HOOK_PATTERN = /^https:\/\/api\.cloudflare\.com\/client\/v4\/pages\/webhooks\/deploy_hooks\/[\w-]+$/;

export interface PublishState {
  /** Null until it's been set in Settings. */
  hook: string | null;
  lastPublishedAt: Date | null;
  lastPublishedBy: string | null;
  /** The newest save of any section or post. */
  lastChangeAt: Date | null;
}

const dateOf = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null);

const newest = (dates: (Date | null)[]) =>
  dates.reduce<Date | null>((a, b) => (b && (!a || b > a) ? b : a), null);

/**
 * The publishing settings and when anything last changed, kept live: a
 * save anywhere in the dashboard shows up here as soon as it's made.
 */
export function usePublishState() {
  const [state, setState] = useState<PublishState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let current: Omit<PublishState, 'lastChangeAt'> | null = null;
    let content: (Date | null)[] = [];
    let posts: (Date | null)[] = [];
    const update = () =>
      current && setState({ ...current, lastChangeAt: newest([...content, ...posts]) });
    const fail = () => setError('Couldn’t read the publishing settings. Publish the latest Firestore rules.');

    const stops = [
      onSnapshot(
        settings,
        (snap) => {
          const data = snap.data() ?? {};
          current = {
            hook: typeof data.hook === 'string' && data.hook ? data.hook : null,
            lastPublishedAt: dateOf(data.lastPublishedAt),
            lastPublishedBy: typeof data.lastPublishedBy === 'string' ? data.lastPublishedBy : null,
          };
          update();
        },
        fail,
      ),
      onSnapshot(
        collection(db, 'content'),
        (snap) => {
          content = snap.docs.map((d) => dateOf(d.data().updatedAt));
          update();
        },
        fail,
      ),
      onSnapshot(
        collection(db, 'posts'),
        (snap) => {
          posts = snap.docs.map((d) => dateOf(d.data().updatedAt));
          update();
        },
        fail,
      ),
    ];
    return () => stops.forEach((stop) => stop());
  }, []);

  return { state, error };
}

export async function saveHook(hook: string): Promise<void> {
  await setDoc(settings, { hook: hook.trim() }, { merge: true });
}

/**
 * Ask Cloudflare to build the site again. The hook doesn't let a browser
 * read its answer (no CORS), so the request is sent without waiting for
 * one: it either goes, or the network fails and this throws.
 */
export async function publish(hook: string, by: string): Promise<void> {
  await fetch(hook, { method: 'POST', mode: 'no-cors' });
  await setDoc(settings, { lastPublishedAt: serverTimestamp(), lastPublishedBy: by }, { merge: true });
}
