/*
  hello@rasf.studio. Every message is passed on to the studio's inbox
  first, exactly as before; then the person who wrote gets a short note
  from no-reply@rasf.studio saying it arrived.

  Cloudflare only lets a note go back to a sender whose mail proves where
  it came from (DMARC), as Gmail, Outlook, iCloud and Yahoo all do. When
  it refuses, the message has still reached the inbox; only the note is
  skipped, and the reason is in the worker's logs.
*/
import { EmailMessage } from 'cloudflare:email';
import { compose, FROM } from './note';
import { shouldAnswer } from './rules';

interface Env {
  /** The inbox everything is passed on to. A secret, so it stays out of the code. */
  FORWARD_TO: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    await message.forward(env.FORWARD_TO);

    if (!shouldAnswer(message.headers, message.from)) return;
    const raw = compose({
      to: message.from,
      messageId: message.headers.get('message-id'),
      id: crypto.randomUUID(),
      date: new Date(),
    });
    try {
      await message.reply(new EmailMessage(FROM, message.from, raw));
    } catch (error) {
      console.log(`No note to ${message.from}: ${String(error)}`);
    }
  },
} satisfies ExportedHandler<Env>;
