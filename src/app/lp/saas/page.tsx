import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, Container, Section } from "@/components/ui";
import { CheckoutButton } from "@/components/lp/CheckoutButton";
import { LpHero } from "@/components/lp/LpHero";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";
const SAMPLE_PAGE_HREF = "/p/demo-hub-menu";

export const metadata: Metadata = {
  title: "Infomii | QRひとつで館内案内を3分で。フロント向け",
  description:
    "口頭説明・紙の更新の手間を減らすホテル向けSaaS。WiFi・朝食・設備を1枚のQRで。ビジネスホテル・少人数運営向け。",
  alternates: { canonical: "/lp/saas" },
  openGraph: {
    url: `${appUrl}/lp/saas`,
    title: "Infomii | QRひとつで館内案内を3分で",
    description:
      "フロントの説明・紙更新を減らし、ゲストには常に最新の案内を。登録なしでサンプルを体験できます。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | QRひとつで館内案内を3分で",
    description: "フロント向け・少人数ホテル向け。WiFi・朝食・設備を1ページに。",
  },
};

function LpMidCta({
  ctaHref,
  sampleHref,
  headline,
  sub,
}: {
  ctaHref: string;
  sampleHref: string;
  headline: string;
  sub: string;
}) {
  return (
    <section className="border-b border-slate-200/80 bg-emerald-50/50 py-12 sm:py-14">
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="max-w-xl">
          <p className="text-lg font-bold text-slate-900 sm:text-xl">{headline}</p>
          <p className="mt-1 text-sm text-slate-600">{sub}</p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Button href={sampleHref} size="lg" className="w-full sm:w-auto">
            30秒で試す（登録なし）
          </Button>
          <Button href={ctaHref} variant="secondary" size="lg" className="w-full sm:w-auto">
            無料で作成する
          </Button>
        </div>
      </Container>
    </section>
  );
}

function LpSolutionPhoneMock() {
  return (
    <div
      className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-[1.75rem] border-[7px] border-slate-800 bg-slate-800 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]"
      aria-hidden
    >
      <div className="absolute left-1/2 top-2.5 h-5 w-16 -translate-x-1/2 rounded-full bg-slate-900" />
      <div className="mt-8 min-h-[280px] bg-[#fafaf9] px-4 pb-6 pt-2">
        <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          ゲストのスマホ表示
        </p>
        <div className="mt-3 space-y-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <div className="h-2.5 w-2/3 rounded bg-slate-200" />
          <div className="h-2 w-full rounded bg-slate-100" />
          <div className="h-2 w-5/6 rounded bg-slate-100" />
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-14 flex-1 rounded-lg bg-emerald-100/80 ring-1 ring-emerald-200/60" />
          <div className="h-14 flex-1 rounded-lg bg-slate-100 ring-1 ring-slate-200/80" />
        </div>
        <div className="mt-3 h-10 w-full rounded-xl bg-slate-900/90" />
        <p className="mt-2 text-center text-[9px] text-slate-400">WiFi · 朝食 · 館内案内</p>
      </div>
    </div>
  );
}

