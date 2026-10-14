import { ArrowIcon, FamilyHeartIcon } from "@/components/icons";
import { ArticleLink } from "@/components/magazine/article-link";
import { excerptText, readingMinutes, stripTags, themeForCategories } from "@/lib/magazine";
import { formatArticleUpdated, type MagazineEntry } from "@/lib/magazine-content";
import type { MarketCode } from "@/lib/markets";

/** Artikelkarte fürs Magazin: Bild, Thema, Titel, Auszug, Datum und Lesezeit. Der Artikel selbst liegt immer auf .de. */
export function PostCard({ post, large = false, market = "de" }: { post: MagazineEntry; large?: boolean; market?: MarketCode }) {
  const theme = themeForCategories(post.categoryIds);
  return (
    <ArticleLink className={`aemag-card${large ? " aemag-card-large" : ""}`} market={market} slug={post.slug}>
      <span className="aemag-card-media">
        {post.featuredImageUrl ? <img src={post.featuredImageUrl} alt={post.featuredImageAlt || stripTags(post.titleHtml)} loading={large ? "eager" : "lazy"} decoding="async" /> : <FamilyHeartIcon />}
        {theme ? <span className={`aemag-chip aemag-chip-${theme.key}`}>{theme.short}</span> : null}
      </span>
      <span className="aemag-card-body">
        <small>{formatArticleUpdated(post)} · {readingMinutes(post.contentHtml || post.excerptHtml)} Min. Lesezeit</small>
        <strong>{stripTags(post.titleHtml)}</strong>
        <span className="aemag-card-excerpt">{excerptText(post.excerptHtml)}</span>
        <em>Weiterlesen <ArrowIcon /></em>
      </span>
    </ArticleLink>
  );
}
