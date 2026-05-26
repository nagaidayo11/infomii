import { HERO_PERSONAL_TEMPLATE_PREVIEWS, LP_FAQ } from "@/lib/lp/data";
import { LP_PLANS, LP_TRUST_POINTS } from "@/lib/lp/plans";

export { LP_PLANS as PERSONAL_PLANS, LP_TRUST_POINTS as PERSONAL_LP_TRUST_POINTS };

export const PERSONAL_LP_PAIN_POINTS = [
  {
    title: "リンクがバラバラ",
    body: "予定・地図・予約URLがDMやメモに散らばり、探すたびに迷子になります。",
  },
  {
    title: "更新のたびに送り直し",
    body: "時間変更や会場変更のたびに、同じ人へまた説明し直す手間が続きます。",
  },
  {
    title: "見づらい共有",
    body: "長文メッセージやスクショだと、当日に必要な情報がすぐ見つかりません。",
  },
] as const;

export const PERSONAL_LP_BENEFITS = [
  {
    title: "URLひとつで共有",
    body: "旅行・推し活・イベントの情報を1ページに。送る先はリンクだけ。",
  },
  {
    title: "変更をすぐ反映",
    body: "集合時間や会場を編集して公開。古い情報を渡し続ける心配が減ります。",
  },
  {
    title: "アプリ不要で届く",
    body: "相手はブラウザで開くだけ。インストールのハードルがありません。",
  },
  {
    title: "QRでも配れる",
    body: "会場掲示や印刷物から開ける。対面での案内もシンプルに。",
  },
  {
    title: "SNSプロフィールに1リンク",
    body: "推し活・カフェ巡りなど、プロフィールからまとめて誘導できます。",
  },
  {
    title: "スマホで読みやすい",
    body: "予定・MAP・ボタンリンクを、縦スクロールで自然に閲覧できます。",
  },
] as const;

export const PERSONAL_LP_WORKFLOW_STEPS = [
  {
    step: "1",
    title: "テンプレを選ぶ",
    desc: "旅行・推し活・イベントなど、用途に合った土台から。",
  },
  {
    step: "2",
    title: "編集して確認",
    desc: "予定・リンク・MAPを足して、スマホ表示をその場で確認。",
  },
  {
    step: "3",
    title: "共有する",
    desc: "URL・QR・SNSで届ける。ホテル案内の運用にもつながります。",
  },
] as const;

export const PERSONAL_LP_SHARING = [
  { place: "LINE / DM", detail: "URLひとつで予定とリンクを渡す" },
  { place: "Instagram", detail: "プロフィールに1リンクを置く" },
  { place: "イベント会場", detail: "QR掲示で当日案内を統一" },
  { place: "旅行のしおり", detail: "日程・MAP・持ち物をまとめて" },
] as const;

export const PERSONAL_LP_SCENES = [
  "旅行しおり",
  "推し活・ライブ遠征",
  "イベント・同人",
  "デート・おでかけ",
  "カフェ巡り",
] as const;

export const PERSONAL_LP_BEFORE_AFTER = [
  { before: "予定を長文DMで送り直す", after: "1ページを更新するだけ" },
  { before: "リンクがメモアプリに散在", after: "ボタンとMAPで整理" },
  { before: "当日に情報が見つからない", after: "スマホで縦にたどれる" },
  { before: "ホテル案内は別ツール", after: "同じInfomiiで宿泊施設にも" },
] as const;

export const PERSONAL_LP_FAQ = LP_FAQ;

export const PERSONAL_HERO_TEMPLATES = HERO_PERSONAL_TEMPLATE_PREVIEWS;
