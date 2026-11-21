import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cityQuizHint } from "../lib/city-quiz-hint.ts";

// Rückverlinkung auf koelner-singles.de (2026-11-21): nur die deutsche Köln-Seite, eigener Ankertext, dofollow.
test("Quiz-Hinweis auf koelner-singles.de nur auf der deutschen Köln-Seite", () => {
  const hint = cityQuizHint("de", "koeln");
  assert.ok(hint, "Hinweis für Köln fehlt");
  assert.equal(hint.href, "https://koelner-singles.de/#quiz");
  assert.equal(hint.anchor, "Kölner Wegweiser zu den Nischenbörsen");
  assert.equal(cityQuizHint("de", "hamburg"), null);
  assert.equal(cityQuizHint("at", "koeln"), null);
});

test("Der Hinweis steht als normaler Link im Stadt-Kompass, vor den Nachbarstädten", () => {
  const view = readFileSync(new URL("../components/city/city-page.tsx", import.meta.url), "utf8");
  const index = view.indexOf('className="aec-quiz-hint"');
  assert.ok(index > 0, "Hinweis fehlt in der Stadtvorlage");
  assert.ok(index < view.indexOf("aec-near-title"), "Hinweis steht vor den Nachbarstädten");
  assert.doesNotMatch(view.slice(index, view.indexOf("</p>", index)), /sponsored|nofollow/);
  assert.match(readFileSync(new URL("../components/city/city.css", import.meta.url), "utf8"), /\.aec-quiz-hint \{/);
});