export default function LpSaaSPage() {
  const loginHref = "/login?ref=lp-saas";
  const ctaHref = "/login?ref=lp-saas&next=%2Fdashboard%3Ftab%3Dcreate";
  const hasProAnnual = !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const hasBusinessAnnual = !!process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors duration-200">
        <Container className="flex h-14 items-center justify-between gap-2">
          <span className="text-lg font-semibold tracking-tight text-slate-900">Infomii</span>
          <nav className="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1">
            <a
              href="#live-demo"
              className="rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:text-sm"
            >
              デモ
            </a>
            <a
              href="#pain"
              className="hidden rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 sm:block sm:px-3 sm:text-sm"
            >
              課題
            </a>
            <a
              href="#before-after"
              className="hidden rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 md:block sm:px-3 sm:text-sm"
            >
              比較
            </a>
            <a
              href="#pricing"
              className="rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:text-sm"
            >
              料金
            </a>
            <Button href={loginHref} variant="ghost" size="md" className="rounded-lg px-2 sm:px-4">
              ログイン
            </Button>
            <Button href={ctaHref} size="md" className="px-3 sm:px-4">
              無料で作成
            </Button>
          </nav>
        </Container>
      </header>

      <LpHero ctaHref={ctaHref} samplePageHref={SAMPLE_PAGE_HREF} />

      <Section
        id="pain"
        kicker="こんな状態になっていませんか？"
        title="説明と紙運用が、フロントを削っていく"
        description="痛みが積み重なると、気づかないうちに時間もミスも増えます。現場の声からよく聞くのは次のパターンです。"
        variant="muted"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "同じ説明を何度もしている（WiFi・朝食・館内ルール）",
              "外国人対応でフロントが埋まり、他の業務が止まる",
              "紙の案内はすぐ古くなり、差し替えと周知に追われる",
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

      <LpMidCta
        ctaHref={ctaHref}
        sampleHref={SAMPLE_PAGE_HREF}
        headline="まずはサンプルを触る。登録は後でいい。"
        sub="ゲストに見える画面を、そのまま体験できます。"
      />

      <section
        id="solution"
        className="border-b border-slate-200/80 bg-white py-16 sm:py-20 transition-colors duration-200"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">解決策</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Infomiiなら、すべて1つのQRで完結
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            チェックイン案内・WiFi・朝食・館内設備。ゲストが迷う情報を、スマホ1画面に集約。あなたは更新だけ。説明の繰り返しから解放されます。
          </p>
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_280px] lg:gap-14">
            <ScrollReveal>
              <StaggerReveal className="grid gap-4 sm:grid-cols-2">
                {[
                  "ゲストはQRを読むだけ。フロント口頭対応が減る",
                  "編集はノーコード。反映は即日。印刷の手間がいらない",
                  "1つのURLだから、案内のばらつきが起きにくい",
                  "テキストを言語別に並べれば、外国人対応の足がかりになる",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors duration-200 hover:border-emerald-200/80 hover:bg-emerald-50/30"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </li>
                ))}
              </StaggerReveal>
            </ScrollReveal>
            <ScrollReveal>
              <LpSolutionPhoneMock />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Section
        id="before-after"
        kicker="ビフォー・アフター"
        title="導入で変わるのは「説明の量」ではなく、現場の進み方"
        description="紙と口頭に分散していた負荷を、QRと1ページに寄せる。ここが売上というより、現場の体力とクレームの分岐点になります。"
        variant="muted"
      >
        <ScrollReveal>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card padding="lg" className="border-rose-200/80 bg-rose-50/30">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">導入前</p>
              <ul className="mt-4 space-y-3 text-sm font-medium text-slate-800">
                <li className="flex gap-2">
                  <span className="text-rose-500">→</span>
                  フロントで同じ説明を繰り返し、ピーク時に列ができる
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500">→</span>
                  紙の更新・差し替え・廃棄。バージョン管理がバラバラ
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500">→</span>
                  外国人対応で時間が読めず、他のゲストを待たせる
                </li>
              </ul>
            </Card>
            <Card padding="lg" className="border-emerald-200/80 bg-emerald-50/30">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">導入後</p>
              <ul className="mt-4 space-y-3 text-sm font-medium text-slate-800">
                <li className="flex gap-2">
                  <span className="text-emerald-600">→</span>
                  QRを渡すだけで自己案内。繰り返し説明が激減
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">→</span>
                  更新は管理画面から。常に同じURLの「最新」が見える
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">→</span>
                  多言語テキストを1ページに集約し、対応の迷いを減らす
                </li>
              </ul>
            </Card>
          </div>
        </ScrollReveal>
      </Section>

      <Section
        id="benefits"
        kicker="数字で見るベネフィット"
        title="で、私の現場がどう楽になるの？"
        description="※ 数値は導入施設ヒアリングに基づく目安です。稼働人数・客層・更新頻度で変動します。"
      >
        <ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "フロント対応時間", value: "最大50%削減", sub: "繰り返し案内・紙対応の削減イメージ" },
              { label: "案内の更新", value: "約1分", sub: "テキスト差し替え〜再公開までの目安" },
              { label: "外国語対応", value: "OK", sub: "ページ内に多言語テキストを並べて補助" },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{row.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{row.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{row.sub}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Section>

      <Section
        id="live-demo"
        kicker="デモ（まずここ）"
        title="実際に触ってみる。登録なしで始められます。"
        description="ゲストが見る公開ページをブラウザでそのまま体験。ビルダーを使う場合は無料アカウント作成後にダッシュボードへ。"
        variant="muted"
      >
        <ScrollReveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href={SAMPLE_PAGE_HREF} size="lg">
              デモを触る
            </Button>
            <Button href={SAMPLE_PAGE_HREF} variant="secondary" size="lg">
              サンプルページを見る
            </Button>
            <Button href={ctaHref} variant="secondary" size="lg">
              無料アカウントでビルダーを開く
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            サンプルは同一の公開ページです。まず触って「これなら現場で回る」を確認してください。
          </p>
        </ScrollReveal>
      </Section>

      <LpMidCta
        ctaHref={ctaHref}
        sampleHref={SAMPLE_PAGE_HREF}
        headline="3分で、フロント業務を減らす準備ができる"
        sub="クレカ不要で始められます。まずは無料プランで1ページ。"
      />

      <Section
        id="features"
        kicker="だから現場が楽になる"
        title="機能の羅列ではなく、成果で選んでいます"
        description="「で、現場の何が楽になるの？」に答えるために、Infomiiは次の価値に寄せて設計しています。"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
            {[
              {
                title: "説明が減る",
                desc: "ゲストが自分で読める。ピーク時のフロント滞留を抑えやすい。",
              },
              {
                title: "更新が速い",
                desc: "WiFiや朝食時間の変更を、印刷なしで即反映。",
              },
              {
                title: "迷子が減る",
                desc: "URLは1つ。紙・口頭・チャットの情報差を減らす。",
              },
              {
                title: "オペに合わせる",
                desc: "ノーコードのブロック編集。開発者を待たない。",
              },
              {
                title: "テンプレで早い",
                desc: "ホテル向けの型から始めて、自施設用に整える。",
              },
              {
                title: "改善が見える（Pro）",
                desc: "閲覧の傾向を見て、ページの並びや文言を調整。",
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
        title="3ステップで、最初の1ページを公開"
        variant="muted"
      >
        <ScrollReveal>
          <StaggerReveal className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "テンプレを選ぶ",
                desc: "ホテル向けテンプレまたは白紙から。WiFi・朝食・地図などのブロックを足すだけ。",
              },
              {
                step: "2",
                title: "編集してプレビュー",
                desc: "スマホ表示を見ながら文言を詰める。並べ替えはドラッグ。",
              },
              {
                step: "3",
                title: "公開してQR配布",
                desc: "URLを発行。卓上・客室・フロントにQRを置けば、常に最新案内が届く。",
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
        id="trust"
        kicker="信頼・導入イメージ"
        title="こんな施設で使われる想定です"
        description="実名事例・画面キャプチャは順次公開予定です。まずは業態別の活用イメージとしてご覧ください。"
      >
        <ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "ビジネスホテル",
                title: "フロント少人数・ピーク時に強い",
                body: "チェックイン直後に聞かれるWiFiと朝食を、QRで一気に案内。同じ説明から解放されます。",
              },
              {
                tag: "温泉・リゾート",
                title: "館内が広いほど、1ページの価値が上がる",
                body: "大浴場・食事・館内マップをまとめ、紙の差し替え回数を減らす使い方です。",
              },
              {
                tag: "都市型・インバウンド",
                title: "多言語テキストを1か所に",
                body: "英語などを同じブロックに併記し、短い接遇で意図が伝わりやすくなります。",
              },
            ].map((c) => (
              <Card key={c.tag} padding="lg" className="border-slate-200/90">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{c.tag}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
              </Card>
            ))}
          </div>
        </ScrollReveal>
      </Section>

      <Section
        id="pricing"
        kicker="料金"
        title="まずは無料。伸びたらProへ。"
        description="1ページで十分ならFree。複数ページや分析が要るならPro。チーム運用や本数が増えるならBusiness。"
      >
        <ScrollReveal>
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm font-bold text-slate-900">こんな人は Free</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                まず1ページで館内案内を試したい。QRを卓上に置くだけで十分。分析はまだいらない。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
              <p className="text-sm font-bold text-slate-900">こんな人は Pro</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                客室タイプ別・フロア別など複数ページに分けたい。閲覧分析で改善ループを回したい。
              </p>
            </div>
          </div>
          <StaggerReveal className="grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
            <Card padding="lg" className="rounded-2xl p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">¥0</p>
              <p className="mt-1 text-sm text-slate-500">1ページから始められる無料プラン</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">✓ 公開ページ1本</li>
                <li className="flex items-center gap-2">✓ ブロックエディタ・スマホプレビュー</li>
                <li className="flex items-center gap-2">✓ 共有URL・QR発行</li>
              </ul>
              <Button href={ctaHref} variant="secondary" className="mt-6">
                Freeで始める
              </Button>
            </Card>
            <div className="rounded-2xl border-2 border-slate-900 bg-slate-50/50 p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">Pro</p>
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
              <div className="mt-6 flex flex-col gap-2">
                <CheckoutButton plan="pro" className="w-full">
                  Proを申し込む{hasProAnnual ? "（月払い）" : ""}
                </CheckoutButton>
                {hasProAnnual && (
                  <CheckoutButton plan="pro" interval="yearly" variant="secondary" className="w-full">
                    年払い ¥19,800（2ヶ月分お得）
                  </CheckoutButton>
                )}
              </div>
            </div>
            <Card padding="lg" className="rounded-2xl p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Business</p>
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
              <div className="mt-6 flex flex-col gap-2">
                <CheckoutButton plan="business" variant="secondary" className="w-full">
                  Businessを申し込む{hasBusinessAnnual ? "（月払い）" : ""}
                </CheckoutButton>
                {hasBusinessAnnual && (
                  <CheckoutButton plan="business" interval="yearly" variant="secondary" className="w-full">
                    年払い ¥49,800（2ヶ月分お得）
                  </CheckoutButton>
                )}
              </div>
            </Card>
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <section className="bg-slate-900 py-16 sm:py-20">
        <ScrollReveal>
          <Container size="sm" className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              3分で、フロント業務を減らす
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              今すぐ無料で作成。クレジットカード不要。サンプルを触ってからでも遅くありません。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href={ctaHref} variant="inverted" size="lg" className="px-8">
                今すぐ無料で作成
              </Button>
              <Button href={SAMPLE_PAGE_HREF} variant="secondary" size="lg" className="border-slate-600 bg-transparent text-white hover:bg-white/10">
                30秒で試す（登録なし）
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
            <Link
              href="/terms"
              className="text-slate-600 transition-colors duration-200 hover:text-slate-900"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-slate-600 transition-colors duration-200 hover:text-slate-900"
            >
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
