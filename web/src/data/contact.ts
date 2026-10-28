/*
  Contact — the last section, and where every "Start a project" button on
  the page leads. A big invitation, the direct way in (email), and a short
  project form.

  Sending the form saves the message in Firestore, where it arrives in
  the dashboard's Messages.

  Draft copy. TODO: sign-off.
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
  };
  form: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    /** "What do you need?" — the options are the Services titles… */
    need: string;
    /** …then these, for whatever isn't a service. */
    otherNeeds: string[];
    message: string;
    messagePlaceholder: string;
    send: string;
    /** Under the button, before anything is sent. */
    note: string;
    /** While it goes, once it's gone, and if it couldn't go ({email} is filled in). */
    sending: string;
    sent: string;
    failed: string;
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
    },
    form: {
      name: 'اسمك',
      namePlaceholder: 'الاسم الكامل',
      email: 'بريدك',
      emailPlaceholder: 'name@company.com',
      need: 'ماذا تحتاج؟',
      otherNeeds: ['استفسار', 'شيء آخر'],
      message: 'عن المشروع',
      messagePlaceholder: 'ما الذي تريد بناءه، ولمن، ومتى تحتاجه؟',
      send: 'أرسل',
      note: 'تصلنا رسالتك مباشرة، ونردّ على بريدك.',
      sending: 'جارٍ الإرسال…',
      sent: 'وصلتنا رسالتك. سنردّ عليك قريباً.',
      failed: 'تعذّر الإرسال. حاول مجدداً، أو راسلنا على {email}.',
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
    },
    form: {
      name: 'Your name',
      namePlaceholder: 'Full name',
      email: 'Your email',
      emailPlaceholder: 'name@company.com',
      need: 'What do you need?',
      otherNeeds: ['A question', 'Something else'],
      message: 'About the project',
      messagePlaceholder: 'What do you want built, for whom, and when do you need it?',
      send: 'Send',
      note: 'Your message comes straight to us, and we reply by email.',
      sending: 'Sending…',
      sent: 'Got it. We’ll write back soon.',
      failed: 'Couldn’t send that. Try again, or write to us at {email}.',
    },
    foot: {
      rights: 'All rights reserved',
      top: 'Back to top',
    },
  },
};
