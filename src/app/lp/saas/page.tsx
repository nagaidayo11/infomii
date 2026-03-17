import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, Container, Section } from "@/components/ui";
import { CheckoutButton } from "@/components/lp/CheckoutButton";
import { LpHero } from "@/components/lp/LpHero";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: "Infomii | ホテル案内ページを3分で作成",
  description:
    "WiFi・朝食・施設案内をゲストにQRページで共有。ホテル向けのシンプルなSaaSです。",
  alternates: { canonical: "/lp/saas" },
  openGraph: {
    url: `${appUrl}/lp/saas`,
    title: "Infomii | ホテル案内ページを3分で作成",
    description:
      "WiFi・朝食・施設案内をゲストにQRページで共有。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | ホテル案内ページを3分で作成",
    description: "WiFi・朝食・施設案内をQRでゲストに共有。",
  },
};

export default function LpSaaSPage() {
  const loginHref = "/login?ref=lp-saas";
  const ctaHref = "/login?ref=lp-saas&next=%2Fdashboard%3Ftab%3Dcreate";

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors duration-200">
        <Container className="flex h-14 items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Infomii
          </span>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              機能
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              使い方
            </a>
            <a
              href="#pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              料金
            </a>
            <Button href={loginHref} variant="ghost" size="md" className="rounded-lg">
              ログイン
            </Button>
            <Button href={ctaHref} size="md">
              無料でページを作成
            </Button>
          </nav>
        </Container>
      </header>

      <LpHero ctaHref={ctaHref} />

      <Section
        kicker="こんな課題はありませんか"
        title="ゲスト向け情報がバラけて、更新も大変"
        description="紙の案内はすぐ古くなる。フロントは同じWiFiや朝食の説明を何度も繰り返す。変更のたびに印刷し直し、周知も大変。"
        variant="muted"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "印刷した案内は内容が変わるたびにすぐ古くなる",
            "フロントが同じ質問に何度も答える時間がかかる",
            "WiFi・営業時間・施設案内が1か所にまとまっていない",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 transition-colors duration-200 hover:border-slate-300/80"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                !
              </span>
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </li>
          ))}
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <Section
        kicker="解決策"
        title="1つのQRで1ページ。いつでも最新のまま。"
        description="Infomiiなら、スマホで見やすい案内ページを数分で作成。いつでも編集でき、ゲストは常に最新のWiFi・朝食・施設情報を確認できます。印刷し直しも、伝言の手間も不要です。"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "1回更新すれば、リンクを持つ全ゲストに同じ内容が届く",
            "ロビーや客室に1枚のQR—WiFi・朝食・地図などをまとめて案内",
            "開発不要。テキスト・画像・ボタン・スケジュールをエディタで追加するだけ",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors duration-200 hover:border-slate-300/80 hover:bg-slate-50/80"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                ✓
              </span>
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </li>
          ))}
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <Section
        id="live-demo"
        kicker="ライブデモ"
        title="エディタを触って、ゲスト表示を確認"
        description="ページビルダーを開き、カードを追加して、ゲストのスマホでの見え方をプレビュー。登録なしで試せます。"
        variant="muted"
      >
        <ScrollReveal>
          <div className="flex flex-wrap gap-4 sm:gap-5">
          <Button href="/dashboard" size="lg">
            ページビルダーを開く
          </Button>
          <Button href="/p/demo-hub-menu" variant="secondary" size="lg">
            サンプルゲストページを見る
          </Button>
        </div>
        </ScrollReveal>
      </Section>

      <Section
        id="features"
        kicker="機能"
        title="ゲスト案内に必要な機能をまとめて"
        description="ブロック形式のエディタ、スマホプレビュー、QR・共有URL。ホテルとフロント向けに設計しています。"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
          {[
            {
              title: "ブロックエディタ",
              desc: "テキスト・画像・地図・ボタン・WiFi情報・スケジュール・メニューを追加。ドラッグで並べ替え。",
            },
            {
              title: "スマホプレビュー",
              desc: "編集しながら、スマホでの見え方をその場で確認。375px幅のプレビュー付き。",
            },
            {
              title: "QR・共有URL",
              desc: "公開すると安定したURLを取得。ロビー・客室・卓上用にQRコードを印刷して配布可能。",
            },
            {
              title: "ノーコード",
              desc: "WiFiパスワードや朝食時間を数秒で更新。開発者不要。",
            },
            {
              title: "テンプレート",
              desc: "ホテル向けテンプレートから開始し、自施設用にカスタマイズ。",
            },
            {
              title: "分析（Pro）",
              desc: "ページの閲覧数や流入元を確認し、改善に活かせます。",
            },
          ].map((f) => (
            <Card key={f.title} padding="lg" hover>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </Card>
          ))}
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <Section
        id="how-it-works"
        kicker="使い方"
        title="3ステップで最初の1ページを"
        variant="muted"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "テンプレートを選ぶ",
              desc: "白紙またはホテル向けテンプレートから開始。テキスト・画像・WiFi・スケジュールなどのカードを追加。",
            },
            {
              step: "2",
              title: "編集してプレビュー",
              desc: "情報を入力すると、ゲスト表示がリアルタイムで更新。カードはドラッグで並べ替え可能。",
            },
            {
              step: "3",
              title: "公開して共有",
              desc: "公開するとURLを取得。QRコードを印刷するかリンクを共有。ゲストは常に最新版を表示。",
            },
          ].map((item) => (
            <div key={item.step}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <Section
        id="pricing"
        kicker="料金"
        title="シンプルなプラン。無料から始められます。"
        description="最初の1ページは無料で作成可能。ページ数や分析が必要になったらPro、10ページ以上ならBusinessへアップグレードできます。"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
          <Card padding="lg" className="rounded-2xl p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Free
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-900">¥0</p>
            <p className="mt-1 text-sm text-slate-500">1ページから始められる無料プラン</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">✓ 公開ページ1本</li>
              <li className="flex items-center gap-2">✓ ブロックエディタ・スマホプレビュー</li>
              <li className="flex items-center gap-2">✓ 共有URL・QR発行</li>
            </ul>
            <Button href={ctaHref} variant="secondary" className="mt-6">
              無料で始める
            </Button>
          </Card>
          <div className="rounded-2xl border-2 border-slate-900 bg-slate-50/50 p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Pro
              </p>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                おすすめ
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              ¥1,980
              <span className="text-base font-normal text-slate-600">/月</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">5ページまで・分析・サポート付き</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">✓ 公開ページ5本まで</li>
              <li className="flex items-center gap-2">✓ ノードマップ・複数ページ連携</li>
              <li className="flex items-center gap-2">✓ 閲覧分析</li>
              <li className="flex items-center gap-2">✓ 優先サポート</li>
            </ul>
            <CheckoutButton plan="pro" className="mt-6">
              Proを申し込む
            </CheckoutButton>
          </div>
          <Card padding="lg" className="rounded-2xl p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Business
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              ¥4,980
              <span className="text-base font-normal text-slate-600">/月</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">10ページ以上・チーム・API対応</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">✓ 公開ページ無制限</li>
              <li className="flex items-center gap-2">✓ Proの全機能</li>
              <li className="flex items-center gap-2">✓ チーム招待</li>
              <li className="flex items-center gap-2">✓ API・ホワイトラベル</li>
            </ul>
            <CheckoutButton plan="business" variant="secondary" className="mt-6">
              Businessを申し込む
            </CheckoutButton>
          </Card>
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <section className="bg-slate-900 py-16 sm:py-20">
        <ScrollReveal>
          <Container size="sm" className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              3分で無料の案内ページを作成
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              クレジットカード不要。テンプレートまたは白紙から始めて、すぐに公開・QR共有できます。
            </p>
            <div className="mt-8">
              <Button href={ctaHref} variant="inverted" size="lg" className="px-8">
                無料でページを作成
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              すでにアカウントをお持ちの方は{" "}
              <Link href={loginHref} className="font-medium text-white underline hover:no-underline">
                ログイン
              </Link>
            </p>
          </Container>
        </ScrollReveal>
      </section>

      <footer className="border-t border-slate-200/80 bg-white py-8 transition-colors duration-200">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Infomii</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/terms" className="text-slate-600 transition-colors duration-200 hover:text-slate-900">
              利用規約
            </Link>
            <Link href="/privacy" className="text-slate-600 transition-colors duration-200 hover:text-slate-900">
              プライバシーポリシー
            </Link>
            <Link href={loginHref} className="text-slate-600 transition-colors duration-200 hover:text-slate-900">
              ログイン
            </Link>
          </div>
        </Container>
      </footer>
    </main>
  );
}