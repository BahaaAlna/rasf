import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldAnswer } from '../src/rules.ts';

const h = (entries: Record<string, string> = {}) => new Headers(entries);

test('a person writing in gets the note', () => {
  assert.equal(shouldAnswer(h({ 'message-id': '<a@gmail.com>' }), 'someone@gmail.com'), true);
  assert.equal(shouldAnswer(h({ 'auto-submitted': 'no' }), 'Someone.Else@outlook.com'), true);
});

test('machines and our own addresses do not', () => {
  for (const from of ['', 'noreply@github.com', 'no-reply@x.com', 'do-not-reply@x.com', 'mailer-daemon@googlemail.com', 'postmaster@x.com', 'bounces+123@x.com', 'info@rasf.studio', 'no-reply@rasf.studio']) {
    assert.equal(shouldAnswer(h(), from), false, from);
  }
});

test('automatic mail does not', () => {
  const cases: Record<string, string>[] = [
    { 'auto-submitted': 'auto-replied' },
    { 'auto-submitted': 'auto-generated' },
    { precedence: 'bulk' },
    { precedence: 'list' },
    { 'list-id': '<news.example.com>' },
    { 'list-unsubscribe': '<mailto:u@x.com>' },
    { 'x-autoreply': 'yes' },
    { 'x-auto-response-suppress': 'All' },
  ];
  for (const headers of cases) assert.equal(shouldAnswer(h(headers), 'someone@gmail.com'), false, JSON.stringify(headers));
});

test('a reply in a conversation already under way does not', () => {
  assert.equal(shouldAnswer(h({ 'in-reply-to': '<x@rasf.studio>' }), 'someone@gmail.com'), false);
  assert.equal(shouldAnswer(h({ references: '<x@rasf.studio>' }), 'someone@gmail.com'), false);
});
