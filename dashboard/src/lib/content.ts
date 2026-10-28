/*
  The site's sections in Firestore: one document per section in
  `content`, its id the section's (see content/sections.ts). Anyone may
  read them, since the website builds from them; only admins write.
*/

import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { SectionDoc } from '../content/fields';

const content = collection(db, 'content');

export interface Stored {
  doc: SectionDoc;
  updatedAt: Date | null;
}

/** The section as saved, or null if it was never saved. */
export async function getSection(id: string): Promise<Stored | null> {
  const snap = await getDoc(doc(content, id));
  if (!snap.exists()) return null;
  const { updatedAt, ...rest } = snap.data();
  return {
    doc: rest as SectionDoc,
    updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : null,
  };
}

export async function saveSection(id: string, value: SectionDoc): Promise<void> {
  await setDoc(doc(content, id), { ...value, updatedAt: serverTimestamp() });
}

/** When each saved section last changed, for the overview. */
export async function sectionDates(): Promise<Record<string, Date | null>> {
  const snap = await getDocs(content);
  return Object.fromEntries(
    snap.docs.map((d) => {
      const at = d.data().updatedAt;
      return [d.id, at instanceof Timestamp ? at.toDate() : null];
    }),
  );
}
