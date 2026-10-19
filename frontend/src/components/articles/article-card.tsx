import Image from "next/image";
import Link from "next/link";
import { Clock, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLanguage } from "@/lib/i18n-server";

type ArticleCardProps = {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    readingTime: number;
    featured?: boolean;
    featuredImage?: string | null;
    category?: { name: string };
    author?: { name: string | null };
  };
};

export async function ArticleCard({ article }: ArticleCardProps) {
  const {
    messages: { common },
  } = await getLanguage();
  return (
    <article className="rounded-lg border border-line/10 bg-surface p-5 shadow-xl shadow-card-shadow transition hover:-translate-y-1 hover:border-cyan-300/40">
      {article.featuredImage && (
        <Link href={`/articles/${article.slug}`} className="mb-5 block">
          <Image
            unoptimized
            width={1200}
            height={675}
            src={article.featuredImage}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="aspect-video w-full rounded-lg object-cover"
          />
        </Link>
      )}
      <div className="mb-4 flex items-center justify-between gap-3">
        <StatusBadge label={article.category?.name || common.article} />
        {article.featured ? <StatusBadge label={common.featured} tone="orange" /> : null}
      </div>
      <Link href={`/articles/${article.slug}`}>
        <h3 className="line-clamp-2 text-xl font-black leading-8 text-foreground hover:text-accent">
          {article.title}
        </h3>
      </Link>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{article.excerpt}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-subtle">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" /> {article.author?.name || "21CT"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {article.readingTime} {common.minutes}
        </span>
      </div>
    </article>
  );
}
