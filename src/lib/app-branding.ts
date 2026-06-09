/** App shell の訴求コピー（旅のインフォメーション）。Web LP の「しおり」訴求とは切り分ける。 */

export const APP_BRAND_TAGLINE = "旅のインフォメーション";

export const APP_BRAND_SUBLINE = "あなただけの案内を、つくってシェア";

/** 下部タブ（/dashboard/pages）のラベル */
export const APP_PAGES_TAB_LABEL = "ページ";

export function buildAppSharePageLabel(pageTitle: string): string {
  const title = pageTitle.trim() || "Infomii";
  return `${title}のインフォメーション`;
}

export function buildAppPublishShareMessage(pageTitle: string, publicUrl: string): string {
  return `${buildAppSharePageLabel(pageTitle)}\n${publicUrl}`;
}
