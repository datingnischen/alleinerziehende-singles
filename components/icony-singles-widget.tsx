"use client";

import { useMemo, useState } from "react";
import styles from "./icony-singles-widget.module.css";

type Props = {
  city: string;
  zip: string;
  country: number;
  platformId: string;
  searchUrl: string;
  /** Ziel beim Klick auf ein Profil: Startseite des Markts mit AID=location */
  profileUrl?: string;
};

type Gender = "women" | "men";

const DEFAULT_PROFILE_URL = "https://alleinerziehende-singles.de/?AID=location";

function buildWidgetDocument({
  city,
  zip,
  country,
  platformId,
  gender,
  profileUrl,
}: Omit<Props, "searchUrl" | "profileUrl"> & { gender: Gender; profileUrl: string }) {
  const options = JSON.stringify({
    platformId,
    city,
    gender: gender === "women" ? 2 : 1,
    country,
    zip,
    count: 6,
    affiliate: "location",
    profileClickUrl: profileUrl,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<meta name="referrer" content="no-referrer" />
<style>
  :root { color-scheme: light; --brand:#57ad46; --brand-dark:#3d7f30; --accent:#f8ae14; --muted:#5a6656; --line:#e9e1cd; --text:#22301f; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: transparent; color: var(--text); }
  a { color: inherit; text-decoration: none; }
  .state { min-height: 230px; display: grid; place-items: center; padding: 18px; border: 1.5px dashed var(--line); border-radius: 22px; background: #fffaf0; color: var(--brand-dark); font-weight: 700; text-align: center; }
  .grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; padding: 4px 2px 10px; }
  .tile { display: grid; gap: 4px; min-width: 0; padding: 8px 8px 12px; border-radius: 20px; background: #fff; box-shadow: 0 10px 24px rgba(40,60,25,.08), inset 0 0 0 1px var(--line); transition: box-shadow .18s ease, transform .18s ease; }
  .tile:nth-child(odd) { transform: rotate(-1deg); }
  .tile:nth-child(even) { transform: rotate(1deg); }
  .tile:hover, .tile:focus-visible { box-shadow: 0 14px 30px rgba(40,60,25,.14), inset 0 0 0 2px var(--accent); transform: translateY(-3px); outline: none; }
  .image { aspect-ratio: 1; overflow: hidden; margin-bottom: 6px; border-radius: 14px; background: linear-gradient(135deg, #e8f4e2, #fff1cf); }
  .image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  strong, span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-inline: 4px; }
  strong { font-size: .95rem; line-height: 1.2; }
  span { color: var(--muted); font-size: .8rem; line-height: 1.3; }
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

export function IconySinglesWidget({ city, zip, country, platformId, searchUrl, profileUrl = DEFAULT_PROFILE_URL }: Props) {
  const [gender, setGender] = useState<Gender>("women");
  const srcDoc = useMemo(
    () => buildWidgetDocument({ city, zip, country, platformId, gender, profileUrl }),
    [city, zip, country, platformId, gender, profileUrl],
  );
  const controlName = `icony-singles-${zip}`;
  const selectedLabel = gender === "women" ? "Frauen" : "Männer";

  return (
    <section className={styles.widget} aria-labelledby={`singles-${zip}`}>
      <div className={styles.top}>
        <div className={styles.copy}>
          <p className="ae-eyebrow">Singles entdecken</p>
          <h2 id={`singles-${zip}`}>Wer in {city} gerade sucht</h2>
          <p>Echte Profilvorschauen von Müttern und Vätern aus Deiner Region – wähle, wen Du sehen möchtest.</p>
        </div>

        <fieldset className={styles.controls}>
          <legend className="ae-sr">Profile auswählen</legend>
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
      </div>

      <iframe
        key={gender}
        className={styles.frame}
        title={`${selectedLabel} aus ${city}`}
        srcDoc={srcDoc}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />

      <div className={styles.actions}>
        <a className="ae-btn ae-btn-green" href={searchUrl} target="_blank" rel="noopener noreferrer">
          Ausführlicher in {city} suchen
        </a>
        <span>Kostenlos starten · Umkreis selbst erweitern · diskret stöbern</span>
      </div>
    </section>
  );
}
