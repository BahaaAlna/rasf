/*
  What visitors send from the website's contact form: one document per
  message in `messages`, written by the form itself (see the website's
  Contact section). Watched live, so a new one shows up without a reload.
*/

import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Message {
  id: string;
  name: string;
  email: string;
  /** Which choices they ticked: services, "a question", "something else". */
  needs: string[];
  message: string;
  /** The language of the page they sent it from. */
  locale: 'ar' | 'en';
  createdAt: Date | null;
  read: boolean;
}

const messages = collection(db, 'messages');

function fromDoc(id: string, data: Record<string, unknown>): Message {
  return {
    id,
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    needs: Array.isArray(data.needs) ? data.needs.map(String) : [],
    message: String(data.message ?? ''),
    locale: data.locale === 'en' ? 'en' : 'ar',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    read: Boolean(data.read),
  };
}

/** Every message, newest first, kept up to date as they arrive. */
export function useMessages() {
  const [list, setList] = useState<Message[] | null>(null);
  const [error, setError] = useState('');

  useEffect(
    () =>
      onSnapshot(
        query(messages, orderBy('createdAt', 'desc')),
        (snap) => setList(snap.docs.map((d) => fromDoc(d.id, d.data()))),
        (e) =>
          setError(
            e.code === 'permission-denied'
              ? 'Firebase isn’t letting the dashboard read messages yet. Publish the latest dashboard/firestore.rules in the Firebase console (Firestore → Rules), then reload.'
              : 'Couldn’t load the messages. Check the connection, then reload.',
          ),
      ),
    [],
  );

  return { messages: list, error };
}

export const setRead = (id: string, read: boolean) => updateDoc(doc(messages, id), { read });

export const deleteMessage = (id: string) => deleteDoc(doc(messages, id));
