/** Vertical keyword LPs (/lp/spa, /lp/resort) — unique copy; shared product/pricing with hotel LP. */

import { PLAN_PAGE_LIMITS } from "@/lib/plan-limits";
import {
  HOTEL_LP_BEFORE_AFTER,
  HOTEL_LP_FAQ,
  HOTEL_LP_PROPERTY_TYPES,
  HOTEL_LP_TRUST_POINTS,
  HOTEL_LP_VALUE_POINTS,
  HOTEL_LP_WORKFLOW_STEPS,
  HOTEL_PLANS,
} from "@/lib/lp/hotel-data";

export type HotelLpSectionCopy = {
  kicker: string;
  title: string;
  description: string;
};

export type HotelLpHeroCopy = {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  h1: string;
  subline: string;
  previewSrc: string;
};

export type HotelLpContent = {
  loginRef: string;
  hubBlogHref: string;
  hubBlogAnchorLabel: string;
  sceneBullets: readonly string[];
  valuePoints: readonly { title: string; body: string }[];
  workflowSteps: readonly { step: string; title: string; desc: string }[];
  propertyTypes: readonly string[];
  beforeAfter: readonly { before: string; after: string }[];
  faq: readonly { q: string; a: string }[];
  plans: typeof HOTEL_PLANS;
  trustPoints: typeof HOTEL_LP_TRUST_POINTS;
  hero: HotelLpHeroCopy;
  sections: {
    value: HotelLpSectionCopy;
    workflow: HotelLpSectionCopy;
    scenes: HotelLpSectionCopy;
    beforeAfter: HotelLpSectionCopy;
    demo: { title: string; description: string };
    finalCta: { title: string; description: string };
  };
};

export const BUSINESS_LP_CONTENT: HotelLpContent = {
  loginRef: "lp-business",
  hubBlogHref: "/blog/hotel-information-smartphone",
  hubBlogAnchorLabel: "ホテルのインフォメーションをスマホで見せる方法",
  sceneBullets: [
    "客室のQRから、滞在中の案内をまとめて見せられる",
    "Wi-Fi・食事時間・館内・周辺を1ページでそろえられる",
    "変更はその場で更新。紙の差し替えが不要になる",
    "Freeでまず1ページ公開してから広げられる",
  ],
  valuePoints: HOTEL_LP_VALUE_POINTS,
  workflowSteps: HOTEL_LP_WORKFLOW_STEPS,
  propertyTypes: HOTEL_LP_PROPERTY_TYPES,
  beforeAfter: HOTEL_LP_BEFORE_AFTER,
  faq: HOTEL_LP_FAQ,
  plans: HOTEL_PLANS,
  trustPoints: HOTEL_LP_TRUST_POINTS,
  hero: {
    eyebrow: "ホテル向け 案内運用OS",
    headlineLine1: "ホテル案内を、",
    headlineLine2: "現場が自分で回す。",
    h1: "ホテル案内を、現場が自分で回す。",
    subline: "テンプレから数分で公開。QR・多言語・チーム更新まで。",
    previewSrc: "/demo/guest-live?embed=1&fit=device&variant=infomii-hotel",
  },
  sections: {
    value: {
      kicker: "作るだけで終わらない",
      title: "案内の「運用」を、1つの流れに",
      description:
        "作成から公開、現場更新、多言語・権限・改善まで。IT専任がいなくても、フロント主導で回せます。",
    },
    workflow: {
      kicker: "はじめかた",
      title: "3ステップで、客室に置ける案内になる",
      description:
        "ホテル向けテンプレから始めて、今日聞かれやすい項目だけ整えれば公開できます。",
    },
    scenes: {
      kicker: "こんな施設で",
      title: "シティホテルから、小規模宿まで",
      description:
        "施設タイプに合わせて広げられます。まず1ページの案内運用から始められます。",
    },
    beforeAfter: {
      kicker: "Before / After",
      title: "紙の館内案内から、現場更新の運用へ",
      description: "自由度より、毎日の案内がどう変わるか。それが選ばれる理由です。",
    },
    demo: {
      title: "登録前に、案内運用の軽さを確かめる",
      description: "30秒デモか、サンプル案内を開いて、作り心地を先に体感できます。",
    },
    finalCta: {
      title: "まずは無料で、案内運用を1ページから",
      description:
        "ホテル向けテンプレから始められます。クレジットカード不要。公開まで数分です。",
    },
  },
};

