/**
 * サンプル用画像（Unsplash・日本ロケーション確認済み・URL到達確認済み）
 * 旧形式の photo ID は 404 になるため、スラッグ経由で解決した ID を使用。
 */
const PARAMS = "auto=format&fit=crop&w=1200&q=80";

function u(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.1.0&${PARAMS}`;
}

export const IMG = {
  /** 京都 — 清水寺・桜（Kiyomizu-dera, Kyoto） */
  kyotoCover: u("1761141954476-2921e2e43e99"),
  /** 京都 — 三年坂・八坂の塔（Sannenzaka, Kyoto） */
  kyotoStreet: u("1755457080249-c033f7451fe0"),
  /** 京都 — 竹林（Arashiyama 系・日本） */
  kyotoBamboo: u("1528360983277-13d401cdc186"),

  /** 箱根 — 芦ノ湖・鳥居（Hakone Shrine） */
  hakoneCover: u("1677050205807-b23c51f821b7"),
  /** 草津温泉・湯畑（Gunma, Japan） */
  onsenSteam: u("1764057145780-3ba9929822ba"),
  /** 箱根ロープウェイ（Hakone Ropeway） */
  hakoneRopeway: u("1767334851654-07b879a5f1dd"),

  /** 秋葉原 — アニメ看板（Akihabara, Tokyo） */
  oshiCover: u("1763624578697-21b1e1f0b69d"),
  /** 秋葉原 — 商店街（Akihabara, Tokyo） */
  oshiStreet: u("1754221200753-793d65a058ac"),
  /** 東京 — ゲームセンター（GiGO 等） */
  oshiMerch: u("1743297195403-8a64bfb34c3c"),

  /** 渋谷 WOMB ライブ（Shibuya, Tokyo） */
  liveCover: u("1578097986129-799e0883a1d6"),
  /** 渋谷スクランブル交差点・夜（Shibuya, Tokyo） */
  liveShibuya: u("1764418658791-771bb04efdcd"),

  /** 浴衣・夏祭り（Shibuya, Tokyo） */
  festivalYukata: u("1770005065500-1f15948384f8"),
  /** 横浜花火（Yokohama Sparkling Twilight） */
  fireworksYokohama: u("1723242015566-833f95244d67"),

  /** 道頓堀ネオン（Osaka） */
  osakaDotonbori: u("1759746334715-fae30ec56600"),
  /** 日本のベーカリー・カフェ外観 */
  cafeJapan: u("1761210719332-de8022048f0a"),

  /** 築地・魚市場（Tsukiji, Tokyo） */
  marketTsukiji: u("1681269303147-aabdd7c74d47"),
  /** 懐石・会席（Sumida River, Tokyo） */
  kaisekiTokyo: u("1766582931800-fd79665257fa"),
  /** 寿司・刺身（Kyoto） */
  sushiKyoto: u("1763093226729-b412ad2f309d"),

  /** 和室・畳（Tokyo） */
  hotelTatami: u("1764445274404-f2e14fd3f20c"),
  /** 和室・庭園（Nara） */
  hotelGarden: u("1759310706740-e486ec5622c9"),

  /** 露天風呂（Kumamoto, Japan） */
  saunaOutdoor: u("1733653024328-9d3f37fdfb73"),

  /** 沖縄・恩納 ザネービーチ */
  okinawaBeachCover: u("1754228781615-cc3d79670b0e"),
  /** 沖縄・久米島の砂浜 */
  okinawaBeach: u("1676955201630-109c375d437b"),
} as const;
