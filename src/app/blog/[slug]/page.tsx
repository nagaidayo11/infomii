import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getPostCategories, getRelatedPosts } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo/structured-data";

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
    return { title: "記事が見つかりません", robots: { index: false, follow: false } };
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
      ...(post.updated ? { modifiedTime: `${post.updated}T00:00:00.000Z` } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const categories = getPostCategories(post.slug);
  const primaryCategory = categories[0] ?? null;
  const relatedPosts = getRelatedPosts(post.slug, 4);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          organizationJsonLd(),
          articleJsonLd({
            title: post.title,
            description: post.description,
            slug: post.slug,
            datePublished: `${post.date}T00:00:00.000Z`,
            ...(post.updated ? { dateModified: `${post.updated}T00:00:00.000Z` } : {}),
          }),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/lp/business" },
            { name: "ブログ", path: "/blog" },
            ...(primaryCategory
              ? [{ name: primaryCategory.label, path: `/blog/category/${primaryCategory.id}` }]
              : []),
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <nav aria-label="パンくず" className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
          <Link href="/blog" className="hover:text-emerald-700">
            ブログ
          </Link>
          {primaryCategory ? (
            <>
              <span aria-hidden className="text-slate-300">
                /
              </span>
              <Link href={`/blog/category/${primaryCategory.id}`} className="hover:text-emerald-700">
                {primaryCategory.label}
              </Link>
            </>
          ) : null}
        </nav>
        <p className="mt-4 text-xs font-medium text-slate-500">
          公開 {post.date}
          {post.updated ? ` · 更新 ${post.updated}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{post.description}</p>
        {categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.id}`}
                className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                {category.label}
              </Link>
            ))}
          </div>
        ) : null}

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
            href="/lp/business"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-emerald-700"
          >
            無料で館内案内を作る
          </Link>
        </section>
      </article>

      {relatedPosts.length > 0 ? (
        <aside className="mx-auto mt-8 w-full max-w-3xl">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">関連する記事</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedPosts.map((related) => (
              <li key={related.slug}>
                <Link
                  href={`/blog/${related.slug}`}
                  className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <span className="text-sm font-semibold leading-snug text-slate-900">{related.title}</span>
                  <span className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">{related.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </main>
  );
}

