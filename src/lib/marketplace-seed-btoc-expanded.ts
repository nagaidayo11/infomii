import { ordered, type MarketplaceSeedTemplate } from "@/lib/marketplace-seed-types";
import {
  btocBlock as b,
  hubLinks,
  sectionDivider,
  sectionHeading,
} from "@/lib/marketplace-seed-btoc-layout";
import { btocTemplatePreviewPath } from "@/lib/template-preview";
import type { BtocMarketplaceCategory } from "@/lib/template-marketplace-meta";

function pv(category: BtocMarketplaceCategory, slug: string): string {
  return btocTemplatePreviewPath(category, slug);
}

const hero = (title: string, subtitle: string, image: string) => ({ title, subtitle, image });
const welcome = (title: string, message: string) => ({ title, message });
const notice = (title: string, body: string, variant = "info") => ({ title, body, variant });
const schedule = (title: string, items: { day: string; time: string; label: string }[]) => ({
  title,
  dynamicEnabled: false,
  timezone: "Asia/Tokyo",
  rules: [],
  items,
});
const checklist = (title: string, items: string[]) => ({
  title,
  items: items.map((text) => ({ text, checked: false })),
});
const map = (title: string, address: string) => ({ title, address, mapEmbedUrl: "" });
const steps = (title: string, items: { title: string; description: string }[]) => ({ title, items });
const faq = (title: string, items: { q: string; a: string }[]) => ({ title, items });
const tabsInfo = (title: string, tabs: { label: string; body: string }[]) => ({
  title,
  defaultIndex: 0,
  tabs,
});
const nearby = (title: string, items: { name: string; description: string }[]) => ({
  title,
  items: items.map((item) => ({ ...item, link: "" })),
});
const contactHub = (title: string, note: string, email = "") => ({
  title,
  phone: "",
  email,
  lineUrl: "",
  mapUrl: "",
  note,
});
const highlight = (title: string, body: string) => ({ title, body, accent: "amber" });
const gallery = (title: string, alts: string[]) => ({
  title,
  columns: 2,
  items: alts.map((alt) => ({ src: "/preset-hero-sample.png", alt })),
});
const socialLinks = (title: string, handle: string) => ({
  title,
  labelStyle: "icon",
  items: [
    { platform: "instagram", label: "Instagram", href: "", handle },
    { platform: "x", label: "X", href: "", handle },
  ],
});
const openStatus = (title: string, hoursText: string) => ({
  title,
  mode: "manual",
  openNow: true,
  openLabel: "営業中",
  closedLabel: "準備中",
  hoursText,
});

