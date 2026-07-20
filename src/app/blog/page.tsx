import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_CATEGORIES, getAllPosts } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: "ブログ",
  description: "ホテル運営に役立つQR館内案内の実践記事。現場課題から導入ステップまで、初心者向けにわかりやすく解説します。",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Infomiiブログ | ホテル運営に効くQR案内ノウハウ",
    description: "ホテル向けQR館内案内の実践記事。現場課題から導入ステップまで、初心者向けにわかりやすく解説します。",
    url: `${appUrl}/blog`,
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#F2FBF7] px-4 py-10 text-slate-900 antialiased sm:px-6">
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/lp/business" },
            { name: "ブログ", path: "/blog" },
          ]),
          itemListJsonLd(
            "Infomiiブログの記事一覧",
            posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
          ),
        ]}
      />
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <div className="mb-4">
            <Link
              href="/lp/business"
              className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              ← 戻る
            </Link>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Infomii Blog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 drop-shadow-[0_3px_0_rgba(16,185,129,0.15)] sm:text-4xl">
            ホテル運営をラクにする実践記事
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            記事で課題を整理し、LPで機能を確認して、無料登録へ進める導線を用意しています。
          </p>

          <nav aria-label="カテゴリ" className="mt-5 flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.id}`}
                className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </header>

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
              <div className="mt-4 flex flex-wrap gap-2">
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
      </div>
    </main>
  );
}

