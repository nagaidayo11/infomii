import type { CardType } from "@/components/editor/types";
import type { DeskTone } from "@/components/cards/desk-tone";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

export type FacilityFieldDef = {
  key: string;
  /** Locale → item heading shown above the value. */
  label: { ja: string; en: string; zh: string; ko: string };
  placeholder?: string;
  multiline?: boolean;
  /** Guest view: wrap value in tel: when it looks like a phone number. */
  tel?: boolean;
  /**
   * Soft fields (備考など): when show_* is unset, hide if empty.
   * Core fields: when show_* is unset, show by default.
   */
  optional?: boolean;
};

export type FacilityInfoPreset = {
  type: CardType;
  tone: DeskTone;
  titlePlaceholder: { ja: string; en: string; zh: string; ko: string };
  fields: FacilityFieldDef[];
};

function L(ja: string, en: string, zh: string, ko: string) {
  return { ja, en, zh, ko };
}

/** Facility / guide cards that share the label-row desk layout. */
export const FACILITY_INFO_PRESETS: FacilityInfoPreset[] = [
  {
    type: "wifi",
    tone: "slate",
    titlePlaceholder: L("Wi-Fi案内", "Wi-Fi", "Wi-Fi", "Wi-Fi 안내"),
    fields: [
      { key: "ssid", label: L("ネットワーク名", "Network", "网络名称", "네트워크"), placeholder: "Hotel-Guest" },
      { key: "password", label: L("パスワード", "Password", "密码", "비밀번호"), placeholder: "welcome2024" },
      {
        key: "description",
        label: L("補足", "Note", "备注", "비고"),
        placeholder: "客室・ロビーでご利用いただけます",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    type: "taxi",
    tone: "slate",
    titlePlaceholder: L("タクシー", "Taxi", "出租车", "택시"),
    fields: [
      { key: "companyName", label: L("会社名", "Company", "公司", "회사명"), placeholder: "駅前タクシー" },
      { key: "phone", label: L("電話", "Phone", "电话", "전화"), placeholder: "03-1234-5678", tel: true },
      {
        key: "note",
        label: L("備考", "Note", "备注", "비고"),
        placeholder: "フロントで手配できます",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    type: "laundry",
    tone: "slate",
    titlePlaceholder: L("ランドリー", "Laundry", "洗衣房", "세탁실"),
    fields: [
      { key: "hours", label: L("時間", "Hours", "时间", "시간"), placeholder: "6:00–24:00" },
      { key: "priceNote", label: L("料金", "Price", "费用", "요금"), placeholder: "洗濯 300円 / 乾燥 100円" },
      { key: "contact", label: L("連絡先", "Contact", "联系方式", "연락처"), placeholder: "内線9", tel: true },
    ],
  },
  {
    type: "parking",
    tone: "slate",
    titlePlaceholder: L("駐車場", "Parking", "停车场", "주차장"),
    fields: [
      { key: "capacity", label: L("台数", "Capacity", "车位数", "수용 대수"), placeholder: "50台" },
      { key: "fee", label: L("料金", "Fee", "费用", "요금"), placeholder: "宿泊者無料" },
      { key: "address", label: L("場所", "Location", "地点", "위치"), placeholder: "ホテル敷地内" },
      {
        key: "note",
        label: L("備考", "Note", "备注", "비고"),
        placeholder: "満車時はフロントへ",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    type: "breakfast",
    tone: "amber",
    titlePlaceholder: L("朝食", "Breakfast", "早餐", "조식"),
    fields: [
      { key: "time", label: L("時間", "Hours", "时间", "시간"), placeholder: "6:30–9:30" },
      { key: "location", label: L("会場", "Venue", "地点", "장소"), placeholder: "1F レストラン" },
      {
        key: "menu",
        label: L("メニュー", "Menu", "菜单", "메뉴"),
        placeholder: "和洋ビュッフェ",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    type: "spa",
    tone: "sky",
    titlePlaceholder: L("スパ・温泉", "Spa / Onsen", "SPA / 温泉", "스파 · 온천"),
    fields: [
      { key: "hours", label: L("時間", "Hours", "时间", "시간"), placeholder: "15:00–24:00 / 6:00–10:00" },
      { key: "location", label: L("場所", "Floor", "地点", "장소"), placeholder: "2F" },
      {
        key: "description",
        label: L("ご案内", "Details", "说明", "안내"),
        placeholder: "タオルは客室からご持参ください",
        multiline: true,
        optional: true,
      },
      {
        key: "note",
        label: L("備考", "Note", "备注", "비고"),
        placeholder: "補足があれば入力",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    type: "restaurant",
    tone: "amber",
    titlePlaceholder: L("レストラン", "Restaurant", "餐厅", "레스토랑"),
    fields: [
      { key: "time", label: L("時間", "Hours", "时间", "시간"), placeholder: "7:00–22:00" },
      { key: "location", label: L("場所", "Location", "地点", "장소"), placeholder: "1F" },
      {
        key: "menu",
        label: L("内容", "Details", "内容", "내용"),
        placeholder: "朝食ビュッフェ / ディナー",
        multiline: true,
        optional: true,
      },
    ],
  },
];

const BY_TYPE = new Map(FACILITY_INFO_PRESETS.map((p) => [p.type, p]));

export function getFacilityInfoPreset(type: string): FacilityInfoPreset | null {
  return BY_TYPE.get(type as CardType) ?? null;
}

export function isFacilityInfoType(type: string): boolean {
  return BY_TYPE.has(type as CardType);
}

/** Default LineIcon token for a facility / label-row type. */
export function facilityDefaultIcon(type: string): string {
  switch (type) {
    case "wifi":
      return "wifi";
    case "taxi":
      return "taxi";
    case "laundry":
      return "laundry";
    case "parking":
      return "parking";
    case "breakfast":
      return "breakfast";
    case "spa":
      return "spa";
    case "restaurant":
      return "restaurant";
    case "checkout":
      return "checkout";
    case "nearby":
      return "nearby";
    default:
      return "info";
  }
}

export function facilityFieldLabel(field: FacilityFieldDef, locale: string): string {
  if (locale === "en") return field.label.en;
  if (locale === "zh") return field.label.zh;
  if (locale === "ko") return field.label.ko;
  return field.label.ja;
}

export function facilityTitlePlaceholder(preset: FacilityInfoPreset, locale: string): string {
  if (locale === "en") return preset.titlePlaceholder.en;
  if (locale === "zh") return preset.titlePlaceholder.zh;
  if (locale === "ko") return preset.titlePlaceholder.ko;
  return preset.titlePlaceholder.ja;
}

export function optionalFieldFlagKey(fieldKey: string): string {
  return `show_${fieldKey}`;
}

export function readFacilityFieldValue(
  content: Record<string, unknown> | undefined,
  key: string,
  locale = "ja",
): string {
  if (!content) return "";
  const localized = getLocalizedContent(content[key] as LocalizedString | undefined, locale).trim();
  if (localized) return localized;
  if (typeof content[key] === "string") return (content[key] as string).trim();
  if (key === "hours" && content.time != null) return readFacilityFieldValue(content, "time", locale);
  if (key === "description" && content.menu != null) return readFacilityFieldValue(content, "menu", locale);
  if (key === "address" && content.location != null) return readFacilityFieldValue(content, "location", locale);
  return "";
}

/**
 * Per-label visibility. Explicit show_<key> wins.
 * Core fields default on; soft/optional fields default on only when they have text.
 */
export function isFacilityFieldVisible(
  content: Record<string, unknown> | undefined,
  field: FacilityFieldDef,
  locale = "ja",
): boolean {
  const flag = content?.[optionalFieldFlagKey(field.key)];
  if (typeof flag === "boolean") return flag;
  if (field.optional) return readFacilityFieldValue(content, field.key, locale).length > 0;
  return true;
}

/** @deprecated Use isFacilityFieldVisible */
export function isFacilityOptionalFieldVisible(
  content: Record<string, unknown> | undefined,
  field: FacilityFieldDef,
  locale = "ja",
): boolean {
  return isFacilityFieldVisible(content, field, locale);
}

function withShowFlags(
  base: Record<string, unknown>,
  type: CardType,
): Record<string, unknown> {
  const preset = getFacilityInfoPreset(type);
  if (!preset) return base;
  const next = { ...base };
  for (const field of preset.fields) {
    const flagKey = optionalFieldFlagKey(field.key);
    if (typeof next[flagKey] === "boolean") continue;
    if (field.optional) {
      next[flagKey] = readFacilityFieldValue(next, field.key, "ja").length > 0;
    } else {
      next[flagKey] = true;
    }
  }
  return next;
}

/** Publish-ready starter copy for facility presets (edit hotel-specific details later). */
export function defaultFacilityContent(type: CardType): Record<string, unknown> | null {
  switch (type) {
    case "wifi":
      return withShowFlags(
        {
          title: "Wi-Fi案内",
          ssid: "Hotel-Guest",
          password: "welcome2024",
          description: "客室・ロビーでご利用いただけます。つながらない場合はフロント内線9へお問い合わせください。",
          show_description: false,
        },
        type,
      );
    case "taxi":
      return withShowFlags(
        {
          title: "タクシー",
          companyName: "駅前タクシー",
          phone: "03-1234-5678",
          note: "フロントで手配できます。早朝・深夜は混み合うことがあります。",
          show_note: true,
        },
        type,
      );
    case "laundry":
      return withShowFlags(
        {
          title: "ランドリー",
          hours: "6:00–24:00",
          priceNote: "洗濯 300円 / 乾燥 100円（30分）",
          contact: "内線9",
        },
        type,
      );
    case "parking":
      return withShowFlags(
        {
          title: "駐車場",
          capacity: "50台",
          fee: "宿泊者無料（先着）",
          address: "ホテル敷地内",
          note: "満車の場合はフロントまでお声がけください。",
          show_note: true,
        },
        type,
      );
    case "breakfast":
      return withShowFlags(
        {
          title: "朝食",
          time: "6:30–9:30（最終入場 9:00）",
          location: "1F レストラン",
          menu: "和洋ビュッフェ",
          show_menu: true,
        },
        type,
      );
    case "spa":
      return withShowFlags(
        {
          title: "大浴場",
          hours: "15:00–24:00 / 6:00–10:00",
          location: "2F",
          description: "タオルは客室からご持参ください。",
          note: "",
          show_description: true,
          show_note: false,
        },
        type,
      );
    case "restaurant":
      return withShowFlags(
        {
          title: "レストラン",
          time: "7:00–22:00（LO 21:30）",
          location: "1F",
          menu: "朝食ビュッフェ / ディナーコース",
          show_menu: true,
        },
        type,
      );
    default:
      return null;
  }
}

/** @deprecated Use defaultFacilityContent */
export function emptyFacilityContent(type: CardType): Record<string, unknown> | null {
  return defaultFacilityContent(type);
}

/** Build unified `info` card content from a facility preset (for library presets). */
export function infoContentFromFacilityPreset(type: CardType): Record<string, unknown> | null {
  const preset = getFacilityInfoPreset(type);
  const defaults = defaultFacilityContent(type);
  if (!preset || !defaults) return null;
  const rows = preset.fields.map((field) => ({
    key: field.key,
    label: field.label.ja,
    value: readFacilityFieldValue(defaults, field.key, "ja"),
    show: isFacilityFieldVisible(defaults, field, "ja"),
    tel: Boolean(field.tel),
  }));
  return {
    title: typeof defaults.title === "string" ? defaults.title : "",
    tone: preset.tone,
    icon: facilityDefaultIcon(type),
    sourcePreset: type,
    rows,
  };
}

export type LabelRowLibraryPreset = {
  id: string;
  label: string;
  description: string;
  /** Facility key used to seed `info` content. */
  seedFrom: CardType;
};

/** Single layout (`info`) + these presets in the library. */
export const LABEL_ROW_LIBRARY_PRESETS: LabelRowLibraryPreset[] = [
  { id: "label-wifi", label: "Wi-Fi", description: "SSID・パスワード", seedFrom: "wifi" },
  { id: "label-taxi", label: "タクシー", description: "会社名・電話・備考", seedFrom: "taxi" },
  { id: "label-laundry", label: "ランドリー", description: "時間・料金・連絡先", seedFrom: "laundry" },
  { id: "label-parking", label: "駐車場", description: "台数・料金・場所", seedFrom: "parking" },
  { id: "label-breakfast", label: "朝食案内", description: "時間・会場・メニュー", seedFrom: "breakfast" },
  { id: "label-spa", label: "スパ・温泉", description: "時間・場所・ご案内", seedFrom: "spa" },
  { id: "label-restaurant", label: "レストラン", description: "時間・場所・内容", seedFrom: "restaurant" },
];

