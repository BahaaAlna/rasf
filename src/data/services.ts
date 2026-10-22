/*
  Services — what the studio does, as a numbered list of stages. Software
  leads: websites, web apps and stores come first, identity after.

  Draft copy. TODO: confirm the wording and the capability lists.
*/

import type { Locale } from '../lib/i18n';

export interface Service {
  /** The big heading. Keep it to one or two words. */
  title: string;
  /** Small bracketed line above the capabilities. */
  tag: string;
  /** What the service covers, a few items. */
  capabilities: string[];
  /** One or two sentences, set at the far end of the row. */
  description: string;
}

export interface ServicesContent {
  /** A sentence or two before the list. */
  intro: string;
  services: Service[];
}

export const services: Record<Locale, ServicesContent> = {
  ar: {
    intro: 'نبني البرمجيات كاملة، من أول فكرة حتى الإطلاق، ونصمم الهويات التي تحملها. هذه الطرق التي نرصفها.',
    services: [
      {
        title: 'مواقع',
        tag: 'من الفكرة حتى الإطلاق',
        capabilities: ['تصميم وتطوير', 'إدارة المحتوى', 'الأداء ومحركات البحث'],
        description: 'مواقع سريعة ومتقنة، مبنية من الصفر لتعكس من أنتم وتعمل بلا عناء على كل شاشة.',
      },
      {
        title: 'تطبيقات ويب',
        tag: 'منتجات تُستخدم كل يوم',
        capabilities: ['تصميم المنتج', 'الواجهات والخوادم', 'لوحات التحكم'],
        description: 'منتجات وأدوات داخلية تحل مشكلة حقيقية، من أول نموذج حتى إصدار يعتمد عليه فريقكم.',
      },
      {
        title: 'متاجر إلكترونية',
        tag: 'من الواجهة حتى الدفع',
        capabilities: ['المتجر وتجربة الشراء', 'الدفع والشحن', 'إدارة الطلبات'],
        description: 'متاجر تبيع: تجربة شراء واضحة، دفع موثوق، ولوحة تدير بها منتجاتك وطلباتك بسهولة.',
      },
      {
        title: 'هوية بصرية',
        tag: 'حيث تولد العلامة',
        capabilities: ['الشعار والهوية', 'دليل العلامة', 'التصميم الجرافيكي'],
        description: 'هويات تحمل ما نبنيه: شعار، ألوان، وخطوط تصنع علامة يتذكرها الناس.',
      },
    ],
  },
  en: {
    intro:
      'We build software end to end, from the first idea to launch, and design the brands it carries. Here is how we pave the way.',
    services: [
      {
        title: 'Websites',
        tag: 'From idea to launch',
        capabilities: ['Design & development', 'Content management', 'Performance & SEO'],
        description:
          'Fast, carefully made websites, built from scratch to say who you are and to work effortlessly on every screen.',
      },
      {
        title: 'Web apps',
        tag: 'Products used every day',
        capabilities: ['Product design', 'Front end & back end', 'Dashboards & admin'],
        description:
          'Products and internal tools that solve a real problem, from the first prototype to a release your team relies on.',
      },
      {
        title: 'Online stores',
        tag: 'From storefront to checkout',
        capabilities: ['Storefront & shopping', 'Payments & shipping', 'Order management'],
        description:
          'Stores that sell: a clear way to buy, payments you can trust, and an admin that makes products and orders easy.',
      },
      {
        title: 'Brand identity',
        tag: 'Where brands are born',
        capabilities: ['Logo & identity', 'Brand guidelines', 'Graphic design'],
        description: 'Identities that carry what we build: a mark, colours and type that make a brand people remember.',
      },
    ],
  },
};
