import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_CATEGORIES, getAllPosts, getPillarPosts } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { InfomiiWordmark } from "@/components/brand/InfomiiWordmark";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

const READ_CTA_SOLID_CLASS =
  "inline-flex min-h-[40px] items-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold !text-white hover:bg-emerald-700 hover:!text-white";

const READ_CTA_OUTLINE_CLASS =
  "inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60";

export const metadata: Metadata = {
  title: "ブログ",
  description: "ホテルの館内案内の作り方、QRコード化、ホテルDX、紙からの置き換えまで。宿泊施設の現場向け実践記事。",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Infomiiブログ | ホテル運営に効くQR案内ノウハウ",
    description: "ホテルの館内案内の作り方、QR化、ホテルDX、紙からの置き換えまで。宿泊施設の現場向け実践記事。",
    url: `${appUrl}/blog`,
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const pillars = getPillarPosts();
  const pillarSlugs = new Set(pillars.map((post) => post.slug));
  const rest = posts.filter((post) => !pillarSlugs.has(post.slug));

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
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            <InfomiiWordmark /> Blog
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 drop-shadow-[0_3px_0_rgba(16,185,129,0.15)] sm:text-4xl">
            ホテル運営をラクにする実践記事
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            館内案内の作り方、QR化、ホテルDX、ツール比較まで。課題を整理してから無料登録へ進める導線です。
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

        {pillars.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">まず読む記事</h2>
            <p className="mt-1 text-sm text-slate-600">検索されやすい入口。作り方・QR化・比較から Infomii の機能まで。</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pillars.map((post) => (
                <article
                  key={post.slug}
                  className="flex h-full flex-col rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">入口記事</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{post.description}</p>
                  <div className="mt-auto pt-4">
                    <Link href={`/blog/${post.slug}`} className={READ_CTA_SOLID_CLASS}>
                      記事を読む
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section>
            <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">その他の記事</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((post) => (
                <article
                  key={post.slug}
                  className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm ring-1 ring-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <p className="text-xs font-medium text-slate-500">{post.date}</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{post.description}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link href={`/blog/${post.slug}`} className={READ_CTA_OUTLINE_CLASS}>
                      記事を読む
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

