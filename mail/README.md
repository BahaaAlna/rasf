# mail

The Cloudflare Email Worker behind `hello@rasf.studio`. Each message is
forwarded to the studio's inbox, then the sender gets a short note in
Arabic and English from `no-reply@rasf.studio`. Replies to that note go
to `hello@`. Bounces, newsletters, other auto-replies and replies in an
ongoing thread get no note.

- The note's words: `src/note.ts`. Run `npm run preview` and open `preview.html` to see it.
- Who gets a note: `src/rules.ts`. Run `npm test`.

## Deploy

Sign in to the Cloudflare account that holds `rasf.studio`, then run these from inside `mail/`:

```
npx wrangler login
npx wrangler secret put FORWARD_TO   # the Gmail address messages go to; it must be a verified destination in Email Routing
npm run deploy
```

Then go to Email › Email Routing › Routing rules in Cloudflare. Edit the `hello@rasf.studio` rule so its action is **Send to a Worker** and its destination is **rasf-mail**.

Cloudflare only sends a note when the incoming mail passes DMARC. Gmail, Outlook, iCloud and Yahoo all pass. When a note is refused, the message still reaches the inbox, and the worker's logs show why.
