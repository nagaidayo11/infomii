import type { Metadata } from "next";
import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: "Infomii | Create hotel information pages in 3 minutes",
  description:
    "Share WiFi, breakfast, and facility information with guests via a simple QR page. Modern, minimal SaaS for hotels.",
  alternates: { canonical: "/lp/saas" },
  openGraph: {
    url: `${appUrl}/lp/saas`,
    title: "Infomii | Create hotel information pages in 3 minutes",
    description:
      "Share WiFi, breakfast, and facility information with guests via a simple QR page.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | Hotel information pages in 3 minutes",
    description: "Share WiFi, breakfast, and facility info with guests via QR.",
  },
};

const sectionKicker =
  "text-xs font-semibold uppercase tracking-wider text-slate-500";

function HeroVisuals() {
  return (
    <div className="relative flex flex-wrap items-end justify-center gap-4 sm:gap-6 lg:gap-8">
      {/* Editor screenshot mock */}
      <div
        className="w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] lg:max-w-[320px]"
        aria-hidden
      >
        <div className="flex border-b border-slate-100 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </div>
          <span className="ml-3 text-[10px] font-medium text-slate-400">
            Page editor
          </span>
        </div>
        <div className="flex gap-0 p-2">
          <div className="w-8 shrink-0 rounded-l-lg bg-slate-50 py-2" />
          <div className="min-h-[140px] flex-1 space-y-2 rounded-r-lg border border-slate-100 bg-white p-3">
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-50" />
            <div className="h-3 w-5/6 rounded bg-slate-50" />
            <div className="mt-3 h-8 w-full rounded-lg bg-ds-primary/10" />
          </div>
        </div>
      </div>

      {/* Mobile preview mock */}
      <div
        className="relative w-[160px] shrink-0 overflow-hidden rounded-[1.25rem] border-[6px] border-slate-800 bg-slate-800 shadow-xl sm:w-[180px]"
        aria-hidden
      >
        <div className="absolute left-1/2 top-2 h-5 w-14 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="mt-6 min-h-[200px] bg-[#fafaf9] p-3">
          <div className="mb-2 h-2.5 w-16 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
          <div className="mt-4 h-9 w-full rounded-xl bg-ds-primary/20" />
        </div>
      </div>

      {/* QR code placeholder */}
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white shadow-sm sm:h-28 sm:w-28"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-12 w-12 text-slate-700 sm:h-14 sm:w-14"
          fill="currentColor"
        >
          <rect x="2" y="2" width="5" height="5" />
          <rect x="11" y="2" width="5" height="5" />
          <rect x="2" y="11" width="5" height="5" />
          <rect x="8" y="8" width="2" height="2" />
          <rect x="14" y="8" width="2" height="2" />
          <rect x="8" y="14" width="2" height="2" />
          <rect x="11" y="11" width="5" height="5" />
          <rect x="14" y="14" width="2" height="2" />
        </svg>
      </div>
    </div>
  );
}

export default function LpSaaSPage() {
  const loginHref = "/login?ref=lp-saas";
  const ctaHref = "/login?ref=lp-saas&next=%2Fdashboard%3Ftab%3Dcreate";

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 antialiased">
      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Infomii
          </span>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Pricing
            </a>
            <Link
              href={loginHref}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link
              href={ctaHref}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create your free page
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Create hotel information pages in 3 minutes
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Share WiFi, breakfast, and facility information with guests via a
              simple QR page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={ctaHref}
                className="inline-flex rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Create your free page
              </Link>
              <Link
                href="#live-demo"
                className="inline-flex rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                See live demo
              </Link>
            </div>
          </div>
          <div className="mt-14 lg:mt-16">
            <HeroVisuals />
          </div>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section className="border-b border-slate-200/80 bg-[#fafafa] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className={sectionKicker}>The problem</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Guest information is scattered and hard to update
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Paper handouts go out of date. Staff repeat the same WiFi and
            breakfast details dozens of times a day. Changes take reprints and
            re-training.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Printed guides become outdated as soon as something changes",
              "Front desk spends time answering the same questions again and again",
              "No single place for WiFi, hours, and facility info",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  !
                </span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Solution ─── */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className={sectionKicker}>The solution</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            One QR code. One page. Always up to date.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Infomii lets you build a mobile-friendly information page in minutes.
            Edit anytime—guests always see the latest WiFi, breakfast times, and
            facility info. No reprints, no confusion.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Update once; every guest with the link sees the change",
              "One QR in the lobby or room—WiFi, breakfast, map, and more",
              "No coding. Add text, images, buttons, and schedules in a simple editor",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  ✓
                </span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Live Demo ─── */}
      <section
        id="live-demo"
        className="border-b border-slate-200/80 bg-[#fafafa] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className={sectionKicker}>Live demo</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Try the editor and see the guest view
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Open the page builder, add cards, and preview how guests see the page
            on their phone. No signup required to explore.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/editor/builder"
              className="inline-flex rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white hover:bg-slate-800"
            >
              Open page builder
            </Link>
            <Link
              href="/p/demo-hub-menu"
              className="inline-flex rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              View sample guest page
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section
        id="features"
        className="border-b border-slate-200/80 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className={sectionKicker}>Features</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need for guest information
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Block-based editor, mobile preview, and QR-ready URLs. Built for
            hotels and front-desk teams.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Block editor",
                desc: "Add text, images, maps, buttons, WiFi info, schedules, and menus. Drag to reorder.",
              },
              {
                title: "Mobile preview",
                desc: "See exactly how the page looks on a phone as you edit. 375px preview built in.",
              },
              {
                title: "QR & share URL",
                desc: "Publish and get a stable URL. Print QR codes for lobby, rooms, or table tents.",
              },
              {
                title: "No code",
                desc: "Update WiFi password or breakfast hours in seconds. No developer needed.",
              },
              {
                title: "Templates",
                desc: "Start from hotel-focused templates and customize for your property.",
              },
              {
                title: "Analytics (Pro)",
                desc: "See how many guests view your page and where they came from.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-slate-300 hover:shadow-md"
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        id="how-it-works"
        className="border-b border-slate-200/80 bg-[#fafafa] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className={sectionKicker}>How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Three steps to your first page
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create or pick a template",
                desc: "Start from a blank page or a hotel template. Add cards for text, images, WiFi, schedule, and more.",
              },
              {
                step: "2",
                title: "Edit and preview",
                desc: "Fill in your info and see the guest view update in real time. Drag cards to reorder.",
              },
              {
                step: "3",
                title: "Publish and share",
                desc: "Publish to get a URL. Print a QR code or share the link. Guests always see the latest version.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        className="border-b border-slate-200/80 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className={sectionKicker}>Pricing</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple plans. Start free.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Create your first page at no cost. Upgrade when you need more pages
            or analytics.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Free
              </p>
              <p className="mt-3 text-4xl font-bold text-slate-900">$0</p>
              <p className="mt-1 text-sm text-slate-500">Get started with one page</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">✓ One published page</li>
                <li className="flex items-center gap-2">✓ Block editor & mobile preview</li>
                <li className="flex items-center gap-2">✓ Share URL & QR</li>
              </ul>
              <Link
                href={ctaHref}
                className="mt-6 inline-flex rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Start free
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-slate-900 bg-slate-50/50 p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Pro
                </p>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Recommended
                </span>
              </div>
              <p className="mt-3 text-4xl font-bold text-slate-900">
                ¥1,980
                <span className="text-base font-normal text-slate-600">/month</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">More pages, analytics, and support</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">✓ Multiple pages</li>
                <li className="flex items-center gap-2">✓ Node map & multi-page flow</li>
                <li className="flex items-center gap-2">✓ View analytics</li>
                <li className="flex items-center gap-2">✓ Priority support</li>
              </ul>
              <Link
                href={ctaHref}
                className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create your free page in 3 minutes
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            No credit card required. Start with a template or a blank page—you
            can publish and share a QR link right away.
          </p>
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 hover:bg-slate-100"
            >
              Create your free page
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href={loginHref} className="font-medium text-white underline hover:no-underline">
              Log in
            </Link>
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Infomii</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/terms" className="text-slate-600 hover:text-slate-900">
              Terms
            </Link>
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
              Privacy
            </Link>
            <Link href={loginHref} className="text-slate-600 hover:text-slate-900">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
