/*
  Contact — the last section, and where every "Start a project" button on
  the page leads. A big invitation, the direct way in (email), and a short
  project form.

  There is no server behind the form yet: sending it opens the visitor's
  own email app with everything filled in, addressed to site.email. TODO:
  swap for a real submission (Firebase, with the admin dashboard) when it
  lands; the form itself doesn't need to change.

  Draft copy. TODO: sign-off, and confirm the budget ranges and currency.
*/

import type { Locale } from '../lib/i18n';

export interface ContactContent {
  /** The big line. Its closing full stop takes the accent. */
  heading: string;
  intro: string;
  /** The direct way in, beside the form. */
  direct: {
    emailLabel: string;
    copy: string;
    copied: string;
    basedLabel: string;
  };
  form: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    /** "What do you need?" — the options are the Services titles. */
    need: string;
    budget: string;
    /** TODO: confirm ranges and currency. */
    budgets: string[];
    message: string;
    messagePlaceholder: string;
    send: string;
    /** Under the button, so nobody is surprised by their mail app opening. */
    note: string;
    /** Subject line of the email the form writes. {name} is filled in. */
    subject: string;
    /** Labels inside the email body. */
    body: { name: string; email: string; need: string; budget: string; message: string };
  };
  foot: {
    rights: string;
    top: string;
  };
}

export const contact: Record<Locale, ContactContent> = {
  ar: {
    heading: 'لنبنِ شيئاً معاً.',
    intro: 'أخبرنا بما تفكّر فيه، موقعاً كان أو تطبيقاً أو متجراً أو هوية. نقرأ كل رسالة ونردّ بأنفسنا.',
    direct: {
      emailLabel: 'راسلنا مباشرة',
      copy: 'نسخ',
      copied: 'تم النسخ',
      basedLabel: 'من',
    },
    form: {
      name: 'اسمك',
      namePlaceholder: 'الاسم الكامل',
      email: 'بريدك',
      emailPlaceholder: 'name@company.com',
      need: 'ماذا تحتاج؟',
      budget: 'الميزانية التقريبية',
      budgets: ['أقل من ٢٬٠٠٠$', '٢٬٠٠٠–٥٬٠٠٠$', '٥٬٠٠٠–١٥٬٠٠٠$', 'أكثر من ١٥٬٠٠٠$'],
      message: 'عن المشروع',
      messagePlaceholder: 'ما الذي تريد بناءه، ولمن، ومتى تحتاجه؟',
      send: 'أرسل',
      note: 'يفتح بريدك وكل شيء مكتوب، فقط اضغط إرسال.',
      subject: 'مشروع جديد من {name}',
      body: { name: 'الاسم', email: 'البريد', need: 'المطلوب', budget: 'الميزانية', message: 'عن المشروع' },
    },
    foot: {
      rights: 'جميع الحقوق محفوظة',
      top: 'إلى الأعلى',
    },
  },
  en: {
    heading: "Let's build something.",
    intro:
      "Tell us what you have in mind, a website, an app, a store, or a brand. We read every message and answer it ourselves.",
    direct: {
      emailLabel: 'Write to us directly',
      copy: 'Copy',
      copied: 'Copied',
      basedLabel: 'From',
    },
    form: {
      name: 'Your name',
      namePlaceholder: 'Full name',
      email: 'Your email',
      emailPlaceholder: 'name@company.com',
      need: 'What do you need?',
      budget: 'Rough budget',
      budgets: ['Under $2k', '$2k–5k', '$5k–15k', '$15k+'],
      message: 'About the project',
      messagePlaceholder: 'What do you want built, for whom, and when do you need it?',
      send: 'Send',
      note: 'Opens your email app with everything filled in, ready to send.',
      subject: 'New project from {name}',
      body: { name: 'Name', email: 'Email', need: 'Needs', budget: 'Budget', message: 'About the project' },
    },
    foot: {
      rights: 'All rights reserved',
      top: 'Back to top',
    },
  },
};
