import { ArrowIcon, ChatIcon, HeartIcon, MailIcon, QuestionIcon, ShieldIcon } from "@/components/icons";
import { MarketLink } from "@/components/market-link";
import { buildFaqPageJsonLd, serializeJsonLd } from "@/lib/faq-schema";
import type { FaqData } from "@/lib/faq";
import { publicUrl } from "@/lib/markets";
import { registrationUrlForContext } from "@/lib/registration-links";
import { FaqBrowser } from "./faq-browser";
import "./info.css";

export function FaqPageView({ faq }: { faq: FaqData }) {
  const total = faq.topics.reduce((sum, topic) => sum + topic.items.length, 0);
  const url = publicUrl("de", faq.path);
  const jsonLd = buildFaqPageJsonLd({ url, name: faq.heroTitle, entries: faq.schemaEntries });
  const contactUrl = publicUrl("de", "/kontakt/");

  return (
    <main className="aei">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <section className="aei-hero">
        <div className="ae-wrap aei-hero-grid">
          <div>
            <nav className="aei-crumbs" aria-label="Brotkrumen">
              <MarketLink market="de" path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">FAQ</span>
            </nav>
            <span className="ae-eyebrow"><QuestionIcon />Fragen &amp; Antworten</span>
            <h1>{faq.heroTitle}</h1>
            <div className="ae-rich aei-intro" dangerouslySetInnerHTML={{ __html: faq.introHtml }} />
            <ul className="aei-chips">
              <li><strong>{total}</strong> Antworten</li>
              <li><strong>{faq.topics.length}</strong> Themen</li>
              <li><strong>0 €</strong> Registrierung</li>
            </ul>
          </div>
          {faq.imageUrl ? (
            <figure className="aei-frame">
              <img src={faq.imageUrl} alt={faq.imageAlt} fetchPriority="high" decoding="async" />
              <span className="aei-frame-badge" aria-hidden="true">?</span>
            </figure>
          ) : null}
        </div>
      </section>

      <section className="ae-wrap aei-faq-wrap" aria-label="Häufige Fragen">
        <FaqBrowser topics={faq.topics} contactUrl={contactUrl} />
        {faq.outroHtml ? <div className="ae-rich aei-outro" dangerouslySetInnerHTML={{ __html: faq.outroHtml }} /> : null}
      </section>

      <section className="ae-wrap ae-section" aria-labelledby="aei-service-title">
        <div className="ae-head">
          <span className="ae-eyebrow"><HeartIcon />Persönlich weiterhelfen</span>
          <h2 id="aei-service-title">Deine Frage war nicht dabei?</h2>
        </div>
        <div className="aei-tiles">
          <a className="aei-tile" href={publicUrl("de", "/hilfe/")}>
            <ChatIcon />
            <strong>Hilfe &amp; Support</strong>
            <span>Anleitungen und Antworten rund um Profil, Nachrichten und Mitgliedschaft.</span>
            <em>Zur Hilfe <ArrowIcon /></em>
          </a>
          <a className="aei-tile" href={contactUrl}>
            <MailIcon />
            <strong>Kontakt</strong>
            <span>Schreib dem Support-Team direkt – echte Menschen kümmern sich um Dein Anliegen.</span>
            <em>Nachricht schreiben <ArrowIcon /></em>
          </a>
          <a className="aei-tile" href={publicUrl("de", "/sicherheit-und-datenschutz.html")}>
            <ShieldIcon />
            <strong>Sicherheit &amp; Datenschutz</strong>
            <span>Wie Deine Daten geschützt werden und woran Du unseriöse Kontakte erkennst.</span>
            <em>Mehr erfahren <ArrowIcon /></em>
          </a>
        </div>
      </section>

      <section className="ae-wrap ae-section">
        <div className="ae-band">
          <div>
            <span className="ae-eyebrow"><HeartIcon />Alles geklärt?</span>
            <h2>Dann lern jetzt Mütter und Väter aus Deiner Region kennen</h2>
            <p>Die Registrierung ist kostenlos, Dein Profil legst Du in Ruhe an – und Du entscheidest, wem Du schreibst.</p>
          </div>
          <div className="ae-band-actions">
            <a className="ae-btn ae-btn-primary" href={registrationUrlForContext("de", "location")}>Kostenlos registrieren</a>
            <MarketLink className="ae-btn ae-btn-ghost" market="de" path="/partnersuche/">Singles nach Stadt</MarketLink>
          </div>
        </div>
      </section>
    </main>
  );
}