export const SPA_LP_CONTENT: HotelLpContent = {
  loginRef: "lp-spa",
  hubBlogHref: "/blog/large-bath-house-rules-guide",
  hubBlogAnchorLabel: "大浴場・スパのルール案内の書き方",
  sceneBullets: [
    "入浴時間・更衣室・注意事項を1ページにまとめられる",
    "サウナ・休憩スペース・レンタル品の案内をQRで統一できる",
    "臨時休館や時間変更も、その場の更新でゲストへ届く",
    "温泉旅館テンプレから始めて、温浴ブロックだけ足せる",
  ],
  valuePoints: [
    {
      title: "「入浴の注意はどこ？」が減る",
      body: "脱衣所やフロントのQRからハウスルールを開いてもらうので、口頭の繰り返し説明を抑えられます。",
    },
    {
      title: "営業時間の貼紙交換が要らなくなる",
      body: "大浴場・サウナの時間変更は公開するだけ。紙の差し替えや貼り直しが不要になります。",
    },
    {
      title: "更衣・持参物の案内が客室と揃う",
      body: "客室カードと温浴入口で同じURLを共用。情報のズレと案内ミスを防ぎます。",
    },
    {
      title: "混雑・清掃中の案内もすぐ出せる",
      body: "当日の臨時案内もスマホから直してすぐ反映。紙の掲示待ちが発生しません。",
    },
    {
      title: "多言語の注意書きで止まらない",
      body: "入浴マナーや禁止事項を主要言語でそろえられます（多言語反映はBusiness）。",
    },
    {
      title: "少人数でも温浴フロアを回せる",
      body: "テンプレに入浴ブロックを足す運用。IT専任がいなくても更新できます。",
    },
  ],
  workflowSteps: [
    {
      step: "1",
      title: "温浴向けテンプレを選ぶ",
      desc: "温泉旅館・大浴場の案内から開始。施設名・写真・入浴時間に差し替えます。",
    },
    {
      step: "2",
      title: "ルールと営業時間を入れる",
      desc: "入浴注意・更衣・サウナ・レンタルなど、現場で聞かれやすい項目をブロックで並べます。",
    },
    {
      step: "3",
      title: "脱衣所・客室にQRを置く",
      desc: "公開URLを掲示やカードに。以降の変更は編集してすぐ反映です。",
    },
  ],
  propertyTypes: ["温泉旅館", "温浴施設併設ホテル", "スパ付きリゾート", "日帰り温泉併設", "サウナ特化施設"],
  beforeAfter: [
    {
      before: "入浴ルールを紙で多言語印刷・差し替え",
      after: "ゲストのスマホで常に最新の温浴案内",
    },
    {
      before: "営業時間の貼紙をフロアごとに交換",
      after: "編集して公開するだけで全QRに反映",
    },
    {
      before: "サウナ・休憩の案内が口頭依存",
      after: "QRを開けば手順と注意がその場で読める",
    },
    {
      before: "臨時休館の連絡がフロントに集中",
      after: "当日変更をページ上部にすぐ出せる",
    },
  ],
  faq: [
    {
      q: "大浴場の注意事項だけ先に公開できますか？",
      a: "はい。Freeで1ページから始め、入浴ルールと営業時間だけ載せても運用できます。",
    },
    {
      q: "温泉旅館とシティホテルでテンプレは違いますか？",
      a: "施設タイプ別のテンプレがあります。温泉・入浴ブロックを中心に組み立てられます。",
    },
    {
      q: "無料プランだけでも温浴案内に使えますか？",
      a: `はい。${PLAN_PAGE_LIMITS.free}ページまでQR公開できます。分析やページ分割が必要ならPro、チーム・多言語ならBusinessが目安です。`,
    },
    {
      q: "紙のハウスルールから移行するコツは？",
      a: "まず入浴注意・時間・更衣の3つをデジタル化し、客室と脱衣所のQRを同じURLに揃えると効果が出やすいです。",
    },
    {
      q: "支払いはいつ必要ですか？",
      a: "Freeの開始にクレジットカードは不要です。Pro / Businessはアップグレード時にStripeでお支払いします。",
    },
  ],
  plans: HOTEL_PLANS,
  trustPoints: HOTEL_LP_TRUST_POINTS,
  hero: {
    eyebrow: "温浴・スパの案内を、スマートに。",
    headlineLine1: "紙の入浴ルールから、",
    headlineLine2: "スマホの温浴案内へ。",
    h1: "紙の入浴ルールから、スマホの温浴案内へ。",
    subline: "時間変更もその場で更新。差し替え不要。",
    previewSrc: "/demo/guest-live?embed=1&fit=device&variant=ryokan",
  },
  sections: {
    value: {
      kicker: "温浴フロアのあるあるを、軽くする",
      title: "大浴場・スパの案内を、スマホで回す",
      description:
        "入浴ルール・営業時間・サウナ案内を1ページにまとめると、脱衣所とフロントの説明負荷が下がります。",
    },
    workflow: {
      kicker: "はじめかた",
      title: "3ステップで、脱衣所に置ける案内になる",
      description: "専門知識は不要です。入浴で聞かれやすい項目だけ整えれば、今日から公開できます。",
    },
    scenes: {
      kicker: "こんな施設で",
      title: "温泉旅館から、スパ併設ホテルまで",
      description: "大規模システムではなく、まず温浴案内の1ページから始められます。",
    },
    beforeAfter: {
      kicker: "Before / After",
      title: "紙の入浴案内から、スマホの運用へ",
      description: "機能の多さより、毎日の温浴案内がどう変わるかを重視しています。",
    },
    demo: {
      title: "登録前に、温浴案内の軽さを確かめる",
      description: "30秒デモか、温泉旅館サンプルを開いて、作り心地を先に体感できます。",
    },
    finalCta: {
      title: "まずは無料で、温浴案内を1ページ作る",
      description:
        "入浴ルールと営業時間から始められます。クレジットカード不要。公開まで数分です。",
    },
  },
};

