/*
  The note itself, Arabic first, then English. Plain text for every mail
  app, and a simple page in the studio's paper and ink for the ones that
  show it. No pictures: most mail apps hold them back from a stranger.
*/

export const FROM = 'no-reply@rasf.studio';
/** The studio's address: a reply to the note goes here, so it still reaches a person. */
export const INBOX = 'hello@rasf.studio';

const SUBJECT = 'وصلتنا رسالتك · We got your message';

const AR = {
  greeting: 'أهلاً،',
  lines: [
    'وصلتنا رسالتك، وشكراً لأنك كتبت لنا. سنقرؤها ونرد عليك خلال يومَي عمل.',
    `هذا رد آلي. إن أردت إضافة شيء، ردّ على هذه الرسالة أو راسلنا على ${INBOX}`,
  ],
  signature: 'فريق رصف',
  slogan: 'حجراً حجراً',
};

const EN = {
  greeting: 'Hi,',
  lines: [
    'Your message reached us, and thank you for writing. We’ll read it and reply within two working days.',
    `This is an automatic reply. To add anything, reply to this email or write to ${INBOX}.`,
  ],
  signature: 'The Rasf team',
  slogan: 'Stone by stone',
};

const PAPER = '#f5f2eb';
const INK = '#16161a';
const MUTED = '#6b6760';
const ACCENT = '#183fc0';
const RULE = '#dcd6ca';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The address as a link, wherever it appears in a line. */
const linked = (line: string) =>
  escape(line).replace(INBOX, `<a href="mailto:${INBOX}" style="color:${ACCENT};text-decoration:none">${INBOX}</a>`);

function block(words: typeof AR, dir: 'rtl' | 'ltr', lang: string, font: string) {
  const size = lang === 'ar' ? 18 : 15;
  return `
      <tr><td dir="${dir}" lang="${lang}" style="padding:28px 32px;text-align:${dir === 'rtl' ? 'right' : 'left'};font-family:${font};font-size:${size}px;line-height:1.75;color:${INK}">
        <p style="margin:0 0 12px">${escape(words.greeting)}</p>
        ${words.lines.map((line) => `<p style="margin:0 0 12px">${linked(line)}</p>`).join('\n        ')}
        <p style="margin:20px 0 0">${escape(words.signature)}<br><span style="color:${MUTED}">${escape(words.slogan)}</span><span style="color:${ACCENT}">.</span></p>
      </td></tr>`;
}

export function html() {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${PAPER}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${RULE};border-radius:12px">
        <tr><td style="padding:28px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:${INK}">Rasf<span style="color:${ACCENT}">.</span></td></tr>
        ${block(AR, 'rtl', 'ar', 'Tahoma,Arial,sans-serif')}
        <tr><td style="padding:0 32px"><div style="border-top:1px solid ${RULE};height:0;line-height:0">&nbsp;</div></td></tr>
        ${block(EN, 'ltr', 'en', 'Arial,Helvetica,sans-serif')}
      </table>
      <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED}"><a href="https://rasf.studio" style="color:${MUTED};text-decoration:none">rasf.studio</a></p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function text() {
  const part = (w: typeof AR) => [w.greeting, '', ...w.lines.flatMap((l) => [l, '']), w.signature, `${w.slogan}.`].join('\n');
  return `${part(AR)}\n\n— — —\n\n${part(EN)}\n\nrasf.studio\n`;
}

/** UTF-8 bytes as base64, in 76-character lines. */
function base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/.{76}(?=.)/g, '$&\r\n');
}

/** A header value that isn't plain ASCII, as RFC 2047 words. */
const word = (value: string) => `=?UTF-8?B?${base64(value).replace(/\r\n/g, '')}?=`;

interface Original {
  to: string;
  messageId: string | null;
  id: string;
  date: Date;
}

/** The whole message, headers and both versions, ready to send. */
export function compose({ to, messageId, id, date }: Original) {
  const boundary = `rasf-${id}`;
  const headers = [
    `From: ${word('رصف')} Rasf <${FROM}>`,
    `To: <${to}>`,
    `Reply-To: <${INBOX}>`,
    `Subject: ${word(SUBJECT)}`,
    `Date: ${date.toUTCString()}`,
    `Message-ID: <${id}@rasf.studio>`,
    ...(messageId ? [`In-Reply-To: ${messageId}`, `References: ${messageId}`] : []),
    'Auto-Submitted: auto-replied',
    'X-Auto-Response-Suppress: All',
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const part = (type: string, body: string) =>
    [`--${boundary}`, `Content-Type: ${type}; charset=UTF-8`, 'Content-Transfer-Encoding: base64', '', base64(body)].join('\r\n');
  return [...headers, '', part('text/plain', text()), part('text/html', html()), `--${boundary}--`, ''].join('\r\n');
}
