import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { HOME_ARTICLES } from '../../data/siteContent';

export default function TrendingArticles() {
  return (
    <section className="container-page pb-14 pt-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Trending Articles</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900">Content blocks that keep the homepage feeling alive</h2>
        </div>
        <Link to="/articles" className="hidden items-center gap-2 text-sm font-semibold text-brand-700 sm:inline-flex">
          Read all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {HOME_ARTICLES.map((article) => (
          <Link
            key={article.title}
            to={article.href}
            className="rounded-[24px] border border-[#dce5e8] bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
          >
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
              <TrendingUp className="h-3.5 w-3.5" /> {article.category}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-ink-900">{article.title}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-500">{article.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
              Open article <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
