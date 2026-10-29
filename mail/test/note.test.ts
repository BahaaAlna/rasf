import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compose } from '../src/note.ts';

const raw = compose({ to: 'someone@gmail.com', messageId: '<abc@mail.gmail.com>', id: 'test-id', date: new Date('2026-10-29T12:00:00Z') });
const [head, ...rest] = raw.split('\r\n\r\n');
const body = rest.join('\r\n\r\n');

test('headers: from no-reply, answers go to info, threaded, marked automatic', () => {
  assert.match(head, /^From: =\?UTF-8\?B\?[^?]+\?= Rasf <no-reply@rasf\.studio>$/m);
  assert.match(head, /^To: <someone@gmail\.com>$/m);
  assert.match(head, /^Reply-To: <hello@rasf\.studio>$/m);
  assert.match(head, /^Message-ID: <test-id@rasf\.studio>$/m);
  assert.match(head, /^In-Reply-To: <abc@mail\.gmail\.com>$/m);
  assert.match(head, /^Auto-Submitted: auto-replied$/m);
  assert.match(head, /^Date: Thu, 29 Oct 2026 12:00:00 GMT$/m);
  // Every header line is plain ASCII.
  assert.ok(/^[\x20-\x7e\r\n]*$/.test(head));
});

test('both versions decode to the Arabic and English text', () => {
  const parts = body.split('--rasf-test-id').slice(1, 3);
  assert.equal(parts.length, 2);
  const decoded = parts.map((p) => Buffer.from(p.split('\r\n\r\n')[1].replace(/\s+/g, ''), 'base64').toString('utf8'));
  for (const text of decoded) {
    assert.match(text, /وصلتنا رسالتك/);
    assert.match(text, /reached us/);
    assert.match(text, /hello@rasf\.studio/);
  }
  assert.match(decoded[1], /dir="rtl"/);
  assert.ok(body.trimEnd().endsWith('--rasf-test-id--'));
  // Lines kept within the 76-character limit for base64.
  assert.ok(body.split('\r\n').every((line) => line.length <= 78));
});

test('the subject decodes', () => {
  const encoded = head.match(/^Subject: =\?UTF-8\?B\?([^?]+)\?=$/m)![1];
  assert.equal(Buffer.from(encoded, 'base64').toString('utf8'), 'وصلتنا رسالتك · We got your message');
});

test('no thread headers when the original had no Message-ID', () => {
  const plain = compose({ to: 'a@b.com', messageId: null, id: 'x', date: new Date() });
  assert.doesNotMatch(plain, /In-Reply-To|References/);
});
