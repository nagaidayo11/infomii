import {
  accordionInfo,
  breakfast,
  breakfastCrowd,
  checklist,
  circlePageLinks,
  comparePricing,
  contactHub,
  dayTimeline,
  dinnerCrowd,
  drinkMenu,
  emergency,
  faq,
  hero,
  heroSlider,
  highlight,
  iconAccordion,
  imageTiles,
  infoRows,
  kpi,
  laundry,
  map,
  menuCategories,
  nearby,
  notice,
  openStatus,
  pageLinks,
  progressSteps,
  restaurant,
  schedule,
  sectionTitle,
  SEED_PREVIEW_IMAGE,
  socialLinks,
  spa,
  spaCrowd,
  steps,
  storyBand,
  tabsInfo,
  welcome,
  wifi,
  checkout,
} from "@/lib/marketplace-seed-blocks";
import { block, ordered, type MarketplaceSeedTemplate } from "@/lib/marketplace-seed-types";
import { marketplaceTemplatePreviewPath } from "@/lib/template-preview";

function hotelTemplate(
  slug: string,
  name: string,
  description: string,
  category: MarketplaceSeedTemplate["category"],
  cards: ReturnType<typeof ordered>,
  previewImage?: string,
): MarketplaceSeedTemplate {
  return {
    slug,
    name,
    description,
    category,
    preview_image: previewImage ?? marketplaceTemplatePreviewPath(category, slug),
    cards,
  };
}

/**
 * Hotel marketplace templates — thick rebuild with layout variants + selective new blocks.
 * Differentiation: by category AND within category (structure / layouts / accents).
 */