/** BtoC 拡張: 区切り線・メニューアイコン・セクション見出しで差別化した高品質レイアウト */
export const BTOC_EXPANDED_MARKETPLACE_SEED_TEMPLATES: MarketplaceSeedTemplate[] = [
  // --- food ---
  {
    slug: "food-kitchen-car-today",
    name: "キッチンカー・今日の出店",
    description: "今日どこにいるか・メニュー・SNSを1枚に。常連と新規の両方に送れる。",
    preview_image: pv("food", "food-kitchen-car-today"),
    category: "food",
    cards: ordered([
      b(
        "hero",
        hero(
          "たこ焼きキッチン ○○",
          "今日は代々木公園そば。11:00〜売り切れ次第終了",
          pv("food", "food-kitchen-car-today"),
        ),
      ),
      hubLinks("ショートカット", [
        { label: "今日の場所", icon: "map-pin" },
        { label: "営業時間", icon: "clock" },
        { label: "Instagram", icon: "link" },
        { label: "法人依頼", icon: "phone" },
      ]),
      sectionHeading("本日のメニュー", "タブで定番・限定・飲み物を切り替え"),
      b("open_status", openStatus("今日の営業", "11:00〜17:00（売り切れ次第終了）")),
      b(
        "tabs_info",
        tabsInfo("メニュー詳細", [
          {
            label: "定番",
            body: "たこ焼き8個入り 600円 / ソース・マヨ・青のり。アレルギー：小麦・卵・大豆・魚介",
          },
          { label: "限定", body: "チーズたこ 750円（30食くらい）。なくなり次第終了。" },
          { label: "飲み物", body: "ペットボトル飲料 200円。お茶は無料サービス（小カップ）" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("アクセス・お支払い", "集合場所と待ち時間の目安"),
      b("map", map("今日の場所", "代々木公園 イベント広場入口付近（駐車は係の人に聞いて）")),
      b(
        "notice",
        notice(
          "お支払い・待ち時間",
          "PayPay・現金。混む時間は15〜20分待ちのことあり。雨の日はテント横の待機スペース使って。",
        ),
      ),
      sectionDivider("dotted"),
      sectionHeading("よく聞かれる", ""),
      b(
        "faq",
        faq("FAQ", [
          { q: "カード使える？", a: "PayPayのみ。現金もOK。" },
          { q: "予約できる？", a: "個人の取り置きは不可。イベント単位ならDMかフォーム。" },
          { q: "明日どこ？", a: "固定ポストとスケジュール表を見て。当日朝にストーリーでも出す。" },
        ]),
      ),
    ]),
  },
  {
    slug: "food-truck-weekly",
    name: "フードトラック・週間スケジュール",
    description: "今週の出店予定をまとめてシェア。オフィス街・公園・イベント向け。",
    preview_image: pv("food", "food-truck-weekly"),
    category: "food",
    cards: ordered([
      b(
        "welcome",
        welcome(
          "Burger Lab 週間予定",
          "場所は前日21時までにInstagramに載せる。雨で中止の日はストーリーで知らせる。",
        ),
      ),
      hubLinks("今週の導線", [
        { label: "今日の場所", icon: "map" },
        { label: "週間表", icon: "clock" },
        { label: "メニュー", icon: "utensils" },
        { label: "ケータリング", icon: "phone" },
      ], 4),
      sectionHeading("今週の出店", "月〜日の予定。休みの日は「休み」と記載"),
      b(
        "schedule",
        schedule("スケジュール", [
          { day: "月", time: "—", label: "休み（仕込み）" },
          { day: "火", time: "11:30-14:00", label: "丸の内オフィス街（南口）" },
          { day: "水", time: "—", label: "休み" },
          { day: "木", time: "11:00-15:00", label: "芝公園ランチマルシェ" },
          { day: "金", time: "17:00-20:00", label: "有楽町ビールガーデン協賛ブース" },
          { day: "土", time: "10:00-16:00", label: "砧公園フェス（要入場券）" },
          { day: "日", time: "—", label: "休み" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("人気メニュー", "変更がある日はストーリーで告知"),
      b(
        "highlight",
        highlight("おすすめ", "スモークバーガー 980円 / ポテトセット +300円。ヴィーガンパティ変更 +150円。"),
      ),
      b("contact_hub", contactHub("イベント出店の相談", "10食以上・電源確保が必要な場合は1週間前までに。", "catering@example.com")),
    ]),
  },
  {
    slug: "food-festival-stall",
    name: "マルシェ・フェス出店案内",
    description: "1日限りのイベント出店。会場マップ・列・支払いを来場者に伝える。",
    preview_image: pv("food", "food-festival-stall"),
    category: "food",
    cards: ordered([
      b(
        "hero",
        hero("手作りクレープ △△", "〇〇マルシェ 3/15（土）ブース B-12", pv("food", "food-festival-stall")),
      ),
      hubLinks("会場メニュー", [
        { label: "ブースMAP", icon: "map-pin" },
        { label: "買い方", icon: "checklist" },
        { label: "メニュー", icon: "utensils" },
        { label: "SNS", icon: "link" },
      ]),
      sectionHeading("買い方", "列・注文・受け取りの流れ"),
      b(
        "steps",
        steps("フロー", [
          { title: "① ブース前で列", description: "番号札は取らない。並んでからメニュー見て注文。" },
          { title: "② 注文・支払い", description: "現金・PayPay。トッピングはレジでまとめて。" },
          { title: "③ 呼ばれたら受け取り", description: "5〜8分待ち。呼び出しは番号ではなく商品名。" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("メニュー", "甘い・しょっぱい・飲み物"),
      b(
        "tabs_info",
        tabsInfo("本日の品目", [
          { label: "甘い", body: "生クリームいちご 650円 / バナナチョコ 600円" },
          { label: "しょっぱい", body: "ハムチーズ 700円 / ツナポテ 680円" },
          { label: "飲み物", body: "コーヒー 400円（別ブース C-03 と共同）" },
        ]),
      ),
      b("map", map("ブースの場所", "会場マップ Bエリア 12番（メインステージから東30m）")),
      sectionDivider("dotted"),
      sectionHeading("当日の確認", ""),
      b(
        "faq",
        faq("FAQ", [
          { q: "売り切れ？", a: "13時頃に生地がなくなることあり。SNSで告知。" },
          { q: "アレルギー", a: "小麦・卵・乳。同一ブースでナッツ使用あり。" },
        ]),
      ),
    ]),
  },
  {
    slug: "food-preorder-pickup",
    name: "取り置き・事前予約（小規模飲食）",
    description: "弁当・スイーツの予約受付。受け取り時間と支払いをまとめる。",
    preview_image: pv("food", "food-preorder-pickup"),
    category: "food",
    cards: ordered([
      b(
        "welcome",
        welcome("お弁当の予約", "前日20時まで受付。当日の変更はLINEで（在庫ある場合のみ）。"),
      ),
      hubLinks("予約導線", [
        { label: "予約フォーム", icon: "ticket" },
        { label: "LINE", icon: "link" },
        { label: "メニューPDF", icon: "package" },
        { label: "受取MAP", icon: "map" },
      ]),
      sectionHeading("受け取り時間", "平日・土曜で窓口が異なります"),
      b(
        "schedule",
        schedule("受け取り", [
          { day: "平日", time: "11:30-13:00", label: "店頭受け取り（○○駅西口から3分）" },
          { day: "土", time: "10:00-12:00", label: "キッチンカー出店時に渡し" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("注文時に教えてほしいこと", "チェックリストをコピーして使えます"),
      b(
        "checklist",
        checklist("チェック", [
          "お名前（ひらがな）",
          "受け取り日時",
          "メニュー名と個数",
          "アレルギー・抜きたいもの",
          "支払い方法（先払い or 当日）",
        ]),
      ),
      b("notice", notice("キャンセル", "前日12時以降のキャンセルは50%。材料仕込み後は全額。")),
    ]),
  },
  {
    slug: "food-cafe-popup",
    name: "カフェ・ポップアップ1日店",
    description: "期間限定カフェやコラボキッチンの1日案内。",
    preview_image: pv("food", "food-cafe-popup"),
    category: "food",
    cards: ordered([
      b(
        "hero",
        hero("コーヒー×焼き菓子 1Day", "3/22（土）のみ / 11:00-17:00 / 先着40セット", pv("food", "food-cafe-popup")),
      ),
      hubLinks("1日店メニュー", [
        { label: "会場MAP", icon: "map-pin" },
        { label: "ドリンク", icon: "coffee" },
        { label: "スイーツ", icon: "gift" },
        { label: "SNS", icon: "camera" },
      ]),
      sectionHeading("メニュー", "ドリンク・スイーツ・セット"),
      b(
        "tabs_info",
        tabsInfo("品目", [
          { label: "ドリンク", body: "ドリップ 500円 / ラテ 600円 / 季節ソーダ 550円" },
          { label: "スイーツ", body: "スクエアケーキ 450円 / クッキー2枚 380円" },
          { label: "セット", body: "ドリンク+ケーキ 900円（+100円でクッキー追加）" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("会場・周辺", ""),
      b("map", map("会場", "△△ギャラリー 1F（最寄り □□駅 徒歩4分）")),
      b(
        "nearby",
        nearby("ついでに", [
          { name: "公園ベンチ", description: "テイクアウトOK。店内席は20席のみ。" },
          { name: "駐輪場", description: "店裏に5台。満車ならコインPを利用。" },
        ]),
      ),
      b("social_links", socialLinks("投稿してね", "#popup022")),
    ]),
  },

  // --- lightbiz ---
  {
    slug: "lightbiz-salon",
    name: "美容室・サロン案内",
    description: "予約・初めての方への流れ・料金目安。ホテルほど堅くない店舗向け。",
    preview_image: pv("lightbiz", "lightbiz-salon"),
    category: "lightbiz",
    cards: ordered([
      b(
        "hero",
        hero("hair salon ○○", "カット・カラー・トリートメント。完全予約制", pv("lightbiz", "lightbiz-salon")),
      ),
      hubLinks("サロン導線", [
        { label: "予約", icon: "ticket" },
        { label: "LINE", icon: "link" },
        { label: "Instagram", icon: "camera" },
        { label: "アクセス", icon: "map-pin" },
      ]),
      sectionHeading("初めての流れ", "来店から会計まで4ステップ"),
      b(
        "steps",
        steps("フロー", [
          { title: "予約", description: "WebまたはLINE。当日枠は電話で空き確認。" },
          { title: "来店", description: "5分前到着。遅れる場合は必ず連絡。" },
          { title: "カウンセリング", description: "10分。写真・雰囲気の参考持ち込みOK。" },
          { title: "施術・会計", description: "カード・PayPay・現金。" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("料金の目安", "長さ・薬剤で変動します"),
      b(
        "tabs_info",
        tabsInfo("メニュー", [
          { label: "カット", body: "5,500円〜（シャンプー込）" },
          { label: "カラー", body: "8,800円〜（長さ・薬剤で変動）" },
          { label: "その他", body: "トリートメント 3,300円〜 / 眉 1,100円" },
        ]),
      ),
      b("map", map("アクセス", "○○区△△ 1-2-3 2F（エレベーターなし）")),
      sectionDivider("dotted"),
      sectionHeading("よくある質問", ""),
      b(
        "faq",
        faq("FAQ", [
          { q: "当日予約", a: "空きがあれば可。17時以降は電話推奨。" },
          { q: "子ども連れ", a: "平日午前のみ可。事前に伝えてください。" },
          { q: "キャンセル", a: "前日18時以降は50%。無断キャンセルは次回予約不可。" },
        ]),
      ),
    ]),
  },
  {
    slug: "lightbiz-fitness-studio",
    name: "ヨガ・フィットネススタジオ",
    description: "レッスンスケジュール・持ち物・体験予約。",
    preview_image: pv("lightbiz", "lightbiz-fitness-studio"),
    category: "lightbiz",
    cards: ordered([
      b("welcome", welcome("Studio △△", "マットレッスン中心。初回体験 1,500円（要予約）。")),
      hubLinks("スタジオメニュー", [
        { label: "体験予約", icon: "ticket" },
        { label: "今週のクラス", icon: "clock" },
        { label: "会員プラン", icon: "link" },
        { label: "持ち物", icon: "checklist" },
      ]),
      sectionHeading("今週のクラス", "火・水・金・土の定番枠"),
      b(
        "schedule",
        schedule("クラス", [
          { day: "火", time: "07:30", label: "モーニングヨガ（初級）" },
          { day: "水", time: "19:00", label: "ピラティス（中級）" },
          { day: "金", time: "12:15", label: "ストレッチ（オフィス向け）" },
          { day: "土", time: "10:00", label: "ファミリーヨガ（親子OK）" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("持ち物・体験の方へ", ""),
      b(
        "checklist",
        checklist("持ち物", ["動きやすい服装", "タオル", "飲み物", "マット（レンタル200円）", "汗拭き"]),
      ),
      b(
        "notice",
        notice("体験の方へ", "開始10分前受付。妊娠中・怪我のある方は事前にインストラクターへ。"),
      ),
    ]),
  },
  {
    slug: "lightbiz-classroom",
    name: "教室・講座・スクール案内",
    description: "習い事・研修の日程・料金・申込。個人教室から小規模法人研修まで。",
    preview_image: pv("lightbiz", "lightbiz-classroom"),
    category: "lightbiz",
    cards: ordered([
      b(
        "hero",
        hero("Web制作入門コース", "全4回 / 少人数 / オンライン+課題", pv("lightbiz", "lightbiz-classroom")),
      ),
      hubLinks("受講導線", [
        { label: "申込フォーム", icon: "ticket" },
        { label: "カリキュラム", icon: "package" },
        { label: "日程", icon: "clock" },
        { label: "法人研修", icon: "phone" },
      ]),
      sectionHeading("全4回の日程", "欠席時は録画共有あり"),
      b(
        "schedule",
        schedule("日程", [
          { day: "1回目", time: "4/5（土）", label: "14:00-17:00 HTML/CSSの基礎" },
          { day: "2回目", time: "4/12（土）", label: "14:00-17:00 レイアウトとレスポンシブ" },
          { day: "3回目", time: "4/19（土）", label: "14:00-17:00 簡単なJS" },
          { day: "4回目", time: "4/26（土）", label: "14:00-17:00 作品発表" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("受講料・申込", ""),
      b("highlight", highlight("受講料", "48,000円（税込）。分割可。法人請求書対応（2名以上）。")),
      b(
        "faq",
        faq("申込・受講", [
          { q: "初心者でも？", a: "パソコンの基本操作ができればOK。" },
          { q: "欠席したら", a: "録画共有あり。質問はSlackで随時。" },
          { q: "法人研修", a: "4名以上で出張・カスタム可。お問い合わせフォームへ。" },
        ]),
      ),
    ]),
  },
  {
    slug: "lightbiz-popup-shop",
    name: "ポップアップショップ・期間限定店",
    description: "期間・場所・商品ラインナップを来店者に共有。",
    preview_image: pv("lightbiz", "lightbiz-popup-shop"),
    category: "lightbiz",
    cards: ordered([
      b(
        "hero",
        hero("△△ select POP-UP", "4/1-4/14 / 渋谷 / アパレル・雑貨", pv("lightbiz", "lightbiz-popup-shop")),
      ),
      hubLinks("ショップ導線", [
        { label: "営業時間", icon: "clock" },
        { label: "MAP", icon: "map-pin" },
        { label: "Instagram", icon: "camera" },
        { label: "EC", icon: "shopping-bag" },
      ]),
      sectionHeading("営業・ピックアップ", ""),
      b("open_status", openStatus("営業時間", "11:00-20:00（最終日は18:00まで）")),
      b("gallery", gallery("ピックアップ", ["限定Tシャツ", "トートバッグ", "ステッカーセット"])),
      sectionDivider(),
      sectionHeading("来店のお願い", ""),
      b("map", map("店舗", "渋谷区○○ 1F（○○駅 A5出口 徒歩2分）")),
      b("notice", notice("お知らせ", "バッグ1人2点まで。試着OK。免税は対象外。")),
    ]),
  },
  {
    slug: "lightbiz-office-visit",
    name: "小規模オフィス・来訪案内",
    description: "取引先・面接・打ち合わせ向け。ホテル未満のライトなB2B。",
    preview_image: pv("lightbiz", "lightbiz-office-visit"),
    category: "lightbiz",
    cards: ordered([
      b(
        "welcome",
        welcome(
          "○○株式会社 お打ち合わせ",
          "来訪前に受付QRまたはインターフォンでお知らせください。",
        ),
      ),
      hubLinks("来訪メニュー", [
        { label: "受付フロー", icon: "checklist" },
        { label: "所在地", icon: "map-pin" },
        { label: "Wi-Fi", icon: "wifi" },
        { label: "連絡先", icon: "phone" },
      ]),
      sectionHeading("来訪の流れ", "1F受付から会議室まで"),
      b(
        "steps",
        steps("フロー", [
          { title: "1F受付", description: "タブレットで会社名・担当者名を入力。" },
          { title: "本人確認", description: "面接・初回は身分証提示。同行者も記入。" },
          {
            title: "会議室",
            description: "担当が5分以内にお迎え。早めの到着はロビーでお待ちください。",
          },
        ]),
      ),
      sectionDivider(),
      sectionHeading("所在地・注意事項", ""),
      b("map", map("所在地", "東京都港区○○ 3-4-5 ○○ビル 7F（1Fが受付）")),
      b(
        "notice",
        notice(
          "注意",
          "撮影・録音は担当者許可後のみ。機密資料の持ち出し禁止。Wi-Fiはゲスト用SSIDを案内します。",
        ),
      ),
      b(
        "contact_hub",
        contactHub(
          "遅刻・変更",
          "担当者の直通ではなく、受付 03-xxxx-xxxx または meeting@example.com へ。",
          "meeting@example.com",
        ),
      ),
    ]),
  },
  {
    slug: "lightbiz-freelance-portfolio",
    name: "フリーランス・サービス案内",
    description: "個人事業のサービス内容・料金・問い合わせ。",
    preview_image: pv("lightbiz", "lightbiz-freelance-portfolio"),
    category: "lightbiz",
    cards: ordered([
      b(
        "hero",
        hero("デザイン・LP制作", "スタートアップと個人向け。2週間で初稿", pv("lightbiz", "lightbiz-freelance-portfolio")),
      ),
      hubLinks("サービス導線", [
        { label: "ポートフォリオ", icon: "link" },
        { label: "見積依頼", icon: "ticket" },
        { label: "実績一覧", icon: "package" },
        { label: "相談", icon: "phone" },
      ]),
      sectionHeading("提供サービス", "LP・ブランド・顧問の3本柱"),
      b(
        "tabs_info",
        tabsInfo("メニュー", [
          { label: "LP", body: "構成・デザイン・実装（Next.js）15万円〜" },
          { label: "ブランド", body: "ロゴ・カラー・簡易ガイド 5万円〜" },
          { label: "顧問", body: "月3万円〜 チャット相談+月1ミーティング" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("依頼前に", ""),
      b(
        "faq",
        faq("FAQ", [
          { q: "最低予算", a: "LP 15万円〜。ロゴのみ 5万円〜。" },
          { q: "納期", a: "素材いただいてから10営業日が目安。" },
          { q: "NDA", a: "対応可。先にフォームから概要だけ送ってください。" },
        ]),
      ),
    ]),
  },

  // --- travel / personal / oshi 追加 ---
  {
    slug: "travel-camp-outdoor",
    name: "キャンプ・アウトドアしおり",
    description: "キャンプ場・持ち物・役割分担を友達に共有。",
    preview_image: pv("travel", "travel-camp-outdoor"),
    category: "travel",
    cards: ordered([
      b("hero", hero("富士山麓キャンプ", "2泊 / 車2台 / 食材分担", pv("travel", "travel-camp-outdoor"))),
      hubLinks(
        "キャンプ導線",
        [
          { label: "持ち物", icon: "checklist" },
          { label: "分担表", icon: "package" },
          { label: "キャンプ場", icon: "map-pin" },
          { label: "ルール", icon: "notice" },
        ],
        2,
      ),
      sectionHeading("持ち物", "チェックリストを各自コピーして使ってね"),
      b(
        "checklist",
        checklist("持ち物リスト", [
          "テント・タープ",
          "寝袋・マット",
          "ランタン・電池",
          "調理器具・着火器",
          "ゴミ袋（持ち帰り）",
          "防寒（夜は冷える）",
        ]),
      ),
      sectionDivider(),
      sectionHeading("分担・車", "食材と道具の担当"),
      b(
        "tabs_info",
        tabsInfo("分担", [
          { label: "食材", body: "Aさん：肉・野菜 / Bさん：米・調味料 / Cさん：朝食用パン" },
          { label: "道具", body: "BBQコンロは車1。薪は現地購入。" },
          { label: "車", body: "行き：A車に3人 / 帰り：B車に荷物多め" },
        ]),
      ),
      b("map", map("キャンプ場", "○○キャンプ村 サイト12（チェックイン15:00）")),
      b("notice", notice("ルール", "22時以降は静かに。焚き火は指定炉のみ。ペット不可。")),
    ]),
  },
  {
    slug: "personal-wedding-party",
    name: "結婚式・二次会向け案内",
    description: "ゲスト向けの集合・ドレスコード・余興を1ページに。",
    preview_image: pv("personal", "personal-wedding-party"),
    category: "personal",
    cards: ordered([
      b(
        "hero",
        hero("Wedding Party", "6/21（土）18:00〜 / 二次会 20:30〜", pv("personal", "personal-wedding-party")),
      ),
      hubLinks("ゲスト導線", [
        { label: "タイムテーブル", icon: "clock" },
        { label: "会場MAP", icon: "map-pin" },
        { label: "ドレスコード", icon: "info" },
        { label: "FAQ", icon: "link" },
      ]),
      sectionHeading("当日の流れ", "披露宴→二次会"),
      b(
        "schedule",
        schedule("タイムテーブル", [
          { day: "披露宴", time: "18:00", label: "開宴（○○ホテル 3F）" },
          { day: "披露宴", time: "20:15", label: "お開き" },
          { day: "二次会", time: "20:30", label: "会場移動（徒歩5分）" },
          { day: "二次会", time: "22:30", label: "終了予定" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("会場・ドレスコード", ""),
      b("notice", notice("ドレスコード", "カジュアルフォーマル。白の全身はご遠慮。二次会のみ参加も歓迎。")),
      b("map", map("会場", "披露宴：○○ホテル / 二次会：△△ダイニング")),
      sectionDivider("dotted"),
      sectionHeading("ゲスト向けFAQ", ""),
      b(
        "faq",
        faq("FAQ", [
          { q: "ご祝儀", a: "当日受付に。袋は不要。" },
          { q: "子ども連れ", a: "披露宴は大人のみ。二次会は相談可。" },
        ]),
      ),
    ]),
  },
  {
    slug: "personal-housewarming",
    name: "新居・ハウスwarming",
    description: "引っ越し祝い・パーティの日時・持ち物・住所を共有。",
    preview_image: pv("personal", "personal-housewarming"),
    category: "personal",
    cards: ordered([
      b("welcome", welcome("新居パーティ", "4/6（日）15:00〜。軽いおつまみだけでOK。")),
      hubLinks("パーティ導線", [
        { label: "住所", icon: "map-pin" },
        { label: "LINE", icon: "link" },
        { label: "持ち物", icon: "gift" },
        { label: "ギフト", icon: "shopping-bag" },
      ]),
      sectionHeading("来てくれる人へ", "靴・お花より飲み物歓迎"),
      b("map", map("新しいお家", "○○市△△ マンション101（インターホン101）")),
      b(
        "notice",
        notice("お願い", "靴はスリッパあり。お花より飲み物やスナック歓迎。19時頃終わり予定。"),
      ),
      sectionDivider(),
      sectionHeading("あると助かるもの", ""),
      b(
        "checklist",
        checklist("持参リスト", ["紙コップ（足りない）", "アイス", "リサイクル袋"]),
      ),
    ]),
  },
  {
    slug: "oshi-offline-meetup",
    name: "オフ会・ファン交流会",
    description: "推し活のオフ会。集合・ルール・会費を参加者に共有。",
    preview_image: pv("oshi", "oshi-offline-meetup"),
    category: "oshi",
    cards: ordered([
      b("hero", hero("○○ファンオフ会 #3", "5/10（土）14:00 / カフェ貸切", pv("oshi", "oshi-offline-meetup"))),
      hubLinks("オフ会メニュー", [
        { label: "ルール", icon: "shield" },
        { label: "タイムテーブル", icon: "clock" },
        { label: "会場", icon: "map-pin" },
        { label: "参加表明", icon: "ticket" },
      ]),
      sectionHeading("ルール", "公式非公認・撮影・トレード"),
      b(
        "notice",
        notice(
          "参加ルール",
          "公式非公認。撮影は参加者全員OKが出た場合のみ。トレードは会場内のみ。誹謗中傷禁止。",
        ),
      ),
      sectionDivider(),
      sectionHeading("当日の流れ", ""),
      b(
        "schedule",
        schedule("流れ", [
          { day: "13:45", time: "受付", label: "名札・会費 500円" },
          { day: "14:00", time: "自己紹介", label: "1人30秒" },
          { day: "15:00", time: "フリータイム", label: "トレード・写真" },
          { day: "16:30", time: "解散", label: "店外での追いコンは任意" },
        ]),
      ),
      b("map", map("会場", "△△カフェ 2F（○○駅東口 徒歩3分）")),
      sectionDivider("dotted"),
      sectionHeading("参加について", ""),
      b(
        "faq",
        faq("FAQ", [
          { q: "誰でも？", a: "18歳以上。参加表明フォーム必須。" },
          { q: "コスプレ", a: "可。更衣室はなし。" },
        ]),
      ),
    ]),
  },
];
