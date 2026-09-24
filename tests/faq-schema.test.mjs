import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildFaqPageJsonLd, extractFaqEntries } from "../lib/faq-schema.ts";

const data = JSON.parse(await readFile(new URL("../data/icony-import.json", import.meta.url), "utf8"));
const faqPage = data.rootPages.find(page => page.slug === "faq");

test("FAQ page exposes every details block as FAQPage question", () => {
  const entries = extractFaqEntries(faqPage.contentHtml);
  assert.equal(entries.length, (faqPage.contentHtml.match(/<details\b/g) ?? []).length);
  assert.ok(entries.length >= 20);
  for (const entry of entries) {
    assert.match(entry.question, /\?$/);
    assert.doesNotMatch(`${entry.question} ${entry.answer}`, /<|&[a-z]+;/i);
    assert.ok(entry.answer.length > 30, `short answer: ${entry.question}`);
  }
  assert.equal(entries[0].question, "An wen richtet sich alleinerziehende-singles.de?");
  assert.doesNotMatch(entries[0].answer, /Mehr dazu in der Hilfe/);

  const graph = buildFaqPageJsonLd({ url: "https://alleinerziehende-singles.de/faq/", name: "FAQ", entries })["@graph"];
  const faq = graph.find(node => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, entries.length);
  assert.equal(faq.mainEntity[0].acceptedAnswer["@type"], "Answer");
});
