/*
  Selected work — a few words about the studio, then a short list of
  projects, each linking to its own page. Software leads: building comes
  first in the intro and in the order of the projects, design after.

  Draft copy, and the projects are placeholders: no real names, years,
  images or pages exist yet. TODO: replace `projects` with the real ones
  once their pages are built; `slug` becomes the path, `/work/<slug>`, and
  `image` is the picture that floats beside the row on hover — the
  project's landing shot or its key visual. The placeholders in
  `public/work/` are drawn at 4:3; keep real images near that shape.

  Each project is Software or Design: the two pages under Work,
  /work/software and /work/designs, list the projects of their kind.
  Each also has its own page, /work/<slug>, explaining it: `body`, with
  `scope`, `link` and `gallery` beside it. TODO: the real text.
*/

import type { Locale } from '../lib/i18n';

/** Which page under Work a project is listed on. */
export type WorkCategory = 'software' | 'design';

export interface WorkProject {
  /** Path segment of the project's page: `/work/<slug>`. */
  slug: string;
  category: WorkCategory;
  name: string;
  /** What kind of work it was — website, web app, identity… — in a few words. */
  kind: string;
  /** One or two sentences about it, beside its picture on the Software and Designs pages. */
  summary: string;
  /**
   * The explanation on its own page. Paragraphs split by a blank line;
   * `## ` starts a heading, `- ` a list item, [words](address) a link.
   */
  body: string;
  /** What we did on it, a few short items. */
  scope: string[];
  /** The finished thing, live, if it can be visited. Empty for none. */
  link: string;
  /** More pictures, after the text. Paths under `public/`. */
  gallery: string[];
  year: string;
  /** Shown on hover. A path under `public/`, ideally 4:3. */
  image: string;
}

export interface WorkContent {
  /** A few sentences about who we are, before the work itself. */
  intro: string;
  /** Small label above the list. */
  listLabel: string;
  /** Link to the pages listing every project. */
  allLabel: string;
  /** A line under each page's heading; the headings are the nav's words. */
  softwareIntro: string;
  designsIntro: string;
  /** Shown on a page with no projects in it yet. */
  empty: string;
  /** The words around a project on its own page. */
  project: { scope: string; kind: string; year: string; visit: string; next: string };
  projects: WorkProject[];
}

