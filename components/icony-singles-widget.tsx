"use client";

import { useMemo, useState } from "react";
import styles from "./icony-singles-widget.module.css";

type Props = {
  city: string;
  zip: string;
  country: number;
  platformId: string;
};

type Gender = "women" | "men";

const PROFILE_CLICK_URL = "https://alleinerziehende-singles.de/?AID=location";
const DETAILED_SEARCH_URL = "https://alleinerziehende-singles.de/suche/?AID=location";

function buildWidgetDocument({
  city,
  zip,
  country,
  platformId,
  gender,
}: Props & { gender: Gender }) {
  const options = JSON.stringify({
    platformId,
    city,
    gender: gender === "women" ? 2 : 1,
    country,
    zip,
    count: 6,
    affiliate: "location",
    profileClickUrl: PROFILE_CLICK_URL,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<meta name="referrer" content="no-referrer" />
<style>
  :root { color-scheme: light; --brand:#d95f58; --brand-dark:#8f3733; --muted:#725c5a; --line:#f0d4d0; --text:#2d1d1b; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: transparent; color: var(--text); }
  a { color: inherit; text-decoration: none; }
  .state { min-height: 280px; display: grid; place-items: center; padding: 18px; border: 1px solid var(--line); border-radius: 20px; background: #fff8f6; color: var(--brand-dark); font-weight: 800; text-align: center; }
  .grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
  .tile { display: grid; gap: 8px; min-width: 0; padding: 10px; border: 1px solid var(--line); border-radius: 18px; background: #fff; box-shadow: 0 10px 26px rgba(92,42,37,.07); transition: border-color .18s ease, transform .18s ease; }
  .tile:hover, .tile:focus-visible { border-color: rgba(217,95,88,.55); transform: translateY(-2px); outline: none; }
  .image { aspect-ratio: 1; overflow: hidden; border-radius: 14px; background: linear-gradient(135deg, #ffe9e4, #f3efed); }
  .image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  strong, span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  strong { font-size: .94rem; line-height: 1.2; }
  span { color: var(--muted); font-size: .82rem; line-height: 1.3; }
  @media (max-width: 700px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 430px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
</head>
<body>
<div id="root" class="state">Für Profilvorschauen bitte JavaScript aktivieren oder die ausführliche Suche nutzen.</div>
<script>
(function(){
  var options = ${options};
  var completed = false;
  document.getElementById("root").textContent = "Singles werden geladen…";
  function installIcony(win, doc) {
    if (win.icony) return;
    (function(i,c,o,n,y,j,s){i.IconyObject=y;i[y]=i[y]||function(){function b(a){return a?(a^Math.random()*16>>a/4).toString(16):"i"+([1e7]+1e7).replace(/[018]/g,b)+1*new Date}var k=arguments;k.id=b();(i[y].q=i[y].q||[]).push(k);if(i[y].R){i[y].R()}return k.id};j=c.createElement(o);s=c.getElementsByTagName(o)[0];j.async=1;j.src=n;s.parentNode.insertBefore(j,s)})(win,doc,"script","https://js.icony.com/api.js","icony");
  }
  function normalizeImage(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    return url.indexOf("https://") === 0 ? url : "";
  }
  function safeText(value) {
    var node = document.createElement("span");
    node.textContent = String(value || "");
    return node.innerHTML;
  }
  function showFallback() {
    if (completed) return;
    completed = true;
    var root = document.getElementById("root");
    root.className = "state";
    root.textContent = "Gerade keine Schnelltreffer. Bitte die ausführliche Suche nutzen.";
  }
  function render(items) {
    if (!Array.isArray(items) || !items.length) return showFallback();
    completed = true;
    var root = document.getElementById("root");
    root.className = "grid";
    root.innerHTML = items.slice(0, options.count).map(function(item) {
      var image = normalizeImage(item.imageurl);
      var href = options.profileClickUrl;
      var name = safeText(item.username || "Profil aus " + options.city);
      var info = safeText(item.userinfo_text || [item.age ? item.age + " Jahre" : "", item.city || options.city].filter(Boolean).join(", "));
      return '<a class="tile" href="' + href + '" target="_blank" rel="noopener noreferrer">'
        + '<div class="image">' + (image ? '<img src="' + image.replace(/"/g, "&quot;") + '" alt="Profilbild von ' + name.replace(/"/g, "&quot;") + '" loading="lazy" />' : "") + "</div>"
        + "<strong>" + name + "</strong><span>" + info + "</span></a>";
    }).join("");
  }
  installIcony(window, document);
  window.icony("create", options.platformId);
  window.icony("get", "activities", "json", function(response) {
    render(response && response.data);
  }, {
    count: options.count,
    gender: options.gender,
    country: options.country,
    zip: options.zip,
    affiliate: options.affiliate,
    use_thumbnails: 0,
    blurred: 0
  });
  window.setTimeout(showFallback, 10000);
})();
</script>
</body>
</html>`;
}

export function IconySinglesWidget({ city, zip, country, platformId }: Props) {
  const [gender, setGender] = useState<Gender>("women");
  const srcDoc = useMemo(
    () => buildWidgetDocument({ city, zip, country, platformId, gender }),
    [city, zip, country, platformId, gender],
  );
  const controlName = `icony-singles-${zip}`;
  const selectedLabel = gender === "women" ? "Frauen" : "Männer";

  return (
    <section className={styles.widget} aria-labelledby={`singles-${zip}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Singles entdecken</p>
        <h2 id={`singles-${zip}`}>Neue Singles in {city}</h2>
        <p>
          Wähle, ob Du Frauen oder Männer sehen möchtest. Wenn Du den Umkreis erweitern willst,
          kannst Du direkt ausführlicher suchen.
        </p>
      </div>

      <fieldset className={styles.controls}>
        <legend>Profile auswählen</legend>
        <label className={gender === "women" ? styles.active : undefined}>
          <input
            type="radio"
            name={controlName}
            checked={gender === "women"}
            onChange={() => setGender("women")}
          />
          Frauen
        </label>
        <label className={gender === "men" ? styles.active : undefined}>
          <input
            type="radio"
            name={controlName}
            checked={gender === "men"}
            onChange={() => setGender("men")}
          />
          Männer
        </label>
      </fieldset>

      <div className={styles.framePanel}>
        <strong>{selectedLabel} aus {city}</strong>
        <p>Die echten Profilvorschauen werden geladen, sobald Du diesen Bereich ansiehst.</p>
        <iframe
          key={gender}
          className={styles.frame}
          title={`${selectedLabel} aus ${city}`}
          srcDoc={srcDoc}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      <div className={styles.actions}>
        <a href={DETAILED_SEARCH_URL} target="_blank" rel="noopener noreferrer">
          Ausführlicher in {city} suchen
        </a>
        <span>Kostenlos starten · Umkreis selbst erweitern · diskret stöbern</span>
      </div>
    </section>
  );
}
