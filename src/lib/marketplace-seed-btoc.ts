import {
  block,
  ordered,
  type MarketplaceSeedCardType,
  type MarketplaceSeedTemplate,
} from "@/lib/marketplace-seed-types";
import {
  hubLinks,
  sectionDivider,
  sectionHeading,
} from "@/lib/marketplace-seed-btoc-layout";
import { btocTemplatePreviewPath } from "@/lib/template-preview";
import type { BtocMarketplaceCategory } from "@/lib/template-marketplace-meta";
import { BTOC_EXPANDED_MARKETPLACE_SEED_TEMPLATES } from "@/lib/marketplace-seed-btoc-expanded";

function pv(category: BtocMarketplaceCategory, slug: string): string {
  return btocTemplatePreviewPath(category, slug);
}

function b(type: MarketplaceSeedCardType, content: Record<string, unknown>) {
  return block(type, content);
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
const pageLinks = (
  title: string,
  items: { label: string; icon: string }[],
  columns: 2 | 3 | 4 = 2,
) => hubLinks(title, items, columns);
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
const socialLinks = (title: string, handle: string) => ({
  title,
  labelStyle: "icon",
  items: [
    { platform: "instagram", label: "Instagram", href: "", handle },
    { platform: "x", label: "X", href: "", handle },
  ],
});
const highlight = (title: string, body: string) => ({ title, body, accent: "amber" });

/** BtoC: 友達に送るトーン。プレビューは public/templates/previews/<category>/<slug>.jpg */
export const BTOC_MARKETPLACE_SEED_TEMPLATES: MarketplaceSeedTemplate[] = [
  {
    slug: "travel-itinerary",
    name: "旅行しおり・基本セット",
    description: "友達と京都2泊3日いくとき用。日程・持ち物・リンクを1ページにまとめる。",
    preview_image: pv("travel", "travel-itinerary"),
    category: "travel",
    cards: ordered([
      b(
        "hero",
        hero("京都、2泊3日", "新幹線・宿・ざっくり予定はここ", pv("travel", "travel-itinerary")),
      ),
      hubLinks("しおりメニュー", [
        { label: "日程", icon: "clock" },
        { label: "持ち物", icon: "checklist" },
        { label: "集合・宿", icon: "map-pin" },
        { label: "リンク", icon: "link" },
      ]),
      sectionHeading("日程", "1日目〜3日目のざっくり予定"),
      b(
        "schedule",
        schedule("いつ何する？", [
          { day: "1日目", time: "08:30", label: "東京発。のぞみ（席はアプリ見て）" },
          { day: "1日目", time: "11:00", label: "京都着。宿は15時から入れる予定" },
          { day: "1日目", time: "19:00", label: "河原町でごはん（店はもう予約済み）" },
          { day: "2日目", time: "10:00〜", label: "嵐山・竹林あたりをのんびり" },
          { day: "3日目", time: "午前", label: "清水寺周り・お土産" },
          { day: "3日目", time: "15:30", label: "京都駅から帰る" },
        ]),
      ),
      sectionDivider(),
      sectionHeading("持ち物・スポット", ""),
      b(
        "checklist",
        checklist("持っていくやつ", [
          "身分証",
          "新幹線と宿の予約スクショ",
          "充電器・バッテリー",
          "歩きやすい靴",
          "傘（折りたたみでOK）",
          "ICカード",
          "現金ちょっと",
          "酔い止めとか普段飲むやつ",
        ]),
      ),
      b("map", map("集合と宿", "京都駅八条口西で合流 / 宿は駅から徒歩8分くらい（住所はLINE見て）")),
      b(
        "nearby",
        nearby("よく行きそうなとこ", [
          { name: "河原町", description: "1日目の夜ごはん。終わったらここで合流しやすい" },
          { name: "嵐山", description: "2日目メイン。トロッコ使うなら早めに並ぶ" },
          { name: "京都駅", description: "荷物預けはコインロッカー（八条口側）" },
        ]),
      ),
      sectionDivider("dotted"),
      sectionHeading("連絡・リンク", "予約画面と天気はここから"),
      pageLinks("リンクまとめ", [
        { label: "新幹線", icon: "train" },
        { label: "宿の予約", icon: "bed" },
        { label: "天気", icon: "map" },
        { label: "乗り換え", icon: "bus" },
      ], 4),
      b(
        "notice",
        notice(
          "遅れたり雨の日",
          "30分以上遅れるならLINE「京都いこ！」に次の集合場所を書いて。雨強い日は外回りやめて駅ビルとか屋内に逃げよう。",
        ),
      ),
      sectionDivider(),
      sectionHeading("聞かれそうなこと", ""),
      b(
        "faq",
        faq("FAQ", [
          {
            q: "お金どうする？",
            a: "新幹線と宿は3人割。食事はだいたい各自で、レシート写真だけLINEに上げといて。帰る前にざっくり精算。",
          },
          {
            q: "荷物預けたい",
            a: "京都駅のロッカーか、宿に聞いて預かってもらえるか確認。帰る日は午後2時までに拾う想定。",
          },
          {
            q: "一人だけ別行動になる",
            a: "次どこで会うかLINEに固定して。連絡つかないときはりん（例）に電話。",
          },
        ]),
      ),
    ]),
  },
  {
    slug: "travel-weekend",
    name: "週末旅行・おでかけセット",
    description: "箱根日帰りを友達に送る用。終電前に新宿に戻るのが今日のゴール。",
    preview_image: pv("travel", "travel-weekend"),
    category: "travel",
    cards: ordered([
      b(
        "welcome",
        welcome(
          "箱根、日帰り",
          "今日のゴールは18:30に新宿にいること。ロマンスカー→温泉街→ランチ→カフェの順。",
        ),
      ),
      b(
        "steps",
        steps("今日の流れ", [
          {
            title: "08:45 新宿",
            description: "南口改札前。09:10のロマンスカー。切符はスマホで見せればOK。",
          },
          {
            title: "10:30 箱根湯本",
            description: "登山電車で強羅方面。風強いとロープウェイ止まるかも（下にプランB）。",
          },
          {
            title: "12:00 ランチ",
            description: "湯葉の店、予約入れてある。遅れそうなら店に電話して。",
          },
          {
            title: "14:30 カフェ",
            description: "強羅のカフェでひと休み。16時までに湯本に戻る。",
          },
          {
            title: "17:20 帰り",
            description: "ロマンスカーで新宿。18:30着が理想。",
          },
        ]),
      ),
      b(
        "schedule",
        schedule("電車の時間だけ", [
          { day: "行き", time: "09:10", label: "新宿→箱根湯本" },
          { day: "帰り", time: "17:20", label: "箱根湯本→新宿" },
          { day: "予備", time: "18:50", label: "ロマンスカー乗れなかったときの特急" },
        ]),
      ),
      b(
        "notice",
        notice(
          "雨と荷物",
          "ロープウェイ止まったら温泉街歩いて、美術館寄るプランに切り替え。荷物はリュック1つが楽。",
        ),
      ),
      b("map", map("最初に会う場所", "新宿駅 南口改札前")),
      pageLinks("予約とか", [
          { label: "ロマンスカー", icon: "link" },
          { label: "ランチの店", icon: "calendar" },
          { label: "箱根フリーパス", icon: "map" },
          { label: "箱根の天気", icon: "map" },
        ]),
      b(
        "faq",
        faq("よく聞かれるやつ", [
          {
            q: "待ち合わせ変えたい",
            a: "出発2時間前までにLINEで。基本は南口のまま、何番出口かだけ共有して。",
          },
          {
            q: "切符忘れた",
            a: "行きはアプリで出せるはず。帰りは窓口（席あるか運次第）。すぐLINEして。",
          },
          {
            q: "電車遅れた",
            a: "ランチの店に電話。帰りがヤバそうなら18:50の特急の話をグループに書いて。",
          },
        ]),
      ),
    ]),
  },
  {
    slug: "travel-group",
    name: "グループ旅行・役割分担セット",
    description: "沖縄3泊を友達5人で。誰が何押さえてるか、LINEにピン留めする用。",
    preview_image: pv("travel", "travel-group"),
    category: "travel",
    cards: ordered([
      b(
        "hero",
        hero("沖縄、3泊5人", "飛行機・車・宿・ごはん・海。リンクは下にまとめた", pv("travel", "travel-group")),
      ),
      b(
        "tabs_info",
        tabsInfo("誰が何やるか", [
          {
            label: "飛行機・車",
            body: "たくまがLCCとレンタカー予約。予約番号はLINEに固定済み。運転は2時間くらいで交代。",
          },
          {
            label: "宿",
            body: "みきが恩納の一棟貸し。鍵コードは着く2時間前にグループに投げる。ゴミどうするか写真もある。",
          },
          {
            label: "ごはん",
            body: "けんたが1泊目の居酒屋と2泊目BBQ。アレルギーある人は店に伝えてある。",
          },
          {
            label: "海",
            body: "ゆいがシュノーケル10時集合。サイズ確認済み。雨なら水族館に変更で話してる。",
          },
          {
            label: "お金",
            body: "あおいがPayPayグループ。共通費はあとで割る。レシートはその日のうちに写真。",
          },
        ]),
      ),
      b(
        "schedule",
        schedule("ざっくり日程", [
          { day: "1日目", time: "12:40", label: "那覇着・レンタカー拾う" },
          { day: "1日目", time: "15:00", label: "宿着・買い出し" },
          { day: "2日目", time: "10:00", label: "シュノーケル" },
          { day: "3日目", time: "終日", label: "北部ドライブ（美ら海・古宇利）" },
          { day: "4日目", time: "10:00", label: "車返して11:30の便" },
        ]),
      ),
      b(
        "checklist",
        checklist("出発前に見といて", [
          "航空券（アプリ）",
          "免許（国際免許いる人だけ）",
          "日焼け止め・水着",
          "酔い止め",
          "現金（店によって現金のみ）",
          "ゴミ袋（宿のルール用）",
        ]),
      ),
      b(
        "contact_hub",
        contactHub(
          "連絡はここ",
          "基本LINE「沖縄5人」。30分以上遅れるなら次どこで会うか書いて。わからないことはけんたに。",
        ),
      ),
      pageLinks("リンク", [
          { label: "航空券", icon: "link" },
          { label: "レンタカー", icon: "calendar" },
          { label: "宿（住所・鍵）", icon: "map" },
          { label: "シュノーケル", icon: "gift" },
          { label: "共通費メモ", icon: "link" },
        ], 2),
      b(
        "faq",
        faq("あるある", [
          {
            q: "役割変わった",
            a: "出発3日前までならグループで相談。当日は前の人がメモ残してから渡して。",
          },
          {
            q: "1人来れなくなった",
            a: "車と宿の割り勘だけ再計算。食事と海はキャンセル、けんたかゆいが店に電話。",
          },
          {
            q: "運転つらい",
            a: "2時間で交代。北部の日は途中30分休憩入れる。",
          },
        ]),
      ),
    ]),
  },
  {
    slug: "oshi-live-set",
    name: "推し活・ライブまとめセット",
    description: "ライブ当日、推し友に送るまとめ。集合・グッズ・帰りの電車まで。",
    preview_image: pv("oshi", "oshi-live-set"),
    category: "oshi",
    cards: ordered([
      b(
        "hero",
        hero("○○ LIVE 東京", "今日の予定。一緒に行く人はこのページ見といて", pv("oshi", "oshi-live-set")),
      ),
      b(
        "schedule",
        schedule("今日の時間", [
          { day: "当日", time: "15:00", label: "会場近く集合（駅から徒歩10分）" },
          { day: "当日", time: "17:00", label: "開場" },
          { day: "当日", time: "18:00", label: "開演" },
          { day: "当日", time: "20:15くらい", label: "終演（アンコあるかも）" },
          { day: "当日", time: "21:00", label: "終演後、西口のデジタル看板前" },
        ]),
      ),
      b(
        "checklist",
        checklist("持ち物", [
          "チケット（紙かチケプラ）",
          "公式ペンライト（グッズルール要確認）",
          "バッテリー",
          "現金（物販用）",
          "身分証（年齢確認あるとき）",
          "喉飴とか任意",
        ]),
      ),
      b(
        "notice",
        notice(
          "公式が言ってること",
          "撮影・再入場は公演ごとに違う。最新は公式X見て。グッズは開場1時間前くらいに並び始める人多い。",
        ),
      ),
      pageLinks("リンク", [
          { label: "チケット", icon: "link" },
          { label: "会場MAP", icon: "map" },
          { label: "グッズ通販", icon: "gift" },
          { label: "公式X", icon: "link" },
        ]),
      b(
        "faq",
        faq("当日あるある", [
          {
            q: "グッズいつ並ぶ？",
            a: "開場90分前ついた人が多い。売り切れたら終演後どうなるか公式見る。",
          },
          {
            q: "はぐれた",
            a: "集合は西口デジタル看板前で決めとく。ライブ中LINEオフにするかも事前に話そう。",
          },
          {
            q: "帰りどうする？",
            a: "最終23:48くらい（例）。乗り遅れたらタクシー割るか、終電後の話をグループで。",
          },
        ]),
      ),
      b("map", map("会場・集合", "東京ドームシティあたり / 集合は水道橋西口")),
    ]),
  },
  {
    slug: "oshi-fan-meet",
    name: "推し活・ファンイベントセット",
    description: "ファンミ・特典会の当日メモ。番号・並び方を友達に共有する用。",
    preview_image: pv("oshi", "oshi-fan-meet"),
    category: "oshi",
    cards: ordered([
      b(
        "welcome",
        welcome(
          "ファンミ、今日",
          "整理番号はアプリ（例: A-042）。遅刻厳しめ。受付は始まる45分前から。",
        ),
      ),
      b(
        "steps",
        steps("だいたいこう動く", [
          {
            title: "10:00 集合",
            description: "イベントスペース前。番号と身分証見せる。",
          },
          {
            title: "10:30 並ぶ",
            description: "A列B列に分かれる。座り込みと通路塞がないで。",
          },
          {
            title: "11:00 中に入る",
            description: "サイン・撮影ブースへ。荷物デカいならロッカー（有料）使う。",
          },
          {
            title: "12:30 出る",
            description: "再入場なし。物販は別の列。",
          },
          {
            title: "13:00 ばらける",
            description: "出口で解散。スタッフに直接話しかけないで。",
          },
        ]),
      ),
      b("social_links", socialLinks("タグ", "#ExampleFanMeet2026")),
      b(
        "notice",
        notice(
          "これだけ守って",
          "無断撮影・録音ダメ。プレゼントと手紙持ち込みなし。撮影は指定ブースだけ、1組30秒くらい。",
        ),
      ),
      b(
        "faq",
        faq("聞かれそう", [
          {
            q: "撮っていい？",
            a: "指定のところだけ。フラッシュ・三脚なし。あと公式に載るかも。",
          },
          {
            q: "サインと持ち物",
            a: "公式グッズ1点だけ。大きい荷物はロッカー。",
          },
          {
            q: "トイレ行きたい",
            a: "入る前に済ませて。再入場ない。",
          },
        ]),
      ),
      pageLinks("公式", [
          { label: "イベント詳細", icon: "link" },
          { label: "番号アプリ", icon: "calendar" },
          { label: "会場MAP", icon: "map" },
        ]),
    ]),
  },
  {
    slug: "oshi-link-hub",
    name: "推し活・リンクハブセット",
    description: "推し関連URLを友達に「これ見て」で送るブックマーク用。",
    preview_image: pv("oshi", "oshi-link-hub"),
    category: "oshi",
    cards: ordered([
      b(
        "hero",
        hero("○○のリンクまとめ", "最新はいつも公式Xが正解。ここはたたき台", pv("oshi", "oshi-link-hub")),
      ),
      b(
        "tabs_info",
        tabsInfo("いつ何見る？", [
          {
            label: "今日",
            body: "公演・配信・発売日は公式Xの固定ポスト。待ち合わせだけ載せるのは非公式って割り切り。",
          },
          {
            label: "遠征・ライブ",
            body: "チケットと会場MAPは公式。電車と宿は各自で。集合場所だけ友達と共有。",
          },
          {
            label: "グッズ",
            body: "通販は公式ショップだけ。再販短いから通知オン推奨。",
          },
        ]),
      ),
      pageLinks("メイン", [
          { label: "公式サイト", icon: "link" },
          { label: "チケット", icon: "calendar" },
          { label: "YouTube", icon: "play" },
          { label: "グッズショップ", icon: "gift" },
          { label: "ファンクラブ", icon: "link" },
          { label: "公式X", icon: "link" },
          { label: "Instagram", icon: "link" },
          { label: "配信アーカイブ", icon: "play" },
        ]),
      b(
        "notice",
        notice(
          "ひとこと",
          "ファンがまとめたページ。日程とルールは公式確認。転売チケ・偽グッズ気をつけて。",
        ),
      ),
      b(
        "faq",
        faq("メモ", [
          { q: "古いかも", a: "公式X優先。ここはたまにしか更新しない。" },
          { q: "他のファン垢載せていい？", a: "公認だけ。荒らし系は載せない。" },
        ]),
      ),
      b("quote", { quote: "リンク一個にまとまってて遠征前楽だった", author: "メモ" }),
    ]),
  },
  {
    slug: "personal-date-plan",
    name: "おでかけ・デートプランセット",
    description: "今日のデートの予定を相手に送る用。渋谷から午後コース。",
    preview_image: pv("personal", "personal-date-plan"),
    category: "personal",
    cards: ordered([
      b(
        "hero",
        hero("今日の予定", "渋谷から。時間と場所は下に書いた", pv("personal", "personal-date-plan")),
      ),
      b(
        "schedule",
        schedule("タイムライン", [
          { day: "12:00", time: "集合", label: "渋谷、ハチ公口" },
          { day: "12:15", time: "ランチ", label: "イタリアン（店名は予約メール見て）" },
          { day: "14:00", time: "散歩", label: "代官山→中目黒（雨なら屋内に変更）" },
          { day: "15:30", time: "カフェ", label: "中目黒のカフェでケーキ" },
          { day: "18:00", time: "夕食", label: "恵比寿のビストロ（予約済み）" },
        ]),
      ),
      b("map", map("最初に会う場所", "渋谷駅ハチ公口")),
      b(
        "notice",
        notice(
          "雨の日",
          "散歩やめてヒカリエとか屋内にする。遅れそうならチャットで一声くれればOK。",
        ),
      ),
      pageLinks("予約と地図", [
          { label: "ランチの予約", icon: "calendar" },
          { label: "カフェの場所", icon: "map" },
          { label: "夕食の予約", icon: "calendar" },
          { label: "天気", icon: "map" },
        ]),
      b(
        "faq",
        faq("聞かれそう", [
          { q: "服どうすればいい？", a: "カジュアルでOK。夕食あるから歩きやすい靴がいい。" },
          { q: "プレゼントいる？", a: "なくていい。もしなら小さめで。" },
          { q: "お会計は？", a: "当日話そう。割り勘でも別々でも。" },
        ]),
      ),
    ]),
  },
  {
    slug: "personal-link-collection",
    name: "リンク集・プロフィールセット",
    description: "自分のリンクを友達・フォロワーに渡す用。名刺みたいに使える。",
    preview_image: pv("personal", "personal-link-collection"),
    category: "personal",
    cards: ordered([
      b(
        "welcome",
        welcome(
          "はじめまして",
          "○○です。イラストとWebいじってます。仕事の相談は下のフォームかメールが見やすい。",
        ),
      ),
      pageLinks("リンク", [
          { label: "作品見る", icon: "link" },
          { label: "Instagram", icon: "link" },
          { label: "ブログ", icon: "link" },
          { label: "空いてる日（カレンダー）", icon: "calendar" },
          { label: "仕事の相談", icon: "mail" },
          { label: "いちばん新しい作", icon: "gift" },
          { label: "小さめショップ", icon: "link" },
        ]),
      b(
        "highlight",
        highlight(
          "仕事の話",
          "ロゴ・1ページ・イラスト1点とか。初回は30分だけ雑談無料。料金はポートフォリオのPrice見て。",
        ),
      ),
      b(
        "notice",
        notice("返信", "DMは見逃しやすい。急ぎとかまとめて話したいのはメールかフォームで。"),
      ),
      b(
        "faq",
        faq("よく聞かれる", [
          { q: "コラボできる？", a: "内容による。詳細はメールで。プレス素材はリンクにあり。" },
          { q: "いくら？", a: "ポートフォリオのPrice。ざっくり見積もりも可。" },
          { q: "DMで依頼していい？", a: "フォーム推奨。DMはたまにしか見ない。" },
        ]),
      ),
      b(
        "contact_hub",
        contactHub(
          "連絡",
          "仕事の話はメールで。パスワードとか個人情報は送らないで。",
          "work@example.com",
        ),
      ),
    ]),
  },
  {
    slug: "personal-event-guide",
    name: "イベント・勉強会案内セット",
    description: "友達が主催する小さな勉強会。参加者に送る案内ページ。",
    preview_image: pv("personal", "personal-event-guide"),
    category: "personal",
    cards: ordered([
      b(
        "hero",
        hero("Next.js 勉強会 #12", "6/14土 14:00-16:30 / 20人まで / 無料", pv("personal", "personal-event-guide")),
      ),
      b(
        "schedule",
        schedule("だいたいの流れ", [
          { day: "13:45", time: "受付", label: "1Fで名前書く。Wi-Fiは会場の案内見て" },
          { day: "14:00", time: "話", label: "App Router と Server Actions（1時間）" },
          { day: "15:00", time: "休憩", label: "10分。質問はチャット" },
          { day: "15:10", time: "手を動かす", label: "ペアでミニTODO（1時間）" },
          { day: "16:10", time: "雑談", label: "振り返りと次回の話" },
        ]),
      ),
      b("map", map("会場", "○○コワーキング 3F（六本木駅から5分）住所は申込メール")),
      b(
        "notice",
        notice(
          "会場で気をつけること",
          "飲み物は蓋つきだけ。写真は最初の5分だけOK。5分前までに受付終わらせて。",
        ),
      ),
      b(
        "faq",
        faq("参加まわり", [
          { q: "お金かかる？", a: "参加無料。あと飲みに行くのは任意で実費。" },
          { q: "何持てばいい？", a: "PC・電源・ブラウザ。初心者OK。" },
          { q: "行けなくなった", a: "前日までに申込フォームからキャンセル。録画なし。" },
        ]),
      ),
      pageLinks("リンク", [
          { label: "申し込み", icon: "calendar" },
          { label: "資料（当日）", icon: "link" },
          { label: "前回のメモ", icon: "play" },
        ]),
      b(
        "contact_hub",
        contactHub(
          "わからないこと",
          "当日のことは受付の人に。それ以外は主催のひろとにLINEかメール。",
          "organizer@example.com",
        ),
      ),
    ]),
  },
  ...BTOC_EXPANDED_MARKETPLACE_SEED_TEMPLATES,
];
