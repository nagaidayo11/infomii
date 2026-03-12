"use client";

import { Editor } from "@/components/page-editor";

/**
 * インフォミー視覚エディタ（Notion風）
 * ホテル現場スタッフ向け。ブロックは JSON で保存可能（toJSON / loadJSON）。
 */
export default function PageBuilderPage() {
  return <Editor />;
}
