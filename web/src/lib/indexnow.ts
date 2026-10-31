/*
  IndexNow: telling Bing (and Yandex, Seznam, Naver, which share it) the
  moment a page is new, changed or gone, instead of waiting for them to
  crawl. Runs once the build is done, on Cloudflare's production builds
  only, never on a build on your own computer.

  What changed is found by comparing the sitemap just built with the one
  the live site still serves: a page only in the new one is new, one
  whose lastmod moved has changed, one only in the old is gone. A post
  saved again in the dashboard gets a new lastmod, so it's sent.

  The key proves the site is ours: the engines fetch /{KEY}.txt and find
  the same key inside. It isn't a secret; every visitor can read it.

  Nothing here may break a build. If the live sitemap or IndexNow can't
  be reached, it says so in the build log and the site deploys anyway.
*/

import { readdir, readFile } from 'node:fs/promises';
import type { AstroIntegration } from 'astro';

const KEY = '364cccd842a38f85cd70a2affd2a5e89';
const TIMEOUT_MS = 8000;

/** Each page in a sitemap, by address, with its lastmod (or ''). */
function pages(xml: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const [, url] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = url.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (loc) found.set(loc, url.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '');
  }
  return found;
}

const sitemapsIn = (index: string) => [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.text();
}

/** The pages the live site lists, before this build replaces it. */
async function livePages(site: string): Promise<Map<string, string>> {
  const index = await fetchText(new URL('/sitemap-index.xml', site).href);
  const maps = await Promise.all(sitemapsIn(index).map(fetchText));
  return new Map(maps.flatMap((xml) => [...pages(xml)]));
}

/** The pages this build lists, from the sitemaps it wrote. */
async function builtPages(dir: URL): Promise<Map<string, string>> {
  const files = (await readdir(dir)).filter((name) => /^sitemap-\d+\.xml$/.test(name));
  const maps = await Promise.all(files.map((name) => readFile(new URL(name, dir), 'utf8')));
  return new Map(maps.flatMap((xml) => [...pages(xml)]));
}

export default function indexNow(site: string): AstroIntegration {
  return {
    name: 'indexnow',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.CF_PAGES !== '1' || process.env.CF_PAGES_BRANCH !== 'main') {
          logger.info('Not a production build on Cloudflare; not telling search engines.');
          return;
        }

        try {
          const [before, after] = await Promise.all([livePages(site), builtPages(dir)]);
          const changed = [
            ...[...after].filter(([url, lastmod]) => before.get(url) !== lastmod).map(([url]) => url),
            ...[...before.keys()].filter((url) => !after.has(url)),
          ];
          if (!changed.length) {
            logger.info('No page is new, changed or gone since the live site.');
            return;
          }

          const { host } = new URL(site);
          const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
              host,
              key: KEY,
              keyLocation: new URL(`/${KEY}.txt`, site).href,
              urlList: changed.slice(0, 10000),
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          });
          if (!response.ok) throw new Error(`IndexNow answered ${response.status} ${response.statusText}`);
          logger.info(`Told search engines about ${changed.length} page(s): ${changed.join(', ')}`);
        } catch (error) {
          logger.warn(`Couldn't tell search engines what changed: ${String(error)}`);
        }
      },
    },
  };
}
