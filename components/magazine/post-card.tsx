import Link from "next/link";
import { ArrowIcon, FamilyHeartIcon } from "@/components/icons";
import { excerptText, readingMinutes, stripTags, themeForCategories } from "@/lib/magazine";
import { formatArticleUpdated, type MagazineEntry } from "@/lib/magazine-content";

/** Artikelkarte fürs Magazin: Bild, Thema, Titel, Auszug, Datum und Lesezeit. */
export function PostCard({ post, large = false }: { post: MagazineEntry; large?: boolean }) {
  const theme = themeForCategories(post.categoryIds);
  return (
    <Link className={`aemag-card${large ? " aemag-card-large" : ""}`} href={`/magazin/${post.slug}/`}>
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
    </Link>
  );
}
