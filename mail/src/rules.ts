/*
  Who gets the automatic note. A person writing in does; anything that
  is itself automatic doesn't (bounces, newsletters, other auto-replies),
  and neither does a reply in a conversation already under way, so a
  thread with a real person never collects a note at every turn.
*/

/** Senders that are machines by name. */
const MACHINE = /^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounces?)([+.-]|@)/i;

export function shouldAnswer(headers: Headers, from: string): boolean {
  const sender = from.trim().toLowerCase();
  // A bounce has no sender; our own addresses would answer themselves.
  if (!sender || !sender.includes('@') || sender.endsWith('@rasf.studio')) return false;
  if (MACHINE.test(sender)) return false;

  const auto = headers.get('auto-submitted');
  if (auto && auto.trim().toLowerCase() !== 'no') return false;
  if (/^(bulk|list|junk|auto_reply)$/i.test(headers.get('precedence')?.trim() ?? '')) return false;
  if (headers.has('list-id') || headers.has('list-unsubscribe')) return false;
  if (headers.has('x-autoreply') || headers.has('x-autorespond')) return false;
  if (/all|autoreply|oof/i.test(headers.get('x-auto-response-suppress') ?? '')) return false;

  // Already a conversation: the first message was answered.
  if (headers.has('in-reply-to') || headers.has('references')) return false;

  return true;
}
