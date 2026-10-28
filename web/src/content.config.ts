/*
  Content collections. The blog's posts come from two places:

  - The dashboard (Firestore, posts/*): the usual way. Each post there
    holds its Arabic and English versions; each becomes an entry here.
  - Markdown files, one per post, in a folder per language:
    src/content/blog/ar/ and src/content/blog/en/.

  Once the dashboard holds any posts, the blog is exactly those: a post
  deleted there is gone from the site, whatever files remain. The files
  are used only while the dashboard has none, or can't be reached.

  Either way an entry's id is `{language}/{slug}`, and the slug is its
  address: ar/hello is /blog/hello, en/hello is /en/blog/hello. A post
  can exist in one language only; the language switch then goes to the
  other language's blog instead.
*/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { loadPosts } from './lib/firestore';

const files = glob({ pattern: '{ar,en}/**/*.md', base: './src/content/blog' });

const blog = defineCollection({
  loader: {
    name: 'blog',
    async load(context) {
      const posts = await loadPosts();
      if (!posts?.length) {
        await files.load(context);
        return;
      }

      context.store.clear();
      for (const post of posts) {
        for (const lang of ['ar', 'en'] as const) {
          const version = post[lang];
          if (!version) continue;
          const id = `${lang}/${post.slug}`;
          const data = await context.parseData({
            id,
            data: { title: version.title, description: version.description, date: post.date, draft: false },
          });
          context.store.set({
            id,
            data,
            body: version.body,
            rendered: await context.renderMarkdown(version.body),
            digest: context.generateDigest({ ...version, date: post.date.toISOString() }),
          });
        }
      }
    },
  },
  schema: z.object({
    title: z.string(),
    /** One or two lines: the list shows it, and so do search results. */
    description: z.string(),
    date: z.coerce.date(),
    /** Drafts build in `astro dev` only, never on the live site. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
