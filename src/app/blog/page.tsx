import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

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
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Infomii Blog</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">ホテル運営をラクにする実践記事</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            記事で課題を整理し、LPで機能を確認して、無料登録へ進める導線を用意しています。
          </p>
        </header>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-medium text-slate-500">{post.date}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{post.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  記事を読む
                </Link>
                <Link
                  href="/lp/saas"
                  className="inline-flex min-h-[40px] items-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold !text-white hover:bg-emerald-700"
                >
                  無料で館内案内を作る
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

