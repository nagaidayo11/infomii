import {
  accordionInfo,
  breakfast,
  breakfastCrowd,
  checklist,
  circlePageLinks,
  comparePricing,
  contactHub,
  dinnerCrowd,
  drinkMenu,
  emergency,
  faq,
  faqSearch,
  gallery,
  headingBody,
  hero,
  heroSlider,
  highlight,
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
  SEED_PREVIEW_IMAGE,
  socialLinks,
  spa,
  spaCrowd,
  steps,
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
): MarketplaceSeedTemplate {
  return {
    slug,
    name,
    description,
    category,
    preview_image: marketplaceTemplatePreviewPath(category, slug),
    cards,
  };
}

/**
 * Hotel marketplace templates — page archetypes (not persona clones).
 * Each showcases a distinct page type Infomii can build.
 */
export const HOTEL_MARKETPLACE_SEED_TEMPLATES: MarketplaceSeedTemplate[] = [
  hotelTemplate(
    "hotel-guest-guide",
    "1枚完結・ゲスト案内",
    "出張・宿泊でよく聞かれるWi-Fi・朝食・チェックアウト・FAQを1ページにまとめた定番型です。",
    "business",
    ordered([
      block("hero", hero("ご滞在のご案内", "客室で開いてすぐ使える、よくある質問のまとめ")),
      block(
        "welcome",
        welcome(
          "本日はご宿泊ありがとうございます",
          "このページに、チェックイン後によく必要になる情報を集めました。",
        ),
      ),
      block("wifi", wifi("Infomii-Guest", "welcome2026", "客室・ロビーでご利用いただけます。")),
      block(
        "pageLinks",
        pageLinks(
          "このページでわかること",
          [
            { label: "Wi-Fi", icon: "wifi" },
            { label: "朝食", icon: "breakfast" },
            { label: "チェックアウト", icon: "checkout" },
            { label: "FAQ", icon: "info" },
          ],
          2,
        ),
      ),
      block("breakfast", breakfast("朝食", "6:30-9:30", "1F レストラン", "和洋ビュッフェ")),
      block("info", infoRows("館内案内", "info", [
        { label: "チェックイン", value: "15:00〜" },
        { label: "フロント", value: "24時間 / 内線9" },
        { label: "ランドリー", value: "2F / 6:00-24:00" },
      ])),
      block("checkout", checkout("11:00", "カードキーはフロントへお返しください。", "精算・領収書")),
      block("faq", faq("よくある質問", [
        { q: "延泊はできますか？", a: "空室状況により前日20:00まで承ります。" },
        { q: "荷物を預けられますか？", a: "チェックアウト後も当日中はお預かりできます。" },
      ])),
      block("emergency", emergency("緊急連絡先", "地域医療センター", "体調不良時はフロントへご連絡ください。")),
    ]),
  ),
  hotelTemplate(
    "hotel-core-hub",
    "館内ハブ・サークル導線",
    "ヒーロースライド＋丸アイコン＋画像タイルで、子ページへ分岐する入口ページの型です。",
    "guide",
    ordered([
      block("hero_slider", heroSlider("ご滞在ガイド")),
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
        imageTiles([
          { label: "レストラン" },
          { label: "朝食" },
          { label: "周辺案内" },
          { label: "アクセス" },
        ]),
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
          2,
        ),
      ),
    ]),
  ),
  hotelTemplate(
    "hotel-live-crowd",
    "ライブ混雑・いま状況ボード",
    "朝食・夕食・大浴場の混雑をライブ表示する、リアルタイム運用向けの1枚です。",
    "resort",
    ordered([
      block("hero", hero("館内のいま", "混雑状況をまとめて確認")),
      block("heading_body", headingBody("混雑の見方", "色とメモで、今すぐ動ける時間帯が分かります。")),
      block("breakfast_crowd", breakfastCrowd("朝食の混雑いま", "open", "比較的空いている目安：6:30-7:15")),
      block("dinner_crowd", dinnerCrowd("夕食の混雑いま", "moderate", "18:00前後はやや混み合います")),
      block("spa_crowd", spaCrowd("大浴場の混雑いま", "open", "夕方17:00-19:00は入替が多いです")),
      block("schedule", schedule("営業時間", [
        { day: "朝食", time: "7:00-10:00", label: "1F レストラン" },
        { day: "夕食", time: "18:00-21:00", label: "2F ダイニング" },
        { day: "大浴場", time: "6:00-24:00", label: "男女入替あり" },
      ])),
      block("notice", notice("混雑時のお願い", "ピーク時間は時間をずらすか、テイクアウトをご検討ください。", "info")),
    ]),
  ),
  hotelTemplate(
    "hotel-restaurant-menu",
    "レストラン・メニュー特化",
    "カテゴリ別メニュー・本日のおすすめ・ドリンクで、飲食案内だけを見せるページ型です。",
    "resort",
    ordered([
      block("hero", hero("レストラン案内", "お食事はこちらのページでご確認ください")),
      block("open_status", openStatus("レストラン", "11:30-14:00 / 18:00-21:00")),
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
            items: [
              { name: "シェフおまかせ", price: "4,800円", description: "前日17:00まで予約" },
            ],
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
          2,
        ),
      ),
      block("restaurant", restaurant("営業案内", "11:30-21:00", "2F レストラン", "ラストオーダーは30分前")),
    ]),
  ),
  hotelTemplate(
    "hotel-stay-flow",
    "滞在の流れ・ステップ",
    "チェックインから退室までの手順を、ステップと進捗で示すページ型です。",
    "business",
    ordered([
      block("hero", hero("ご滞在の流れ", "初めての方でも迷わないステップ案内")),
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
      block("checkout", checkout("11:00", "早朝出発の場合は自動精算機もご利用いただけます。")),
    ]),
  ),
  hotelTemplate(
    "hotel-resort-gallery",
    "リゾート・体験ギャラリー",
    "写真ギャラリーと体験メニューで、非日常感を伝える訴求型ページです。",
    "resort",
    ordered([
      block("hero_slider", heroSlider("リゾートステイ")),
      block("gallery", gallery("館内・周辺のイメージ", ["プール", "ラウンジ", "夕景", "スパ"])),
      block(
        "tabs_info",
        tabsInfo("体験メニュー", [
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
    "hotel-ryokan-omotenashi",
    "旅館・おもてなし案内",
    "おもてなし文・食事時間・温泉案内を、和の滞在体験としてまとめたページ型です。",
    "ryokan",
    ordered([
      block("welcome", welcome("ようこそお越しくださいました", "ゆっくりとお過ごしください。")),
      block("schedule", schedule("お食事の時間", [
        { day: "夕食", time: "18:00 / 18:30 / 19:00", label: "お食事処（要予約）" },
        { day: "朝食", time: "7:30-9:00", label: "個室または食事処" },
      ])),
      block("restaurant", restaurant("お食事のご案内", "18:00〜", "お食事処", "季節の会席・替り鉢")),
      block("spa", spa("温泉・大浴場", "15:00-24:00", "本館1F", "源泉かけ流し。タオルは客室からお持ちください。")),
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
          2,
        ),
      ),
      block("highlight", highlight("お願い", "館内は畳・廊下が多いため、スリッパでお過ごしください。", "amber")),
      block("faq", faq("よくあるご質問", [
        { q: "浴衣の着方は？", a: "左前にてご着用ください。帯の結び方は客室の案内をご覧ください。" },
        { q: "チェックアウトは？", a: "10:00まで。お支払いはフロントにて承ります。" },
      ])),
    ]),
  ),
  hotelTemplate(
    "hotel-airbnb-self-checkin",
    "民泊・セルフチェックイン",
    "鍵の受け取り・ハウスルール・ゴミ出しを、セルフ滞在向けに整理したページ型です。",
    "airbnb",
    ordered([
      block("hero", hero("セルフチェックイン案内", "到着後はこのページの順番で進めてください")),
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
          2,
        ),
      ),
      block("contact_hub", contactHub("困ったときは", "鍵・設備の不具合はメッセージでご連絡ください。")),
    ]),
  ),
  hotelTemplate(
    "hotel-area-sightseeing",
    "周辺観光・回遊ガイド",
    "地図・スポット一覧・モデルコースで、周辺探索を促すページ型です。",
    "guide",
    ordered([
      block("hero", hero("周辺を楽しむ", "徒歩圏のおすすめとアクセス")),
      block("map", map("アクセス", "〒000-0000 〇〇市〇〇1-2-3")),
      block(
        "nearby",
        nearby("おすすめスポット", [
          { name: "朝市", description: "徒歩5分 / 7:00-11:00" },
          { name: "展望台", description: "徒歩12分 / 夕景が人気" },
          { name: "商店街", description: "徒歩8分 / 食べ歩き向き" },
        ]),
      ),
      block(
        "schedule",
        schedule("半日モデルコース", [
          { day: "午前", time: "9:00", label: "朝市 → 神社" },
          { day: "午後", time: "14:00", label: "資料館 → カフェ" },
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
  hotelTemplate(
    "hotel-inbound-multilingual",
    "インバウンド・多言語案内",
    "英語中心の滞在情報とFAQ検索で、海外ゲスト向けのページ型です。",
    "inbound",
    ordered([
      block("hero", hero("Welcome / ようこそ", "Essential stay information in one page")),
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
        "faq_search",
        faqSearch("Guest FAQ", [
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
          2,
        ),
      ),
      block("contact_hub", contactHub("Need help?", "Call front desk for check-in, directions, or emergencies.", "+81-3-1111-2222")),
    ]),
  ),
  hotelTemplate(
    "hotel-plan-pricing",
    "料金・プラン比較",
    "宿泊プランやオプションを表形式で比較する、訴求・選択支援のページ型です。",
    "business",
    ordered([
      block("hero", hero("プラン・料金", "ご希望に合わせてお選びください")),
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
        "kpi",
        kpi("クイック情報", [
          { label: "チェックイン", value: "15:00" },
          { label: "チェックアウト", value: "11:00" },
          { label: "フロント", value: "24h" },
        ]),
      ),
      block("button", { label: "空室・料金を確認", href: "https://example.com" }),
    ]),
  ),
  hotelTemplate(
    "hotel-long-stay",
    "長期滞在・生活案内",
    "洗濯・買い物・清掃ルールなど、連泊・長期宿泊者向けの生活情報ページです。",
    "business",
    ordered([
      block("welcome", welcome("長期滞在のご案内", "生活に必要な情報をまとめました。")),
      block("laundry", laundry("6:00-24:00", "洗濯300円 / 乾燥100円", "フロント")),
      block(
        "nearby",
        nearby("生活インフラ", [
          { name: "スーパー", description: "徒歩4分 / 24時まで" },
          { name: "ドラッグストア", description: "徒歩6分" },
          { name: "コインランドリー", description: "徒歩3分" },
        ]),
      ),
      block("schedule", schedule("清掃・交換", [
        { day: "客室清掃", time: "10:00-14:00", label: "平日のみ" },
        { day: "タオル交換", time: "随時", label: "フロントにて" },
      ])),
      block("notice", notice("ゴミの分別", "可燃・不燃・資源ごとに分別をお願いします。")),
      block("faq", faq("長期滞在FAQ", [
        { q: "宅配便は受け取れますか？", a: "フロントでお預かりします。事前にご連絡ください。" },
      ])),
    ]),
  ),
  hotelTemplate(
    "hotel-spa-wellness",
    "スパ・ウェルネス案内",
    "温泉・施術メニュー・営業時間を中心にした、癒し訴求のページ型です。",
    "resort",
    ordered([
      block("hero", hero("スパ・ウェルネス", "ごゆっくりおくつろぎください")),
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
      block("highlight", highlight("ご利用のお願い", "タトゥー・刺青のある方のご利用はお断りする場合があります。", "amber")),
    ]),
  ),
  hotelTemplate(
    "hotel-family-stay",
    "ファミリー滞在",
    "子連れ向けの注意・周辺スポット・館内ルールをまとめた家族滞在ページです。",
    "resort",
    ordered([
      block("hero", hero("ファミリーでご滞在", "お子様連れでも安心のご案内")),
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
      block("faq", faq("ファミリーFAQ", [
        { q: "ベビーベッドは借りられますか？", a: "数に限りがあります。事前予約をおすすめします。" },
      ])),
    ]),
  ),
  hotelTemplate(
    "hotel-ryokan-onsen-etiquette",
    "旅館・温泉マナー",
    "温泉の手順とお願いをまとめた、作法型のページです。",
    "ryokan",
    ordered([
      block("hero", hero("温泉のご案内", "ご入浴前に一度ご確認ください")),
      block("heading_body", headingBody("ご利用の流れ", "落ち着いてご入浴いただけるように、ポイントをまとめました")),
      block("spa", spa("温泉・大浴場", "6:00-23:00", "本館2F", "源泉かけ流し。タオルは客室からお持ちください")),
      block(
        "steps",
        steps("入浴のステップ", [
          { title: "1. 身支度", description: "脱衣所で身支度をします" },
          { title: "2. 入浴", description: "湯温に合わせてゆっくりご入浴ください" },
          { title: "3. 休憩", description: "水分補給をして体を休めてください" },
        ]),
      ),
      block(
        "pageLinks",
        pageLinks(
          "関連ページ",
          [
            { label: "温泉", icon: "spa" },
            { label: "お食事", icon: "utensils" },
            { label: "お願い", icon: "notice" },
            { label: "FAQ", icon: "info" },
          ],
          2,
        ),
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
  hotelTemplate(
    "hotel-airbnb-house-guide",
    "民泊・ハウスガイド",
    "鍵・Wi-Fi・ご利用前チェックなどを1ページで確認できます。",
    "airbnb",
    ordered([
      block("hero", hero("ハウスガイド", "初めての方も迷わないようにまとめました")),
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
          2,
        ),
      ),
      block("contact_hub", contactHub("困ったときは", "鍵・設備の不具合や迷ったときはご連絡ください。", "03-1234-5678")),
    ]),
  ),
  hotelTemplate(
    "hotel-inbound-arrival-support",
    "インバウンド・到着サポート",
    "英語で確認できる到着導線と緊急連絡先をまとめたページです。",
    "inbound",
    ordered([
      block("hero", hero("Arrival Support / ようこそ", "Essential information in one page")),
      block("wifi", wifi("Global-Guest", "welcome2026", "Available in rooms and lobby. Good for translation apps.", "Wi-Fi")),
      block("notice", notice("Quiet Hours", "No smoking in rooms. Quiet hours after 22:00.", "info")),
      block(
        "faq_search",
        faqSearch("Guest FAQ", [
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
          2,
        ),
      ),
      block("contact_hub", contactHub("Need help?", "Call front desk for check-in, directions, or emergencies.", "+81-3-1111-2222")),
      block("checkout", checkout("11:00", "Please return your room key to the front desk.", "Check-out")),
    ]),
  ),
];

/** @deprecated Use HOTEL_MARKETPLACE_SEED_TEMPLATES */
export const SEED_PREVIEW_IMAGE_HOTEL = SEED_PREVIEW_IMAGE;
