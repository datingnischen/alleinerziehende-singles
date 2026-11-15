import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('author profile describes the confirmed years and shares the article person identity', () => {
  const profile = readFileSync(new URL('../components/magazine/author-page.tsx', import.meta.url), 'utf8');
  const article = readFileSync(new URL('../components/magazine/magazine-article.tsx', import.meta.url), 'utf8');
  assert.ok(profile.includes('2021 bis 2024'));
  assert.ok(profile.includes('...christianPerson()'));
  assert.ok(article.includes('author: christianPerson()'));
});