export const work: Record<Locale, WorkContent> = {
  ar: {
    intro:
      'نحن استوديو يبني البرمجيات من أول فكرة حتى آخر سطر: مواقع، تطبيقات ويب، ومتاجر إلكترونية — ونصمم الهويات التي تحملها. نرصفها حجراً حجراً، كل قطعة في مكانها. هذه بعض الطرق التي رصفناها.',
    listLabel: 'أعمال مختارة',
    allLabel: 'كل الأعمال',
    softwareIntro: 'مواقع وتطبيقات ويب ومتاجر بنيناها من أول فكرة حتى الإطلاق.',
    designsIntro: 'هويات بصرية وتصاميم صنعناها لتحمل ما نبنيه.',
    empty: 'لا أعمال هنا بعد. قريباً.',
    project: { scope: 'ما قمنا به', kind: 'النوع', year: 'السنة', visit: 'زُر الموقع', next: 'المشروع التالي' },
    projects: [
      { slug: 'project-one', category: 'software', name: 'مشروع ٠١', kind: 'موقع متكامل', summary: 'موقع بُني من الصفر: تصميم وتطوير ونظام لإدارة المحتوى، سريع على كل شاشة.', body: 'بدأ المشروع بسؤال بسيط: ماذا يحتاج الزائر أن يعرف في أول عشر ثوانٍ؟ من هناك رسمنا المسارات، ثم الشاشات، ثم بنينا الموقع من الصفر.\n\n## ما بنيناه\n\n- موقع سريع يعمل بسلاسة على كل شاشة.\n- نظام لإدارة المحتوى يحدّث منه الفريق كل شيء بنفسه.\n- أساس متين لمحركات البحث من اليوم الأول.', scope: ['التصميم', 'التطوير', 'إدارة المحتوى'], link: '', gallery: [], year: '٢٠٢٦', image: '/work/project-one.svg' },
      { slug: 'project-two', category: 'software', name: 'مشروع ٠٢', kind: 'تطبيق ويب', summary: 'أداة يومية لفريق كامل، من أول نموذج حتى إصدار يعتمدون عليه.', body: 'أداة يعتمد عليها فريق كامل كل يوم، فكان لكل ثانية وزنها. بدأنا بنموذج أوّلي جرّبه الفريق خلال أسبوع، ثم بنينا عليه خطوة خطوة.\n\n## النتيجة\n\nإصدار مستقر يستخدمه الفريق يومياً، وواجهة واضحة لا تحتاج إلى شرح.', scope: ['تصميم المنتج', 'الواجهات والخوادم', 'لوحة التحكم'], link: '', gallery: [], year: '٢٠٢٦', image: '/work/project-two.svg' },
      { slug: 'project-three', category: 'software', name: 'مشروع ٠٣', kind: 'متجر إلكتروني', summary: 'متجر من الواجهة حتى الدفع، مع لوحة لإدارة المنتجات والطلبات.', body: 'متجر يبيع: تجربة شراء واضحة من أول صفحة حتى الدفع، ولوحة تدير بها المنتجات والطلبات دون عناء.\n\n## ما بنيناه\n\n- واجهة متجر سريعة.\n- دفع موثوق وشحن.\n- إدارة الطلبات والمخزون.', scope: ['المتجر', 'الدفع والشحن', 'إدارة الطلبات'], link: '', gallery: [], year: '٢٠٢٥', image: '/work/project-three.svg' },
      { slug: 'project-four', category: 'design', name: 'مشروع ٠٤', kind: 'هوية بصرية', summary: 'هوية كاملة: شعار وألوان وخطوط، ودليل يحفظها متّسقة.', body: 'هوية تولد من معنى العلامة: شعار وألوان وخطوط تعمل معاً، ودليل يحفظها متّسقة في كل مكان تظهر فيه.\n\n## ما صنعناه\n\n- الشعار ونسخه.\n- نظام الألوان والخطوط.\n- دليل العلامة.', scope: ['الشعار والهوية', 'دليل العلامة', 'التصميم الجرافيكي'], link: '', gallery: [], year: '٢٠٢٥', image: '/work/project-four.svg' },
    ],
  },
  en: {
    intro:
      'We are a studio that builds software end to end, from the first idea to the last line of code: websites, web apps and online stores, and the brands they carry. Laid stone by stone, every piece in its place. Here are a few of the roads we have paved.',
    listLabel: 'Selected work',
    allLabel: 'All work',
    softwareIntro: 'Websites, web apps and online stores we built, from the first idea to launch.',
    designsIntro: 'Brand identities and design we made to carry what we build.',
    empty: 'Nothing here yet. Soon.',
    project: { scope: 'What we did', kind: 'Kind', year: 'Year', visit: 'Visit the site', next: 'Next project' },
    projects: [
      { slug: 'project-one', category: 'software', name: 'Project 01', kind: 'Website, end to end', summary: 'A site built from scratch: design, development and a content system, fast on every screen.', body: 'It started with a simple question: what does a visitor need to know in the first ten seconds? From there we drew the flows, then the screens, then built the site from scratch.\n\n## What we built\n\n- A fast site that works smoothly on every screen.\n- A content system the team updates on its own.\n- Solid search foundations from day one.', scope: ['Design', 'Development', 'Content management'], link: '', gallery: [], year: '2026', image: '/work/project-one.svg' },
      { slug: 'project-two', category: 'software', name: 'Project 02', kind: 'Web app', summary: 'An everyday tool for a whole team, from the first prototype to a release they rely on.', body: 'A tool a whole team relies on every day, so every second counted. We started with a prototype the team tried within a week, then built on it step by step.\n\n## The result\n\nA stable release the team uses daily, and an interface that needs no explaining.', scope: ['Product design', 'Front end & back end', 'Dashboard'], link: '', gallery: [], year: '2026', image: '/work/project-two.svg' },
      { slug: 'project-three', category: 'software', name: 'Project 03', kind: 'Online store', summary: 'A store from storefront to checkout, with an admin for products and orders.', body: 'A store that sells: a clear way to buy from the first page to checkout, and an admin that makes products and orders easy.\n\n## What we built\n\n- A fast storefront.\n- Trusted payments and shipping.\n- Order and stock management.', scope: ['Storefront', 'Payments & shipping', 'Order management'], link: '', gallery: [], year: '2025', image: '/work/project-three.svg' },
      { slug: 'project-four', category: 'design', name: 'Project 04', kind: 'Brand identity', summary: 'A complete identity: a mark, colours and type, and the guidelines that keep them consistent.', body: 'An identity born from what the brand means: a mark, colours and type that work together, and guidelines that keep them consistent wherever they appear.\n\n## What we made\n\n- The mark and its versions.\n- The colour and type system.\n- Brand guidelines.', scope: ['Logo & identity', 'Brand guidelines', 'Graphic design'], link: '', gallery: [], year: '2025', image: '/work/project-four.svg' },
    ],
  },
};
