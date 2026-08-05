import { Link } from 'react-router-dom';
import { HOME_ARTICLES } from '../data/siteContent';

export default function Articles() {
  return (
    <div className="container-page py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-700">Trending Articles</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900">Guides that help users buy, sell, and repair with more confidence</h1>
        <p className="mt-3 text-ink-600">
          This section is built for trust, SEO, and repeat discovery so Fundu feels more useful than a one-time transaction page.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {HOME_ARTICLES.map((article) => (
          <article key={article.title} className="rounded-[28px] border border-ink-100 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">{article.category}</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink-900">{article.title}</h2>
            <p className="mt-3 text-sm text-ink-500">{article.excerpt}</p>
            <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              Ask about this topic
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
