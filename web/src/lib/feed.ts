/*
  The blog as an RSS feed, one per language: /rss.xml and /en/rss.xml.
  Readers subscribe to it, and search engines use it to find new posts
  soon after they're published. Each item carries the whole post.
*/

import rss from '@astrojs/rss';
import { getBlog, getPosts, postPath, slugOf } from './blog';
import { getSite } from './content';
import { pageUrl } from './seo';
import { localizePath, type Locale } from './i18n';

/** Where a language's feed lives. */
export const feedPath = (locale: Locale) => `${localizePath('/', locale)}rss.xml`;

export async function feed(locale: Locale) {
  const site = getSite(locale);
  const posts = await getPosts(locale);

  return rss({
    title: `${getBlog(locale).heading.replace(/\.$/, '')} — ${site.name}`,
    description: getBlog(locale).intro,
    site: pageUrl('/blog', locale),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: pageUrl(postPath(slugOf(post)), locale),
      content: post.rendered?.html,
    })),
    customData: `<language>${locale}</language>`,
  });
}
