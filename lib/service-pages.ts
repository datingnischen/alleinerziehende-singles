export type ServiceSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ServicePage = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroLead: string;
  highlights: string[];
  sections: ServiceSection[];
  ctaLabel: string;
  ctaHref: string;
};

export const servicePages: ServicePage[] = [
  {
    slug: "bewertungen-und-erfahrungen",
    eyebrow: "Vertrauen & echte Rückmeldungen",
    title: "Bewertungen und Erfahrungen zu Alleinerziehende-Singles.de",
    description:
      "Erfahre, wie Mitglieder, Vergleichsportale und öffentliche Bewertungen Alleinerziehende-Singles.de einschätzen.",
    heroLead:
      "Hier findest Du gebündelt, warum viele Alleinerziehende die Plattform als verständnisvollen und spezialisierten Ort für die Partnersuche erleben.",
    highlights: [
      "Spezialisierte Plattform für Mütter und Väter",
      "Öffentliche Bewertungen und Vergleichsquellen im Blick",
      "Kostenlose Registrierung zum unverbindlichen Kennenlernen",
    ],
    sections: [
      {
        heading: "Was Mitglieder und Vergleiche besonders hervorheben",
        paragraphs: [
          "Die Positionierung ist klar: Nicht irgendeine allgemeine Singlebörse, sondern ein Ort für Menschen mit Kind, die Verständnis für ihren Alltag suchen.",
          "Gerade dieser Fokus sorgt dafür, dass die Plattform in Erfahrungsberichten oft als passender, empathischer und alltagsnäher wahrgenommen wird als breite Massenportale.",
        ],
        bullets: [
          "mehr Verständnis für familiäre Lebensrealitäten",
          "zielgerichtetere Kontakte statt beliebiger Anfragen",
          "besserer Einstieg für Menschen, die nicht bei null erklären wollen, dass Kinder zum Leben gehören",
        ],
      },
      {
        heading: "Orientierung statt blindem Vertrauen",
        paragraphs: [
          "Zusätzliche Einblicke liefern externe Portale, öffentliche Bewertungen und die Erfahrungsseite selbst. So kannst Du Dir vor der Registrierung ein ehrliches Bild machen und prüfen, ob der Stil der Plattform zu Dir passt.",
          "Wenn Du lieber selbst ausprobierst, ist die kostenlose Registrierung der sinnvollste nächste Schritt: Profil anlegen, Plattformgefühl prüfen und erst dann entscheiden, ob mehr daraus werden soll.",
        ],
      },
    ],
    ctaLabel: "Zur kostenlosen Registrierung",
    ctaHref: "https://alleinerziehende-singles.de/registration/",
  },
  {
    slug: "social-media",
    eyebrow: "Community & Reichweite",
    title: "Alleinerziehende-Singles.de auf Social Media",
    description:
      "Bleib über Social Media mit der Community in Kontakt und entdecke, wo Alleinerziehende-Singles.de zusätzlich sichtbar ist.",
    heroLead:
      "Neben der Plattform selbst gibt es Kanäle, über die Inhalte, Hinweise und neue Impulse rund um Dating, Alltag und Community sichtbar werden.",
    highlights: [
      "offizielle Social-Media-Präsenzen als zusätzliche Kontaktpunkte",
      "mehr Nähe zur Community außerhalb der Plattform",
      "schneller Überblick über Aktionen, Inhalte und neue Impulse",
    ],
    sections: [
      {
        heading: "Warum Social Media hier sinnvoll ist",
        paragraphs: [
          "Social Media ergänzt die eigentliche Partnersuche um Sichtbarkeit, Vertrauen und Wiedererkennung. Wer die Marke schon außerhalb der Plattform wahrnimmt, steigt oft mit einem besseren Gefühl ein.",
          "Gerade für eine spitze Zielgruppe wie alleinerziehende Singles helfen soziale Kanäle dabei, Themen, Erfahrungen und gemeinsame Alltagspunkte auch jenseits der reinen Dating-Funktion sichtbar zu machen.",
        ],
      },
      {
        heading: "Offizielle Kanäle",
        paragraphs: [
          "Die bestehende Social-Media-Seite verweist aktuell vor allem auf Facebook und YouTube. Damit gibt es neben dem Magazin zusätzliche Orte, an denen Inhalte und Community-Bezug sichtbar werden.",
        ],
        bullets: [
          "Facebook-Seite für laufende Präsenz und Community-Signale",
          "YouTube-Kanal für zusätzliche Inhalte und Markenvertrauen",
          "direkter Einstieg zurück in die kostenlose Registrierung",
        ],
      },
    ],
    ctaLabel: "Jetzt registrieren",
    ctaHref: "https://alleinerziehende-singles.de/registration/",
  },
  {
    slug: "sicherheit-und-datenschutz.html",
    eyebrow: "Sicher online daten",
    title: "Sicherheit und Datenschutz",
    description:
      "Wie Alleinerziehende-Singles.de Daten schützt und worauf Du selbst achten kannst, um sicherer zu daten.",
    heroLead:
      "Sicherheit ist beim Online-Dating kein Extra, sondern Voraussetzung. Deshalb gehören technische Schutzmaßnahmen und klare Verhaltenstipps immer zusammen.",
    highlights: [
      "verschlüsselte Verbindung und geschützte Systeme",
      "mehr Kontrolle darüber, was andere Mitglieder sehen",
      "klare Hinweise gegen Fake-Profile, Spam und Betrugsversuche",
    ],
    sections: [
      {
        heading: "Technischer Schutz für Deine Nutzung",
        paragraphs: [
          "Zur Plattform gehören geschützte Systeme, verschlüsselte Verbindungen und ein bewusster Umgang mit sensiblen Daten. So wird verhindert, dass persönliche Informationen unnötig offenliegen.",
          "Wichtig ist dabei nicht nur die Technik, sondern auch die klare Trennung zwischen dem, was für andere Mitglieder sichtbar ist, und dem, was privat bleiben soll.",
        ],
      },
      {
        heading: "Was Du selbst für mehr Sicherheit tun kannst",
        paragraphs: [
          "Online-Dating bleibt am stärksten, wenn Plattform-Schutz und eigenes Urteilsvermögen zusammenarbeiten. Vorsicht bei ungewöhnlichen Forderungen, Druck, Geldthemen oder auffälligen Widersprüchen ist kein Misstrauen, sondern gesunde Selbstsicherheit.",
        ],
        bullets: [
          "keine sensiblen Daten vorschnell teilen",
          "auffällige Profile oder Nachrichten direkt melden",
          "bei Unsicherheit lieber langsam Vertrauen aufbauen",
        ],
      },
    ],
    ctaLabel: "Sicher kostenlos starten",
    ctaHref: "https://alleinerziehende-singles.de/registration/",
  },
  {
    slug: "redaktionelle-kontrolle.html",
    eyebrow: "Mehr Schutz vor Fake-Profilen",
    title: "Redaktionelle Kontrolle",
    description:
      "Wie manuelle Prüfung, Aufmerksamkeit und klare Regeln helfen, die Plattform vertrauenswürdiger zu halten.",
    heroLead:
      "Nicht alles darf automatisiert durchrutschen. Gerade bei Dating-Plattformen macht menschliche Prüfung oft den Unterschied zwischen Unsicherheit und einem besseren Gefühl beim Kennenlernen.",
    highlights: [
      "geschultes Team prüft neue Inhalte auf Auffälligkeiten",
      "Fotos, Freitexte und typische Betrugsmuster stehen besonders im Fokus",
      "Regelverstöße können abgelehnt, hinterfragt oder gesperrt werden",
    ],
    sections: [
      {
        heading: "Warum redaktionelle Prüfung wichtig ist",
        paragraphs: [
          "Technik erkennt viel, aber nicht alles. Redaktionelle Kontrolle ergänzt automatisierte Schutzmechanismen dort, wo menschliche Plausibilität, Tonalität und Erfahrung entscheidend sind.",
          "Das gilt vor allem bei Profiltexten, Fotos und Verhaltensmustern, die zwar formal sauber aussehen, aber in der Praxis starke Warnsignale senden können.",
        ],
      },
      {
        heading: "Was konkret geprüft wird",
        paragraphs: [
          "Im Mittelpunkt stehen Widersprüche, Spam-Muster, auffällige Kontakttricks und Bildmaterial, das nicht stimmig wirkt. So wird die Plattform schrittweise sauberer und vertrauenswürdiger gehalten.",
        ],
        bullets: [
          "Profiltexte auf Konsistenz und Betrugssignale",
          "Bilder auf Plausibilität und Regelverstöße",
          "Hinweise auf Belästigung, Fake-Identitäten oder Romance-Scam",
        ],
      },
    ],
    ctaLabel: "Plattform kennenlernen",
    ctaHref: "https://alleinerziehende-singles.de/registration/",
  },
  {
    slug: "kostenlose-basis-mitgliedschaft.html",
    eyebrow: "Kostenlos starten",
    title: "Kostenlose Basis-Mitgliedschaft",
    description:
      "Was die Basis-Mitgliedschaft bietet und warum der Einstieg unverbindlich bleibt, bis Du aktiv mehr möchtest.",
    heroLead:
      "Wer neu einsteigt, möchte erst prüfen, ob Plattform, Menschen und Stimmung wirklich passen. Genau dafür ist die kostenlose Basis-Mitgliedschaft gedacht.",
    highlights: [
      "Registrierung und Basis-Mitgliedschaft ohne versteckte Startkosten",
      "Profil aufbauen, Funktionen kennenlernen und erste Kontakte knüpfen",
      "Kosten nur bei einer bewusst gebuchten Premium-Mitgliedschaft",
    ],
    sections: [
      {
        heading: "Der entspannte Einstieg ohne Druck",
        paragraphs: [
          "Gerade bei einer sehr persönlichen Partnersuche ist es wichtig, sich erst einmal umzusehen. Du kannst die Plattform kennenlernen, Dein Profil schrittweise vervollständigen und prüfen, ob die Community zu Dir passt.",
          "Das schafft eine niedrigere Hürde und macht den Einstieg für Alleinerziehende angenehmer, die oft ohnehin wenig Zeit für lange Umwege haben.",
        ],
      },
      {
        heading: "Was kostenlos möglich ist",
        paragraphs: [
          "Zur Basis gehören genau die Elemente, die Orientierung geben: Profilaufbau, ein erster Eindruck von der Plattform und die Möglichkeit, ohne Druck zu testen, ob sich gute Kontakte ergeben.",
        ],
        bullets: [
          "kostenlos registrieren",
          "Profil, Fotos und Funktionen kennenlernen",
          "erst bei aktiv gebuchter Premium-Mitgliedschaft entstehen Kosten",
        ],
      },
    ],
    ctaLabel: "Kostenlos registrieren",
    ctaHref: "https://alleinerziehende-singles.de/registration/",
  },
  {
    slug: "premium-mitgliedschaft.html",
    eyebrow: "Mehr Möglichkeiten beim Kennenlernen",
    title: "Premiumvorteile auf einen Blick",
    description:
      "Welche zusätzlichen Funktionen eine Premium-Mitgliedschaft freischaltet, wenn Du intensiver suchen und kommunizieren möchtest.",
    heroLead:
      "Wenn die Plattform für Dich passt, sorgt Premium für mehr Reichweite, mehr Komfort und weniger Reibung beim Kennenlernen.",
    highlights: [
      "unbegrenzter schreiben und antworten",
      "mehr Transparenz rund um Kontakte und Profilbesuche",
      "Funktionen wie Video-Date ohne Einschränkung nutzen",
    ],
    sections: [
      {
        heading: "Wo Premium den Unterschied macht",
        paragraphs: [
          "Premium ist vor allem dann sinnvoll, wenn Du aktiv suchst und nicht bei jeder Nachricht ausgebremst werden willst. Kommunikation wird direkter, klarer und planbarer.",
          "Dadurch steigt die Chance, aus ersten Kontakten auch wirklich Gespräche, Dates und echte Verbindungen entstehen zu lassen.",
        ],
      },
      {
        heading: "Typische Premium-Vorteile",
        paragraphs: [
          "Die bestehende Vorteilsseite stellt vor allem Kommunikation, Transparenz und Komfort in den Mittelpunkt. So kannst Du die Plattform intensiver und zielgerichteter nutzen.",
        ],
        bullets: [
          "mit allen Mitgliedern schreiben",
          "Lesebestätigungen und Profilbesucher sehen",
          "Profilbilder und Video-Date umfassender nutzen",
        ],
      },
    ],
    ctaLabel: "Premium entdecken",
    ctaHref: "https://alleinerziehende-singles.de/premium-mitgliedschaft.html",
  },
  {
    slug: "hilfe",
    eyebrow: "Hilfe & Support",
    title: "Wie können wir Dir helfen?",
    description:
      "Schneller Einstieg in die wichtigsten Hilfethemen rund um Profil, Premium, Sicherheit und Nutzung der Plattform.",
    heroLead:
      "Wenn Fragen auftauchen, sollte Hilfe nicht versteckt sein. Die wichtigsten Themen lassen sich deshalb schnell nach Bereichen ordnen: Einstieg, Profil, Premium, Grundlagen und Sicherheit.",
    highlights: [
      "Häufige Fragen schnell nach Themen sortiert",
      "Antworten zu Profil, Premium und allgemeinen Funktionen",
      "klarer Weg zum Support, wenn noch etwas offen bleibt",
    ],
    sections: [
      {
        heading: "Die wichtigsten Hilfebereiche",
        paragraphs: [
          "Die Live-Hilfe bündelt typische Fragen von neuen und aktiven Mitgliedern in klaren Themenclustern. Das spart Zeit, besonders wenn es um wiederkehrende Fragen zur Mitgliedschaft oder zu Funktionen geht.",
        ],
        bullets: [
          "Willkommen & Grundlagen",
          "Mein Profil",
          "Premium-Mitgliedschaft",
          "Nachrichten, Kontakte und Sicherheit",
        ],
      },
      {
        heading: "Wenn die Antwort noch fehlt",
        paragraphs: [
          "Nicht jede Situation lässt sich mit einem Standardtext lösen. Darum bleibt der Support wichtig, wenn es um individuelle Fragen, technische Probleme oder persönliche Anliegen geht.",
          "Die Hilfeseite soll deshalb nicht nur Fragen sammeln, sondern den Weg zur passenden Unterstützung möglichst kurz halten.",
        ],
      },
    ],
    ctaLabel: "Zum Support",
    ctaHref: "https://alleinerziehende-singles.de/hilfe/",
  },
];

export function getServicePageBySlug(slug: string) {
  return servicePages.find((page) => page.slug === slug) ?? null;
}
