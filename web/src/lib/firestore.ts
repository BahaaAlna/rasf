/*
  Reading what the dashboard saved, while the site builds: the site's
  sections (content/*) and its published blog posts (posts/*), from
  Firestore's REST API. Both are public in the security rules, so no
  sign-in or SDK is needed.

  Nothing here may break a build. If Firestore can't be reached, or has
  nothing yet, these return empty and the site falls back to the text in
  src/data and src/content, with a warning in the build log.
*/

import { FIRESTORE as BASE } from './firebaseProject';

const TIMEOUT_MS = 8000;

/** Firestore's typed JSON for a value, as the REST API sends it. */
type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};

interface FsDocument {
  name: string;
  fields?: Record<string, FsValue>;
}

/** Firestore's typed JSON back into plain values. */
function plain(value: FsValue): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return new Date(value.timestampValue!);
  if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(plain);
  if ('mapValue' in value) return fields(value.mapValue?.fields);
  return null;
}

const fields = (f: Record<string, FsValue> = {}) =>
  Object.fromEntries(Object.entries(f).map(([key, value]) => [key, plain(value)])) as Record<string, unknown>;

const idOf = (doc: FsDocument) => doc.name.split('/').pop()!;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

function warn(what: string, error: unknown) {
  console.warn(`[firestore] Couldn't read ${what}, using the site's own copy instead: ${String(error)}`);
}

/** Every saved section, by id. */
export async function loadSections(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const { documents = [] } = await request<{ documents?: FsDocument[] }>('/content?pageSize=100');
    return Object.fromEntries(documents.map((doc) => [idOf(doc), fields(doc.fields)]));
  } catch (error) {
    warn('the site’s sections', error);
    return {};
  }
}

export interface RemotePostVersion {
  title: string;
  description: string;
  body: string;
}

export interface RemotePost {
  slug: string;
  date: Date;
  /** When it was last saved in the dashboard. */
  updated: Date | null;
  ar: RemotePostVersion | null;
  en: RemotePostVersion | null;
}

/**
 * Published posts only: drafts are refused to the public by the rules
 * anyway. Null, not empty, when Firestore couldn't be read, so the blog
 * can tell "no posts" from "no answer".
 */
export async function loadPosts(): Promise<RemotePost[] | null> {
  try {
    const rows = await request<{ document?: FsDocument }[]>(':runQuery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'posts' }],
          where: { fieldFilter: { field: { fieldPath: 'draft' }, op: 'EQUAL', value: { booleanValue: false } } },
        },
      }),
    });
    return rows
      .filter((row) => row.document)
      .map((row) => {
        const data = fields(row.document!.fields);
        return {
          slug: idOf(row.document!),
          date: data.date instanceof Date ? data.date : new Date(),
          updated: data.updatedAt instanceof Date ? data.updatedAt : null,
          ar: (data.ar as RemotePostVersion | null) ?? null,
          en: (data.en as RemotePostVersion | null) ?? null,
        };
      });
  } catch (error) {
    warn('the blog’s posts', error);
    return null;
  }
}
