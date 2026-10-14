import { ArrowIcon, FamilyHeartIcon } from "@/components/icons";
import { ArticleLink } from "@/components/magazine/article-link";
import { excerptText, readingMinutes, stripTags, themeForCategories } from "@/lib/magazine";
import { formatArticleUpdated, type MagazineEntry } from "@/lib/magazine-content";
import type { MarketCode } from "@/lib/markets";

/**
 * Artikelkarte fürs Magazin: Bild, Thema, Titel, Auszug, Datum und Lesezeit. Der Artikel selbst liegt immer auf .de.
 * Verlinkt ist nur der Titel (sauberer Linktext statt Datum, Lesezeit und Auszug – Seobility „Linktext zu lang“);
 * die ganze Karte bleibt über die gestreckte Klickfläche von .aemag-card-link klickbar.
 */
export function PostCard({ post, large = false, market = "de" }: { post: MagazineEntry; large?: boolean; market?: MarketCode }) {
  const theme = themeForCategories(post.categoryIds);
  return (
    <article className={`aemag-card${large ? " aemag-card-large" : ""}`}>
      <span className="aemag-card-media">
        {post.featuredImageUrl ? <img src={post.featuredImageUrl} alt={post.featuredImageAlt || stripTags(post.titleHtml)} loading={large ? "eager" : "lazy"} decoding="async" /> : <FamilyHeartIcon />}
        {theme ? <span className={`aemag-chip aemag-chip-${theme.key}`}>{theme.short}</span> : null}
      </span>
      <span className="aemag-card-body">
        <small>{formatArticleUpdated(post)} · {readingMinutes(post.contentHtml || post.excerptHtml)} Min. Lesezeit</small>
        <strong><ArticleLink className="aemag-card-link" market={market} slug={post.slug}>{stripTags(post.titleHtml)}</ArticleLink></strong>
        <span className="aemag-card-excerpt">{excerptText(post.excerptHtml)}</span>
        <em aria-hidden="true">Weiterlesen <ArrowIcon /></em>
      </span>
    </article>
  );
}
