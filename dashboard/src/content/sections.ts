/*
  Every section of the website the dashboard edits, in the order they
  appear on the page, each with its fields and the site's current text.

  The current text is read straight from the website's own data files
  (web/src/data), so "start from the site's current text" is always what
  the site shows right now, never a stale copy.

  The shapes here match those files field for field; the website reads
  these documents back into the same shapes (web/src/lib/content.ts).
*/

import type { Field, Section, SectionDoc } from './fields';
import { site } from '../../../web/src/data/site';
import { ui } from '../../../web/src/data/ui';
import { hero } from '../../../web/src/data/hero';
import { origin } from '../../../web/src/data/origin';
import { work } from '../../../web/src/data/work';
import { services } from '../../../web/src/data/services';
import { about, TOOLS } from '../../../web/src/data/about';
import { contact } from '../../../web/src/data/contact';
import { blog } from '../../../web/src/data/blog';

/** A deep copy, so editing never touches the imported originals. */
const copy = <T>(value: T): T => structuredClone(value);

const both = <T>(data: { ar: T; en: T }): SectionDoc => copy(data) as unknown as SectionDoc;

const text = (key: string, label: string, extra: Partial<Extract<Field, { kind: 'text' }>> = {}): Field => ({
  kind: 'text',
  key,
  label,
  ...extra,
});