export const HOTEL_MARKETPLACE_SEED_TEMPLATES: MarketplaceSeedTemplate[] = [
  // ── business ─────────────────────────────────────────────────────────────
  hotelTemplate(
    "case-business-hotel",
    "【事例】ビジネスホテル案内",
    "Wi-Fi・朝食・チェックアウトを表形式で即確認。出張客の口頭説明を減らす定番の導入例です。",
    "business",
    ordered([
      block("hero", hero("ご滞在のご案内", "客室QRから、よく聞かれる情報をすぐ確認", { layout: "stack" })),
      block(
        "info",
        infoRows(
          "すぐ確認",
          "info",
          [
            { label: "Wi-Fi", value: "Infomii-Guest / stay2026" },
            { label: "朝食", value: "6:30-9:30 / 1F" },
            { label: "チェックアウト", value: "11:00" },
            { label: "フロント", value: "24時間 / 内線9" },
          ],
          { layout: "table" },
        ),
      ),
      block("wifi", wifi("Infomii-Guest", "stay2026", "客室・ロビーでご利用いただけます。")),
      block("breakfast", breakfast("朝食", "6:30-9:30", "1F レストラン", "和洋ビュッフェ")),
      block("checkout", checkout("11:00", "カードキーはフロントへお返しください。", "精算・領収書")),
      block(
        "pageLinks",
        pageLinks(
          "関連ページ",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "朝食", icon: "breakfast" },
            { label: "チェックアウト", icon: "checkout" },
            { label: "FAQ", icon: "info" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block(
        "faq",
        faq("よくある質問", [
          { q: "レイトチェックアウトは？", a: "空室状況により11:30まで延長可能です（有料）。" },
          { q: "荷物預かりは？", a: "チェックアウト後も当日中はお預かりできます。" },
        ]),
      ),
      block("emergency", emergency("緊急連絡先", "フロント内線9", "体調不良時はフロントへご連絡ください。")),
    ]),
  ),
  hotelTemplate(
    "hotel-guest-guide",
    "1枚完結・ゲスト案内",
    "歓迎文とカード型館内情報で、Wi-Fi・朝食・チェックアウト・FAQを1ページにまとめた定番型です。",
    "business",
    ordered([
      block("hero", hero("ご滞在のご案内", "客室で開いてすぐ使える、よくある質問のまとめ", { layout: "overlay" })),
      block(
        "welcome",
        welcome(
          "本日はご宿泊ありがとうございます",
          "このページに、チェックイン後によく必要になる情報を集めました。",
          { layout: "plain" },
        ),
      ),
      block("wifi", wifi("Infomii-Guest", "welcome2026", "客室・ロビーでご利用いただけます。")),
      block(
        "pageLinks",
        pageLinks(
          "このページでわかること",
          [
            { label: "Wi-Fi", icon: "wifi", description: "接続情報" },
            { label: "朝食", icon: "breakfast", description: "時間・場所" },
            { label: "チェックアウト", icon: "checkout", description: "時刻・返却" },
            { label: "FAQ", icon: "info", description: "よくある質問" },
          ],
          { columns: 2, styleVariant: "tile" },
        ),
      ),
      block("breakfast", breakfast("朝食", "6:30-9:30", "1F レストラン", "和洋ビュッフェ")),
      block(
        "info",
        infoRows(
          "館内案内",
          "info",
          [
            { label: "チェックイン", value: "15:00〜" },
            { label: "フロント", value: "24時間 / 内線9" },
            { label: "ランドリー", value: "2F / 6:00-24:00" },
          ],
          { layout: "cards" },
        ),
      ),
      block("checkout", checkout("11:00", "カードキーはフロントへお返しください。", "精算・領収書")),
      block(
        "faq",
        faq("よくある質問", [
          { q: "延泊はできますか？", a: "空室状況により前日20:00まで承ります。" },
          { q: "荷物を預けられますか？", a: "チェックアウト後も当日中はお預かりできます。" },
        ]),
      ),
      block("emergency", emergency("緊急連絡先", "地域医療センター", "体調不良時はフロントへご連絡ください。")),
    ]),
  ),
  hotelTemplate(
    "hotel-stay-flow",
    "滞在の流れ・ステップ",
    "区切り見出しと進捗ステップで、チェックインから退室までを迷わず進めるページ型です。",
    "business",
    ordered([
      block("hero", hero("ご滞在の流れ", "初めての方でも迷わないステップ案内", { layout: "split" })),
      block(
        "sectionTitle",
        sectionTitle("いまの進捗", { subtitle: "チェックイン後の確認項目", align: "left" }),
      ),
      block(
        "progress_steps",
        progressSteps(
          "いまの進捗",
          [
            { label: "チェックイン完了", done: true },
            { label: "Wi-Fi接続", done: false },
            { label: "館内案内の確認", done: false },
            { label: "チェックアウト", done: false },
          ],
          2,
        ),
      ),
      block(
        "steps",
        steps("チェックイン〜チェックアウト", [
          { title: "1. チェックイン", description: "フロントで鍵をお受け取りください。" },
          { title: "2. 客室でWi-Fi接続", description: "QRまたは客室カードの情報をご利用ください。" },
          { title: "3. チェックアウト", description: "指定時刻までに鍵をフロントへお返しください。" },
        ]),
      ),
      block(
        "checklist",
        checklist("出発前チェック", ["カードキーの返却", "冷蔵庫の確認", "忘れ物の確認"]),
      ),
      block(
        "pageLinks",
        pageLinks(
          "次に見る",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "チェックアウト", icon: "checkout" },
            { label: "FAQ", icon: "info" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block("checkout", checkout("11:00", "早朝出発の場合は自動精算機もご利用いただけます。")),
    ]),
  ),
  hotelTemplate(
    "hotel-plan-pricing",
    "料金・プラン比較",
    "スタックヒーローとKPIで、宿泊プランを比較しやすい訴求ページです。",
    "business",
    ordered([
      block("hero", hero("プラン・料金", "ご希望に合わせてお選びください", { layout: "stack" })),
      block(
        "kpi",
        kpi("クイック情報", [
          { label: "チェックイン", value: "15:00" },
          { label: "チェックアウト", value: "11:00" },
          { label: "フロント", value: "24h" },
        ]),
      ),
      block(
        "compare",
        comparePricing(
          "宿泊プラン比較",
          ["スタンダード", "朝食付き", "連泊割"],
          [
            { label: "料金目安", values: ["8,800円〜", "10,200円〜", "7,900円〜"] },
            { label: "朝食", values: ["—", "ビュッフェ", "ビュッフェ"] },
            { label: "レイトCO", values: ["+1,100円", "+1,100円", "1回無料"] },
          ],
          1,
        ),
      ),
      block(
        "info",
        infoRows(
          "含まれるもの",
          "info",
          [
            { label: "スタンダード", value: "客室のみ" },
            { label: "朝食付き", value: "客室＋朝食" },
            { label: "連泊割", value: "3泊以上で適用" },
          ],
          { layout: "table" },
        ),
      ),
      block("button", { label: "空室・料金を確認", href: "https://example.com" }),
    ]),
  ),
  hotelTemplate(
    "hotel-long-stay",
    "長期滞在・生活案内",
    "引用風の歓迎とインライン情報で、連泊・長期宿泊者向けの生活情報をまとめたページです。",
    "business",
    ordered([
      block(
        "welcome",
        welcome("長期滞在のご案内", "生活に必要な情報をまとめました。", { layout: "quote" }),
      ),
      block(
        "info",
        infoRows(
          "生活の目安",
          "info",
          [
            { label: "ランドリー", value: "6:00-24:00" },
            { label: "清掃", value: "平日 10:00-14:00" },
            { label: "タオル交換", value: "フロント随時" },
          ],
          { layout: "inline" },
        ),
      ),
      block("laundry", laundry("6:00-24:00", "洗濯300円 / 乾燥100円", "フロント")),
      block(
        "nearby",
        nearby("生活インフラ", [
          { name: "スーパー", description: "徒歩4分 / 24時まで" },
          { name: "ドラッグストア", description: "徒歩6分" },
          { name: "コインランドリー", description: "徒歩3分" },
        ]),
      ),
      block(
        "schedule",
        schedule("清掃・交換", [
          { day: "客室清掃", time: "10:00-14:00", label: "平日のみ" },
          { day: "タオル交換", time: "随時", label: "フロントにて" },
        ]),
      ),
      block("notice", notice("ゴミの分別", "可燃・不燃・資源ごとに分別をお願いします。")),
      block(
        "pageLinks",
        pageLinks(
          "関連案内",
          [
            { label: "ランドリー", icon: "laundry" },
            { label: "周辺", icon: "map" },
            { label: "FAQ", icon: "info" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block(
        "faq",
        faq("長期滞在FAQ", [
          { q: "宅配便は受け取れますか？", a: "フロントでお預かりします。事前にご連絡ください。" },
        ]),
      ),
    ]),
  ),

  // ── ryokan ───────────────────────────────────────────────────────────────
  hotelTemplate(
    "case-onsen-ryokan",
    "【事例】温泉旅館・温浴案内",
    "スプリットヒーローと丸アイコン導線で、入浴ルール・食事時間を1ページにまとめた導入例です。",
    "ryokan",
    ordered([
      block("hero", hero("温泉・ご滞在のご案内", "入浴前に一度ご確認ください", { layout: "split" })),
      block(
        "welcome",
        welcome("ようこそお越しくださいました", "湯浴みの前に、時間とお願いだけご確認ください。", {
          layout: "quote",
          accentColor: "#9a3412",
        }),
      ),
      block(
        "spa",
        spa("温泉・大浴場", "15:00-24:00 / 6:00-9:00", "本館1F", "源泉かけ流し。タオルは客室からお持ちください。"),
      ),
      block(
        "pageLinks",
        circlePageLinks([
          { label: "入浴注意", icon: "spa" },
          { label: "食事時間", icon: "restaurant" },
          { label: "Wi-Fi", icon: "wifi" },
          { label: "FAQ", icon: "info" },
        ]),
      ),
      block("restaurant", restaurant("お食事", "18:00スタート", "会席料理", "アレルギーは前日までにご連絡ください。")),
      block("notice", notice("入浴のお願い", "刺青・タトゥーのある方のご入浴はお断りしております。")),
      block(
        "faq",
        faq("よくある質問", [
          { q: "浴衣の着方は？", a: "左前に重ねてお召しください。" },
          { q: "サウナの利用時間は？", a: "大浴場と同じ営業時間です。" },
        ]),
      ),
    ]),
  ),
  hotelTemplate(
    "hotel-ryokan-omotenashi",
    "旅館・おもてなし案内",
    "写真ストーリーと一日の流れで、食事・温泉をおもてなしとして伝えるページ型です。",
    "ryokan",
    ordered([
      block(
        "storyBand",
        storyBand("季節のおもてなし", "湯けむりと会席で、ゆっくりとした時間をお過ごしください。", {
          eyebrow: "ご滞在案内",
          accentColor: "#9a3412",
        }),
      ),
      block(
        "welcome",
        welcome("ようこそお越しくださいました", "ゆっくりとお過ごしください。", {
          layout: "quote",
          accentColor: "#9a3412",
        }),
      ),
      block(
        "dayTimeline",
        dayTimeline(
          "本日の流れ",
          [
            { time: "15:00", title: "チェックイン", description: "フロントにて鍵をお渡しします" },
            { time: "15:00-24:00", title: "温泉", description: "本館1F・源泉かけ流し" },
            { time: "18:00", title: "夕食", description: "お食事処（要予約）" },
            { time: "7:30-9:00", title: "朝食", description: "個室または食事処" },
            { time: "10:00", title: "チェックアウト", description: "フロントにて精算" },
          ],
          { accentColor: "#9a3412" },
        ),
      ),
      block("restaurant", restaurant("お食事のご案内", "18:00〜", "お食事処", "季節の会席・替り鉢")),
      block(
        "spa",
        spa("温泉・大浴場", "15:00-24:00", "本館1F", "源泉かけ流し。タオルは客室からお持ちください。"),
      ),
      block(
        "pageLinks",
        pageLinks(
          "旅館の関連ページ",
          [
            { label: "お食事", icon: "utensils" },
            { label: "温泉", icon: "spa" },
            { label: "お願い", icon: "notice" },
            { label: "FAQ", icon: "info" },
          ],
          { columns: 2, styleVariant: "tile", accentColor: "#9a3412" },
        ),
      ),
      block("highlight", highlight("お願い", "館内は畳・廊下が多いため、スリッパでお過ごしください。", "amber")),
      block(
        "faq",
        faq("よくあるご質問", [
          { q: "浴衣の着方は？", a: "左前にてご着用ください。帯の結び方は客室の案内をご覧ください。" },
          { q: "チェックアウトは？", a: "10:00まで。お支払いはフロントにて承ります。" },
        ]),
      ),
    ]),
  ),
  hotelTemplate(
    "hotel-ryokan-onsen-etiquette",
    "旅館・温泉マナー",
    "アイコンを押すと作法が開く案内で、温泉の手順とお願いをまとめた作法型ページです。",
    "ryokan",
    ordered([
      block("hero", hero("温泉のご案内", "ご入浴前に一度ご確認ください", { layout: "overlay" })),
      block(
        "sectionTitle",
        sectionTitle("ご利用のポイント", {
          subtitle: "落ち着いてご入浴いただけるように",
          accentColor: "#9a3412",
        }),
      ),
      block("spa", spa("温泉・大浴場", "6:00-23:00", "本館2F", "源泉かけ流し。タオルは客室からお持ちください")),
      block(
        "iconAccordion",
        iconAccordion(
          "入浴マナー",
          [
            {
              label: "身支度",
              icon: "spa",
              description: "脱衣所",
              body: "脱衣所で身支度をし、タオルは客室からご持参ください。",
            },
            {
              label: "入浴",
              icon: "bath",
              description: "浴槽",
              body: "湯温に合わせてゆっくりご入浴ください。かけ湯をしてからお入りください。",
            },
            {
              label: "休憩",
              icon: "coffee",
              description: "水分補給",
              body: "入浴後は水分補給をして体を休めてください。",
            },
            {
              label: "お願い",
              icon: "notice",
              description: "マナー",
              body: "浴室内は静かにご利用ください。安全のため走らないでください。",
            },
          ],
          { columns: 2, styleVariant: "circle", accentColor: "#9a3412" },
        ),
      ),
      block(
        "steps",
        steps("入浴のステップ", [
          { title: "1. 身支度", description: "脱衣所で身支度をします" },
          { title: "2. 入浴", description: "湯温に合わせてゆっくりご入浴ください" },
          { title: "3. 休憩", description: "水分補給をして体を休めてください" },
        ]),
      ),
      block("highlight", highlight("ご利用のお願い", "浴室内は静かにご利用ください。安全のため走らないでください。", "amber")),
      block(
        "faq",
        faq("よくあるご質問", [
          { q: "タオルはありますか？", a: "タオルは客室からご持参ください。" },
          { q: "入浴時間の目安は？", a: "朝は6:00から、夜は23:00までご利用いただけます。" },
        ]),
      ),
      block("checkout", checkout("10:00", "チェックアウトはフロントへお返しください。", "精算・領収書")),
    ]),
  ),

  // ── resort ───────────────────────────────────────────────────────────────
  hotelTemplate(
    "case-resort-stay",
    "【事例】リゾート滞在案内",
    "スライドとポスター型導線で、送迎・体験・食事を最上段に置く導入例です。",
    "resort",
    ordered([
      block("hero_slider", heroSlider("リゾートステイ")),
      block("notice", notice("本日のお知らせ", "14:00よりプールメンテナンスのため一時利用停止となります。")),
      block(
        "schedule",
        schedule("本日のスケジュール", [
          { day: "朝食", time: "8:00", label: "1F ダイニング" },
          { day: "送迎", time: "10:30", label: "ロビー集合（館内ツアー）" },
          { day: "体験", time: "15:00", label: "マリンアクティビティ（要予約）" },
        ]),
      ),
      block(
        "pageLinks",
        pageLinks(
          "体験メニュー",
          [
            { label: "送迎", icon: "taxi", description: "ロビー集合" },
            { label: "アクティビティ", icon: "map", description: "要予約" },
            { label: "レストラン", icon: "restaurant", description: "予約制" },
            { label: "FAQ", icon: "info", description: "よくある質問" },
          ],
          { columns: 2, styleVariant: "poster", accentColor: "#0369a1" },
        ),
      ),
      block("map", map("アクセス・集合場所", "ホテル正面ロータリー")),
      block("social_links", socialLinks("公式SNS", "@infomii_resort")),
    ]),
  ),
  hotelTemplate(
    "hotel-live-crowd",
    "ライブ混雑・いま状況ボード",
    "区切り見出しと混雑ライブ表示で、当日の動きをすぐ判断できる運用向け1枚です。",
    "resort",
    ordered([
      block("hero", hero("館内のいま", "混雑状況をまとめて確認", { layout: "stack" })),
      block(
        "sectionTitle",
        sectionTitle("ライブ状況", { subtitle: "色とメモで、今すぐ動ける時間帯が分かります", align: "center" }),
      ),
      block("breakfast_crowd", breakfastCrowd("朝食の混雑いま", "open", "比較的空いている目安：6:30-7:15")),
      block("dinner_crowd", dinnerCrowd("夕食の混雑いま", "moderate", "18:00前後はやや混み合います")),
      block("spa_crowd", spaCrowd("大浴場の混雑いま", "open", "夕方17:00-19:00は入替が多いです")),
      block(
        "schedule",
        schedule("営業時間", [
          { day: "朝食", time: "7:00-10:00", label: "1F レストラン" },
          { day: "夕食", time: "18:00-21:00", label: "2F ダイニング" },
          { day: "大浴場", time: "6:00-24:00", label: "男女入替あり" },
        ]),
      ),
      block("notice", notice("混雑時のお願い", "ピーク時間は時間をずらすか、テイクアウトをご検討ください。", "info")),
    ]),
  ),
  hotelTemplate(
    "hotel-restaurant-menu",
    "レストラン・メニュー特化",
    "オーバーレイヒーローと丸アイコン導線で、飲食案内だけを見せるページ型です。",
    "resort",
    ordered([
      block("hero", hero("レストラン案内", "お食事はこちらのページでご確認ください", { layout: "overlay" })),
      block("open_status", openStatus("レストラン", "11:30-14:00 / 18:00-21:00")),
      block(
        "pageLinks",
        pageLinks(
          "レストランの導線",
          [
            { label: "営業時間", icon: "clock" },
            { label: "メニュー", icon: "utensils" },
            { label: "ドリンク", icon: "coffee" },
            { label: "レストラン", icon: "restaurant" },
          ],
          { columns: 4, styleVariant: "circle", accentColor: "#0369a1" },
        ),
      ),
      block(
        "menu_categories",
        menuCategories("メニュー", [
          {
            title: "ランチ",
            items: [
              { name: "季節の定食", price: "1,800円", description: "日替わりスープ付き", tag: "人気" },
              { name: "パスタランチ", price: "1,500円", description: "サラダ・ドリンクセット" },
            ],
          },
          {
            title: "ディナー",
            items: [{ name: "シェフおまかせ", price: "4,800円", description: "前日17:00まで予約" }],
          },
        ]),
      ),
      block(
        "drink_menu",
        drinkMenu("ドリンク", [
          { name: "地ビール", sizes: "M 700円 / L 900円", note: "ラウンジでも提供" },
          { name: "ハウスワイン", sizes: "グラス 650円", note: "赤・白" },
        ]),
      ),
      block("restaurant", restaurant("営業案内", "11:30-21:00", "2F レストラン", "ラストオーダーは30分前")),
    ]),
  ),
  hotelTemplate(
    "hotel-resort-gallery",
    "リゾート・体験ギャラリー",
    "写真ストーリー帯とラベル付き画像タイルで、非日常感を伝える訴求型ページです。",
    "resort",
    ordered([
      block(
        "storyBand",
        storyBand("海と空に囲まれて", "プール・ラウンジ・夕景。今日の気分で選んでください。", {
          eyebrow: "Resort Stay",
          accentColor: "#0369a1",
        }),
      ),
      block(
        "image_tiles",
        imageTiles(
          [{ label: "プール" }, { label: "ラウンジ" }, { label: "夕景" }, { label: "スパ" }],
          { columns: 2, showLabels: true },
        ),
      ),
      block(
        "pageLinks",
        pageLinks(
          "体験メニュー",
          [
            { label: "プール", icon: "spa", description: "7:00-21:00" },
            { label: "アクティビティ", icon: "map", description: "要予約" },
            { label: "スパ", icon: "spa", description: "15:00-23:00" },
            { label: "レストラン", icon: "restaurant", description: "予約制" },
          ],
          { columns: 2, styleVariant: "poster", accentColor: "#0369a1" },
        ),
      ),
      block(
        "tabs_info",
        tabsInfo("体験の詳細", [
          { label: "プール", body: "7:00-21:00 / タオルはプールサイドで配布" },
          { label: "アクティビティ", body: "SUP・サイクリングは前日まで予約" },
          { label: "スパ", body: "15:00-23:00 / 最終入場 22:00" },
        ]),
      ),
      block("social_links", socialLinks("公式SNS", "@infomii_resort")),
      block("button", { label: "体験予約はこちら", href: "https://example.com" }),
    ]),
  ),
  hotelTemplate(
    "hotel-spa-wellness",
    "スパ・ウェルネス案内",
    "写真ストーリーとプレーン歓迎で、温泉・施術・営業時間を中心にした癒し訴求ページです。",
    "resort",
    ordered([
      block(
        "storyBand",
        storyBand("スパ・ウェルネス", "ごゆっくりおくつろぎください", {
          eyebrow: "Wellness",
          accentColor: "#0f766e",
        }),
      ),
      block(
        "welcome",
        welcome("心と体をほどく時間", "大浴場とトリートメントのご案内です。", { layout: "plain" }),
      ),
      block("spa", spa("大浴場", "6:00-24:00", "本館3F", "内湯・露天風呂・サウナ")),
      block("open_status", openStatus("スパ受付", "10:00-21:00")),
      block(
        "menu",
        {
          title: "施術メニュー",
          items: [
            { name: "アロマトリートメント", price: "60分 8,800円", description: "要予約" },
            { name: "足裏マッサージ", price: "30分 4,400円", description: "当日受付あり" },
          ],
        },
      ),
      block(
        "dayTimeline",
        dayTimeline("おすすめの過ごし方", [
          { time: "10:00", title: "スパ受付", description: "トリートメントのご予約" },
          { time: "15:00", title: "大浴場", description: "内湯・露天・サウナ" },
          { time: "18:00", title: "夕食前の休息", description: "水分補給をお忘れなく" },
        ]),
      ),
      block("highlight", highlight("ご利用のお願い", "タトゥー・刺青のある方のご利用はお断りする場合があります。", "amber")),
    ]),
  ),
  hotelTemplate(
    "hotel-family-stay",
    "ファミリー滞在",
    "タイル導線とチェックリストで、子連れ向けの注意・周辺をまとめた家族滞在ページです。",
    "resort",
    ordered([
      block("hero", hero("ファミリーでご滞在", "お子様連れでも安心のご案内", { layout: "stack" })),
      block(
        "pageLinks",
        pageLinks(
          "ファミリー向け",
          [
            { label: "チェック", icon: "checklist", description: "出発前確認" },
            { label: "周辺", icon: "map", description: "家族向けスポット" },
            { label: "お願い", icon: "notice", description: "館内ルール" },
            { label: "FAQ", icon: "info", description: "よくある質問" },
          ],
          { columns: 2, styleVariant: "tile", accentColor: "#0369a1" },
        ),
      ),
      block(
        "checklist",
        checklist("お子様連れチェック", ["ベビーベッドの有無確認", "浴衣サイズ", "夕食の時間予約"]),
      ),
      block(
        "nearby",
        nearby("家族向けスポット", [
          { name: "公園", description: "徒歩5分 / 遊具あり" },
          { name: "水族館", description: "車で15分" },
          { name: "コンビニ", description: "徒歩3分" },
        ]),
      ),
      block("notice", notice("館内のお願い", "客室フロアではお子様の走り回りにご注意ください。", "info")),
      block(
        "faq",
        faq("ファミリーFAQ", [
          { q: "ベビーベッドは借りられますか？", a: "数に限りがあります。事前予約をおすすめします。" },
        ]),
      ),
    ]),
  ),

  // ── guide ────────────────────────────────────────────────────────────────
  hotelTemplate(
    "hotel-core-hub",
    "館内ハブ・サークル導線",
    "ヒーロースライド＋丸アイコン＋画像タイルで、子ページへ分岐する入口ページの型です。",
    "guide",
    ordered([
      block("hero_slider", heroSlider("ご滞在ガイド")),
      block(
        "sectionTitle",
        sectionTitle("よく使う案内", { subtitle: "タップして各ページへ", align: "center" }),
      ),
      block(
        "pageLinks",
        circlePageLinks([
          { label: "Wi-Fi", icon: "wifi" },
          { label: "フロント", icon: "phone" },
          { label: "大浴場", icon: "spa" },
          { label: "FAQ", icon: "info" },
        ]),
      ),
      block(
        "image_tiles",
        imageTiles(
          [{ label: "レストラン" }, { label: "朝食" }, { label: "周辺案内" }, { label: "アクセス" }],
          { columns: 2, showLabels: true },
        ),
      ),
      block(
        "pageLinks",
        pageLinks(
          "もっと見る",
          [
            { label: "チェックイン", icon: "key" },
            { label: "チェックアウト", icon: "checkout" },
            { label: "タクシー", icon: "taxi" },
            { label: "駐車場", icon: "parking" },
          ],
          { columns: 2, styleVariant: "list" },
        ),
      ),
    ]),
  ),
  hotelTemplate(
    "hotel-area-sightseeing",
    "周辺観光・回遊ガイド",
    "一日のタイムラインと写真ストーリーで、周辺探索を促すページ型です。",
    "guide",
    ordered([
      block(
        "storyBand",
        storyBand("周辺を楽しむ", "徒歩圏のおすすめと、半日で回れるモデルコース。", {
          eyebrow: "Area Guide",
        }),
      ),
      block("map", map("アクセス", "〒000-0000 〇〇市〇〇1-2-3")),
      block(
        "dayTimeline",
        dayTimeline("半日モデルコース", [
          { time: "9:00", title: "朝市", description: "徒歩5分 / 地元野菜と海鮮" },
          { time: "11:00", title: "神社", description: "朝市から徒歩8分" },
          { time: "14:00", title: "資料館", description: "午後の見学に最適" },
          { time: "16:00", title: "カフェ", description: "商店街で休憩" },
        ]),
      ),
      block(
        "nearby",
        nearby("おすすめスポット", [
          { name: "朝市", description: "徒歩5分 / 7:00-11:00" },
          { name: "展望台", description: "徒歩12分 / 夕景が人気" },
          { name: "商店街", description: "徒歩8分 / 食べ歩き向き" },
        ]),
      ),
      block(
        "accordion_info",
        accordionInfo("スポット詳細", [
          { title: "朝市", body: "地元野菜と海鮮が人気。現金のみの店もあります。" },
          { title: "展望台", body: "夕方17:00頃がおすすめ。風が強い日は上着を。" },
        ]),
      ),
    ]),
  ),

  // ── airbnb ───────────────────────────────────────────────────────────────
  hotelTemplate(
    "hotel-airbnb-self-checkin",
    "民泊・セルフチェックイン",
    "スタックヒーローとリスト導線で、鍵・Wi-Fi・ハウスルールをセルフ滞在向けに整理したページです。",
    "airbnb",
    ordered([
      block("hero", hero("セルフチェックイン案内", "到着後はこのページの順番で進めてください", { layout: "stack" })),
      block(
        "info",
        infoRows(
          "まず確認",
          "info",
          [
            { label: "キーボックス", value: "玄関右側" },
            { label: "Wi-Fi", value: "Stay-Guest" },
            { label: "消灯・静粛", value: "22:00以降" },
          ],
          { layout: "table" },
        ),
      ),
      block(
        "steps",
        steps("チェックイン手順", [
          { title: "1. 玄関のキーボックス", description: "予約メールのコードで解錠してください。" },
          { title: "2. Wi-Fi接続", description: "下記のSSID・パスワードをご利用ください。" },
          { title: "3. ハウスルール確認", description: "夜間の騒音・ゴミ出しルールをご確認ください。" },
        ]),
      ),
      block("wifi", wifi("Stay-Guest", "checkin2026", "リビングのルーター横にQRがあります。")),
      block(
        "checklist",
        checklist("退去前チェック", ["ゴミの分別", "鍵の返却", "窓の施錠", "エアコンOFF"]),
      ),
      block("notice", notice("ハウスルール", "22:00以降はお静かにお願いします。ペット同伴不可。", "warning")),
      block(
        "pageLinks",
        pageLinks(
          "このページでわかること",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "手順", icon: "steps" },
            { label: "ルール", icon: "notice" },
            { label: "連絡先", icon: "phone" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block("contact_hub", contactHub("困ったときは", "鍵・設備の不具合はメッセージでご連絡ください。")),
    ]),
  ),
  hotelTemplate(
    "hotel-airbnb-house-guide",
    "民泊・ハウスガイド",
    "プレーン歓迎とインライン情報で、鍵・Wi-Fi・ご利用前チェックを1ページで確認できます。",
    "airbnb",
    ordered([
      block("hero", hero("ハウスガイド", "初めての方も迷わないようにまとめました", { layout: "overlay" })),
      block(
        "welcome",
        welcome("ようこそ", "ご利用前に下のチェックだけお済ませください。", { layout: "plain" }),
      ),
      block(
        "info",
        infoRows(
          "基本情報",
          "info",
          [
            { label: "Wi-Fi", value: "Stay-Guest / house2026" },
            { label: "ゴミ出し", value: "所定の場所へ" },
            { label: "静粛", value: "22:00以降" },
          ],
          { layout: "inline" },
        ),
      ),
      block("wifi", wifi("Stay-Guest", "house2026", "客室のルーターをご利用ください。", "Wi-Fi")),
      block(
        "checklist",
        checklist("ご利用前チェック", ["鍵の受け取り", "Wi-Fi接続", "ゴミ出し場所確認", "非常時の連絡先"]),
      ),
      block("notice", notice("ハウスルール", "22:00以降はお静かにお願いします。ゴミ出しは所定の場所へ。", "warning")),
      block("map", map("近くのスポット", "〒000-0000 〇〇市〇〇1-2-3")),
      block(
        "pageLinks",
        pageLinks(
          "このページでわかること",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "チェック", icon: "checklist" },
            { label: "ルール", icon: "notice" },
            { label: "連絡先", icon: "phone" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block("contact_hub", contactHub("困ったときは", "鍵・設備の不具合や迷ったときはご連絡ください。", "03-1234-5678")),
    ]),
  ),

  // ── inbound ──────────────────────────────────────────────────────────────
  hotelTemplate(
    "hotel-inbound-multilingual",
    "インバウンド・多言語案内",
    "スタックヒーローとリスト導線で、英語中心の滞在情報をすぐ確認できるページ型です。",
    "inbound",
    ordered([
      block("hero", hero("Welcome / ようこそ", "Essential stay information in one page", { layout: "stack" })),
      block(
        "info",
        infoRows(
          "Quick facts",
          "info",
          [
            { label: "Wi-Fi", value: "Global-Guest / welcome2026" },
            { label: "Check-out", value: "11:00" },
            { label: "Quiet hours", value: "After 22:00" },
          ],
          { layout: "table" },
        ),
      ),
      block("wifi", wifi("Global-Guest", "welcome2026", "Available in rooms and lobby. Good for maps and translation apps.", "Wi-Fi")),
      block(
        "nearby",
        nearby("Access", [
          { name: "Nearest Station", description: "8 min walk" },
          { name: "Airport Limousine", description: "Stops at hotel front" },
        ]),
      ),
      block("notice", notice("House Rules", "No smoking in rooms. Quiet hours after 22:00.", "info")),
      block("checkout", checkout("11:00", "Please return your room key to the front desk.", "Check-out")),
      block(
        "faq",
        faq("Guest FAQ", [
          { q: "Can I store luggage?", a: "Yes, same-day storage is available at the front desk." },
          { q: "Is English support available?", a: "Basic English support is available 24/7." },
        ]),
      ),
      block(
        "pageLinks",
        pageLinks(
          "Quick links",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "Access", icon: "map-pin" },
            { label: "Check-out", icon: "checkout" },
            { label: "Contact", icon: "phone" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block("contact_hub", contactHub("Need help?", "Call front desk for check-in, directions, or emergencies.", "+81-3-1111-2222")),
    ]),
  ),
  hotelTemplate(
    "hotel-inbound-arrival-support",
    "インバウンド・到着サポート",
    "アイコン案内とオーバーレイヒーローで、到着導線と緊急連絡先を英語でまとめたページです。",
    "inbound",
    ordered([
      block("hero", hero("Arrival Support / ようこそ", "Essential information in one page", { layout: "overlay" })),
      block("wifi", wifi("Global-Guest", "welcome2026", "Available in rooms and lobby. Good for translation apps.", "Wi-Fi")),
      block(
        "iconAccordion",
        iconAccordion(
          "On arrival",
          [
            {
              label: "Wi-Fi",
              icon: "wifi",
              description: "Connect first",
              body: "SSID: Global-Guest / Password: welcome2026. Available in rooms and lobby.",
            },
            {
              label: "Front desk",
              icon: "phone",
              description: "24h",
              body: "Call or visit the front desk for check-in help, directions, or luggage storage.",
            },
            {
              label: "Quiet hours",
              icon: "notice",
              description: "After 22:00",
              body: "No smoking in rooms. Please keep quiet after 22:00.",
            },
            {
              label: "Emergency",
              icon: "emergency",
              description: "Call front desk",
              body: "In case of emergency, contact the front desk immediately. Fire 119 / Police 110.",
            },
          ],
          { columns: 2, styleVariant: "tile" },
        ),
      ),
      block("notice", notice("Quiet Hours", "No smoking in rooms. Quiet hours after 22:00.", "info")),
      block(
        "faq",
        faq("Guest FAQ", [
          { q: "Where can I store luggage?", a: "Same-day storage is available at the front desk." },
          { q: "How do I contact staff?", a: "Use the contact card or call the front desk." },
        ]),
      ),
      block("emergency", emergency("Emergency Contact", "地域医療センター", "In case of emergency, contact the front desk immediately.")),
      block(
        "pageLinks",
        pageLinks(
          "Quick links",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "FAQ", icon: "info" },
            { label: "Check-out", icon: "checkout" },
            { label: "Contact", icon: "phone" },
          ],
          { columns: 1, styleVariant: "list" },
        ),
      ),
      block("contact_hub", contactHub("Need help?", "Call front desk for check-in, directions, or emergencies.", "+81-3-1111-2222")),
      block("checkout", checkout("11:00", "Please return your room key to the front desk.", "Check-out")),
    ]),
  ),
];

/** @deprecated Use HOTEL_MARKETPLACE_SEED_TEMPLATES */
export const SEED_PREVIEW_IMAGE_HOTEL = SEED_PREVIEW_IMAGE;
