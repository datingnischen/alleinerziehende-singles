"use client";

import { useMemo, useState } from "react";
import { ChatIcon, HeartIcon, PhoneIcon, SearchIcon, ShieldIcon, StarIcon, TagIcon, UserIcon } from "@/components/icons";
import type { FaqTopic, FaqTopicIcon } from "@/lib/faq";

function normalize(value: string) {
  return value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function FaqTopicIconView({ icon }: { icon: FaqTopicIcon }) {
  switch (icon) {
    case "shield": return <ShieldIcon />;
    case "star": return <StarIcon />;
    case "tag": return <TagIcon />;
    case "phone": return <PhoneIcon />;
    case "user": return <UserIcon />;
    case "chat": return <ChatIcon />;
    default: return <HeartIcon />;
  }
}

/** Durchsuchbare FAQ: Themenleiste, Volltextsuche über Frage und Antwort, Treffer werden aufgeklappt. */
export function FaqBrowser({ topics, contactUrl }: { topics: FaqTopic[]; contactUrl: string }) {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const visible = useMemo(() => topics
    .map((topic) => ({ ...topic, items: q ? topic.items.filter((item) => normalize(`${item.question} ${item.answerText}`).includes(q)) : topic.items }))
    .filter((topic) => topic.items.length), [topics, q]);
  const total = topics.reduce((sum, topic) => sum + topic.items.length, 0);
  const hits = visible.reduce((sum, topic) => sum + topic.items.length, 0);

  return (
    <div className="aei-faq">
      <div className="aei-faq-tools">
        <label className="ae-search aei-faq-search">
          <SearchIcon />
          <span className="ae-sr">Fragen durchsuchen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Frage suchen, z. B. Kosten, Profil, löschen …" autoComplete="off" />
        </label>
        <p className="aei-faq-count" aria-live="polite">{q ? `${hits} von ${total} Antworten` : `${total} Antworten in ${topics.length} Themen`}</p>
      </div>

      {!q ? (
        <nav className="aei-faq-nav" aria-label="Themen">
          {topics.map((topic) => (
            <a key={topic.id} href={`#${topic.id}`}><FaqTopicIconView icon={topic.icon} />{topic.short}<small>{topic.items.length}</small></a>
          ))}
        </nav>
      ) : null}

      <div className="aei-faq-topics">
        {visible.map((topic) => (
          <section key={topic.id} id={topic.id} className={`aei-faq-topic${topic.icon === "shield" ? " aei-faq-topic-dark" : ""}`} aria-labelledby={`${topic.id}-h`}>
            <header>
              <span className="aei-faq-topic-icon"><FaqTopicIconView icon={topic.icon} /></span>
              <h2 id={`${topic.id}-h`}>{topic.title}</h2>
            </header>
            <div className="aei-faq-items">
              {topic.items.map((item) => (
                <details key={`${item.id}-${q}`} id={item.id} open={Boolean(q)}>
                  <summary>{item.question}<span className="aei-faq-toggle" aria-hidden="true" /></summary>
                  <div className="ae-rich" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
                </details>
              ))}
            </div>
          </section>
        ))}
        {!visible.length ? (
          <div className="aei-faq-empty">
            <strong>Dazu haben wir noch keine Antwort.</strong>
            <p>Probier einen anderen Begriff – oder frag direkt unser Support-Team: <a href={contactUrl}>Zum Kontakt</a></p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
