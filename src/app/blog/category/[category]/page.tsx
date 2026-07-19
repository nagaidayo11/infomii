import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_CATEGORIES, getCategory, getPostsByCategory } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

type BlogCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = getCategory(categoryId);
  if (!category) {
    return { title: "カテゴリが見つかりません", robots: { index: false, follow: false } };
  }
  const title = `${category.label}の記事`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/blog/category/${category.id}` },
    openGraph: {
      title: `${title} | Infomiiブログ`,
      description: category.description,
      url: `${appUrl}/blog/category/${category.id}`,
      type: "website",
    },
  };
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { category: categoryId } = await params;
  const category = getCategory(categoryId);
  if (!category) notFound();

  const posts = getPostsByCategory(category.id);

  return (
    <main className="min-h-screen bg-[#F2FBF7] px-4 py-10 text-slate-900 antialiased sm:px-6">
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/" },
            { name: "ブログ", path: "/blog" },
            { name: category.label, path: `/blog/category/${category.id}` },
          ]),
          itemListJsonLd(
            `${category.label}の記事一覧`,
            posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
          ),
        ]}
      />
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <nav aria-label="パンくず" className="mb-4 flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
            <Link href="/blog" className="hover:text-emerald-700">
              ブログ
            </Link>
            <span aria-hidden className="text-slate-300">
              /
            </span>
            <span className="text-slate-700">{category.label}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Infomii Blog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 drop-shadow-[0_3px_0_rgba(16,185,129,0.15)] sm:text-4xl">
            {category.label}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{category.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/60"
            >
              すべて
            </Link>
            {BLOG_CATEGORIES.map((item) => (
              <Link
                key={item.id}
                href={`/blog/category/${item.id}`}
                aria-current={item.id === category.id ? "page" : undefined}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  item.id === category.id
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "border-emerald-100 bg-white text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-emerald-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            このカテゴリの記事はまだありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm ring-1 ring-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <p className="text-xs font-medium text-slate-500">{post.date}</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                  <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{post.description}</p>
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60"
                  >
                    記事を読む
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