export const RESORT_LP_CONTENT: HotelLpContent = {
  loginRef: "lp-resort",
  hubBlogHref: "/blog/resort-hotel-activity-guide",
  hubBlogAnchorLabel: "リゾートホテルの滞在案内｜アクティビティと施設予約の載せ方",
  sceneBullets: [
    "送迎・アクティビティ・食事時間を最上段に並べられる",
    "当日の天候や催し変更を、その場の更新でゲストへ届ける",
    "体験予約の要否・集合場所・持ち物をQRで統一できる",
    "客室・ロビー・各施設入口で同じURLを共用できる",
  ],
  valuePoints: [
    {
      title: "「今日の体験は？」が減る",
      body: "客室QRから当日のアクティビティと予約要否を開いてもらうので、フロントの繰り返し説明を抑えられます。",
    },
    {
      title: "送迎時刻の貼紙交換が要らなくなる",
      body: "時刻や集合場所の変更は公開するだけ。紙の差し替えや館内放送頼みを減らせます。",
    },
    {
      title: "体験メニューの情報がバラつかない",
      body: "客室・ロビー・アクティビティデスクで同じURLを共用。案内のズレを防ぎます。",
    },
    {
      title: "天候・催しの当日変更もすぐ出せる",
      body: "中止・振替もスマホから直してすぐ反映。紙の掲示待ちが発生しません。",
    },
    {
      title: "多言語の滞在案内で止まらない",
      body: "体験・食事・施設案内を主要言語でそろえられます（多言語反映はBusiness）。",
    },
    {
      title: "季節繁忙でも少人数で回せる",
      body: "テンプレに体験・送迎ブロックを足す運用。IT専任がいなくても更新できます。",
    },
  ],
  workflowSteps: [
    {
      step: "1",
      title: "リゾート向けテンプレを選ぶ",
      desc: "滞在案内・体験導線のテンプレから開始。施設名・写真・今日の予定に差し替えます。",
    },
    {
      step: "2",
      title: "当日変わる情報を上に置く",
      desc: "送迎・体験予約・食事時間など、フロントで聞かれやすい項目をブロックで並べます。",
    },
    {
      step: "3",
      title: "客室とロビーにQRを置く",
      desc: "公開URLをカードや掲示に。以降の変更は編集してすぐ反映です。",
    },
  ],
  propertyTypes: ["リゾートホテル", "温泉リゾート", "グランピング", "滞在型リゾート", "体験重視の宿"],
  beforeAfter: [
    {
      before: "体験メニューを紙で配布・差し替え",
      after: "ゲストのスマホで常に最新の滞在案内",
    },
    {
      before: "送迎時刻を口頭と貼紙で都度案内",
      after: "QRを開けば集合場所と時刻が読める",
    },
    {
      before: "天候中止の連絡がフロントに集中",
      after: "当日変更をページ上部にすぐ出せる",
    },
    {
      before: "多言語の体験案内が英語だけで不足",
      after: "主要言語をまとめて運用できる（Business）",
    },
  ],
  faq: [
    {
      q: "アクティビティ予約の案内だけ先に公開できますか？",
      a: "はい。Freeで1ページから始め、体験メニューと予約要否だけ載せても運用できます。",
    },
    {
      q: "リゾートとシティホテルで構成は変えるべきですか？",
      a: "はい。リゾートは当日変わる情報（送迎・体験・天候）を最上段に出すと問い合わせが減りやすいです。",
    },
    {
      q: "無料プランだけでもリゾート案内に使えますか？",
      a: `はい。${PLAN_PAGE_LIMITS.free}ページまでQR公開できます。用途別にページを分けるならPro、チーム・多言語ならBusinessが目安です。`,
    },
    {
      q: "季節メニューの更新はどれくらい簡単ですか？",
      a: "ブロックの文言と画像を差し替えて公開するだけです。冊子の刷り直しは不要です。",
    },
    {
      q: "支払いはいつ必要ですか？",
      a: "Freeの開始にクレジットカードは不要です。Pro / Businessはアップグレード時にStripeでお支払いします。",
    },
  ],
  plans: HOTEL_PLANS,
  trustPoints: HOTEL_LP_TRUST_POINTS,
  hero: {
    eyebrow: "リゾートの滞在案内を、スマートに。",
    headlineLine1: "紙の体験パンフから、",
    headlineLine2: "スマホの滞在案内へ。",
    h1: "紙の体験パンフから、スマホの滞在案内へ。",
    subline: "送迎も催しも、その場で更新。",
    previewSrc: "/demo/guest-live?embed=1&fit=device&variant=resort",
  },
  sections: {
    value: {
      kicker: "リゾート現場のあるあるを、軽くする",
      title: "滞在中の案内を、スマホで回す",
      description:
        "送迎・体験・食事時間を1ページにまとめると、フロントの繰り返し説明と紙の差し替えが減ります。",
    },
    workflow: {
      kicker: "はじめかた",
      title: "3ステップで、客室に置ける滞在案内になる",
      description: "専門知識は不要です。当日聞かれやすい項目だけ整えれば、今日から公開できます。",
    },
    scenes: {
      kicker: "こんな施設で",
      title: "リゾートホテルから、体験型の宿まで",
      description: "大規模システムではなく、まず滞在案内の1ページから始められます。",
    },
    beforeAfter: {
      kicker: "Before / After",
      title: "紙の体験案内から、スマホの運用へ",
      description: "機能の多さより、毎日の滞在案内がどう変わるかを重視しています。",
    },
    demo: {
      title: "登録前に、リゾート案内の軽さを確かめる",
      description: "30秒デモか、リゾートサンプルを開いて、作り心地を先に体感できます。",
    },
    finalCta: {
      title: "まずは無料で、滞在案内を1ページ作る",
      description:
        "送迎と体験メニューから始められます。クレジットカード不要。公開まで数分です。",
    },
  },
};