export const SECTIONS: Section[] = [
  {
    id: 'site',
    title: 'Site',
    description: 'The studio’s name and details: the browser tab, search results, the footer and Contact.',
    words: [
      text('name', 'Name'),
      text('tagline', 'Tagline', { hint: 'After the name in the browser tab and search results.' }),
      text('description', 'Description', { long: true, hint: 'Shown under the title in search results.' }),
      text('location', 'Location line', { hint: 'Under the email in Contact. It ends with the blue dot on its own.' }),
    ],
    shared: [
      {
        kind: 'icon',
        key: 'icon',
        label: 'Icon',
        hint: 'In the browser tab and on phone home screens. A square image works best; PNG or SVG.',
      },
      text('email', 'Email', { ltr: true }),
      text('phone', 'Phone', { ltr: true, hint: 'Leave empty to hide it.' }),
      {
        kind: 'items',
        key: 'socials',
        label: 'Social links',
        itemName: 'link',
        hint: 'A link with no address isn’t shown.',
        fields: [text('label', 'Name', { ltr: true }), text('href', 'Address', { ltr: true })],
      },
    ],
    current: () => ({
      ar: { name: site.name.ar, tagline: site.tagline.ar, description: site.description.ar, location: site.location.ar },
      en: { name: site.name.en, tagline: site.tagline.en, description: site.description.en, location: site.location.en },
      icon: null,
      email: site.email,
      phone: site.phone,
      socials: copy(site.socials),
    }),
  },
  {
    id: 'ui',
    title: 'Navigation',
    description: 'The header’s links and the buttons used across the page.',
    words: [
      {
        kind: 'group',
        key: 'nav',
        label: 'Header links',
        fields: [
          text('work', 'Work'),
          text('services', 'Services'),
          text('about', 'About'),
          text('blog', 'Blog'),
          text('contact', 'Contact'),
        ],
      },
      {
        kind: 'group',
        key: 'workPages',
        label: 'Pages under Work',
        fields: [
          text('software', 'Software', { hint: 'In the menu under Work, and as that page’s heading.' }),
          text('designs', 'Designs', { hint: 'In the menu under Work, and as that page’s heading.' }),
        ],
      },
      {
        kind: 'group',
        key: 'actions',
        label: 'Buttons',
        fields: [text('viewWork', 'See the work'), text('contact', 'Start a project')],
      },
      text('switchTo', 'Language switch', { hint: 'The other language’s name, on the button in the header.' }),
      text('heroSupport', 'Line under the hero', { long: true }),
    ],
    current: () => both(ui),
  },
  {
    id: 'hero',
    title: 'Hero',
    description: 'The big sentence at the top of the home page, whose last word keeps changing.',
    words: [
      text('lead', 'Sentence', { long: true, hint: 'Everything before the changing word.' }),
      { kind: 'lines', key: 'words', label: 'Changing words', hint: 'One per line, shown in this order.' },
      { kind: 'number', key: 'interval', label: 'Seconds per word', step: 0.1 },
    ],
    current: () => both(hero),
  },
  {
    id: 'origin',
    title: 'What is Rasf?',
    description: 'The question under the hero, the paved logo, and the three cards that open on hover.',
    words: [
      text('lead', 'Question', { hint: 'Before the name: “What is” becomes “What is Rasf?”.' }),
      text('hint', 'Hint', { hint: 'Tells visitors the cards open on hover.' }),
      {
        kind: 'items',
        key: 'columns',
        label: 'Cards',
        itemName: 'card',
        fixed: true,
        hint: 'Three, one for each letter of the logo.',
        fields: [text('n', 'Number'), text('title', 'Title'), text('body', 'Text', { long: true })],
      },
    ],
    current: () => both(origin),
  },
  {
    id: 'work',
    title: 'Work',
    description: 'A few words about the studio and the list of projects, here and on the Software and Designs pages.',
    words: [
      text('intro', 'Intro', { long: true }),
      text('listLabel', 'Label above the list'),
      text('allLabel', 'Link to all work'),
      text('softwareIntro', 'Line on the Software page', { long: true }),
      text('designsIntro', 'Line on the Designs page', { long: true }),
      text('empty', 'On a page with no projects yet'),
      {
        kind: 'group',
        key: 'project',
        label: 'On each project’s page',
        fields: [
          text('kind', 'Label: kind'),
          text('year', 'Label: year'),
          text('scope', 'Label: what we did'),
          text('visit', 'Button to the live site'),
          text('next', 'Link to the next project'),
        ],
      },
      {
        kind: 'items',
        key: 'projects',
        label: 'Projects',
        itemName: 'project',
        fields: [
          text('name', 'Name'),
          {
            kind: 'choice',
            key: 'category',
            label: 'Listed under',
            hint: 'Which page under Work shows it. Every project also shows on the home page.',
            options: [
              { value: 'software', label: 'Software' },
              { value: 'design', label: 'Designs' },
            ],
          },
          text('kind', 'Kind of work', { hint: 'Website, web app, identity…' }),
          text('summary', 'Summary', {
            long: true,
            hint: 'One or two sentences, beside its picture on the Software and Designs pages.',
          }),
          text('body', 'Text on its page', {
            long: true,
            hint: 'Leave a blank line between paragraphs. ## starts a heading, - a list item, [words](https://…) a link.',
          }),
          { kind: 'lines', key: 'scope', label: 'What we did', hint: 'One per line, beside the text on its page.' },
          text('link', 'Live link', { ltr: true, hint: 'The finished site, if it can be visited. Leave empty for none.' }),
          {
            kind: 'lines',
            key: 'gallery',
            label: 'More pictures',
            ltr: true,
            hint: 'One path per line, like /work/name-2.jpg, shown after the text.',
          },
          text('year', 'Year'),
          text('slug', 'Page address', { ltr: true, hint: 'The project’s page: /work/<this>. Same in both languages; not “software” or “designs”.' }),
          text('image', 'Picture', { ltr: true, hint: 'Shown on hover. A path like /work/name.jpg, about 4:3.' }),
        ],
      },
    ],
    current: () => both(work),
  },
  {
    id: 'services',
    title: 'Services',
    description: 'What the studio does: the stack of cards, each with its own drawing.',
    words: [
      text('intro', 'Intro', { long: true }),
      {
        kind: 'items',
        key: 'services',
        label: 'Services',
        itemName: 'service',
        fixed: true,
        hint: 'Four, each with its own drawing on the site, in this order.',
        fields: [
          text('title', 'Title', { hint: 'One or two words.' }),
          text('tag', 'Small line above the list'),
          { kind: 'lines', key: 'capabilities', label: 'What it covers', hint: 'One per line.' },
          text('description', 'Description', { long: true }),
        ],
      },
    ],
    current: () => both(services),
  },
  {
    id: 'about',
    title: 'About',
    description: 'The large manifesto, the band of technologies, and how a project runs.',
    words: [
      text('manifesto', 'Manifesto', { long: true, hint: 'Set very large; a full stop at the end turns blue.' }),
      text('toolsLabel', 'Label on the technologies band'),
      text('processTitle', 'Process title'),
      {
        kind: 'items',
        key: 'steps',
        label: 'Process steps',
        itemName: 'step',
        fields: [text('title', 'Step'), text('note', 'Note', { long: true })],
      },
    ],
    shared: [
      { kind: 'lines', key: 'tools', label: 'Technologies', ltr: true, hint: 'One per line. Product names, so the same in both languages.' },
    ],
    current: () => ({ ...both(about), tools: [...TOOLS] }),
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'The last section: the invitation, the email, the project form and the footer.',
    words: [
      text('heading', 'Heading', { hint: 'A full stop at the end turns blue.' }),
      text('intro', 'Intro', { long: true }),
      {
        kind: 'group',
        key: 'direct',
        label: 'Email',
        fields: [text('emailLabel', 'Label'), text('copy', 'Copy button'), text('copied', 'After copying')],
      },
      {
        kind: 'group',
        key: 'form',
        label: 'Form',
        fields: [
          text('name', 'Name label'),
          text('namePlaceholder', 'Name placeholder'),
          text('email', 'Email label'),
          text('emailPlaceholder', 'Email placeholder', { ltr: true }),
          text('need', 'Question above the choices'),
          { kind: 'lines', key: 'otherNeeds', label: 'Extra choices', hint: 'After the services, one per line.' },
          text('message', 'Message label'),
          text('messagePlaceholder', 'Message placeholder'),
          text('send', 'Send button'),
          text('note', 'Note under the button'),
          text('sending', 'While sending'),
          text('sent', 'Once sent'),
          text('failed', 'If it couldn’t send', { hint: '{email} becomes the studio’s email.' }),
        ],
      },
      {
        kind: 'group',
        key: 'foot',
        label: 'Footer',
        fields: [text('rights', 'Rights line'), text('top', 'Back to top')],
      },
    ],
    current: () => both(contact),
  },
  {
    id: 'blog',
    title: 'Blog page',
    description: 'The words around the posts: the list page’s heading and the labels on each post.',
    words: [
      text('heading', 'Heading', { hint: 'A full stop at the end turns blue.' }),
      text('intro', 'Intro', { long: true }),
      text('empty', 'When there are no posts'),
      text('readingTime', 'Reading time', { hint: '{n} becomes the minutes.' }),
      text('back', 'Link back to the list'),
      {
        kind: 'group',
        key: 'next',
        label: 'Under each post',
        fields: [text('label', 'Line'), text('cta', 'Link to Contact')],
      },
    ],
    current: () => both(blog),
  },
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);
