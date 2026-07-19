import Link from "next/link";
import { Clock, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type ArticleCardProps = {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    readingTime: number;
    featured?: boolean;
    category?: { name: string };
    author?: { name: string | null };
  };
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-300/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <StatusBadge label={article.category?.name || "Article"} />
        {article.featured ? <StatusBadge label="Featured" tone="orange" /> : null}
      </div>
      <Link href={`/articles/${article.slug}`}>
        <h3 className="line-clamp-2 text-xl font-black leading-8 text-white hover:text-cyan-200">{article.title}</h3>
      </Link>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-300">{article.excerpt}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {article.author?.name || "21CT"}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.readingTime} min</span>
      </div>
    </article>
  );
}
