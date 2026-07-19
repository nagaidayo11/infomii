import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "記事が見つかりません" };
  }
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      siteName: "Infomii",
      title: post.title,
      description: post.description,
      type: "article",
      url: `${appUrl}/blog/${post.slug}`,
      publishedTime: `${post.date}T00:00:00.000Z`,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Infomii | ホテル案内ページ作成SaaS",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/twitter-image"],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            description: post.description,
            slug: post.slug,
            datePublished: `${post.date}T00:00:00.000Z`,
          }),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/" },
            { name: "ブログ", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/blog" className="text-sm font-medium text-slate-500 hover:text-emerald-700">
          ← ブログ一覧へ戻る
        </Link>
        <p className="mt-4 text-xs font-medium text-slate-500">{post.date}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{post.description}</p>

        <div
          className="mt-8 text-[15px]"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <section className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-semibold text-emerald-900">無料で館内案内を作る</h2>
          <p className="mt-2 text-sm leading-7 text-emerald-800">
            現場の案内をそのままQR化したい場合は、InfomiiのLPからすぐに無料で始められます。
          </p>
          <Link
            href="/lp/saas"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-emerald-700"
          >
            無料で館内案内を作る
          </Link>
        </section>
      </article>
    </main>
  );
}

