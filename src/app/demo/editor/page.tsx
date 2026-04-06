"use client";

import { useSearchParams } from "next/navigation";
import { Editor2 } from "@/components/editor";

export default function DemoEditorPage() {
  const searchParams = useSearchParams();
  const lpPreview = searchParams.get("lp") === "1";

  return (
    <div data-lp-editor-preview={lpPreview ? "1" : "0"} className="h-full w-full">
      <Editor2 mode="demo" demoPreviewUrl="/p/demo-hub-menu" startUnselected={lpPreview} />
      {lpPreview && (
        <style jsx global>{`
          [data-lp-editor-preview="1"] [data-editor-topbar] button,
          [data-lp-editor-preview="1"] [data-editor-topbar] a {
            pointer-events: none !important;
            opacity: 0.72;
          }
          [data-lp-editor-preview="1"] [data-editor-column="library"] button,
          [data-lp-editor-preview="1"] [data-editor-column="library"] a,
          [data-lp-editor-preview="1"] [data-editor-column="library"] input,
          [data-lp-editor-preview="1"] [data-editor-column="library"] textarea,
          [data-lp-editor-preview="1"] [data-editor-column="library"] select,
          [data-lp-editor-preview="1"] [data-editor-column="library"] [role="button"],
          [data-lp-editor-preview="1"] [data-editor-column="settings"] button,
          [data-lp-editor-preview="1"] [data-editor-column="settings"] a,
          [data-lp-editor-preview="1"] [data-editor-column="settings"] input,
          [data-lp-editor-preview="1"] [data-editor-column="settings"] textarea,
          [data-lp-editor-preview="1"] [data-editor-column="settings"] select,
          [data-lp-editor-preview="1"] [data-editor-column="settings"] [role="button"],
          [data-lp-editor-preview="1"] [data-editor-column="settings"] [contenteditable="true"] {
            pointer-events: none !important;
          }
          [data-lp-editor-preview="1"] [data-editor-column="canvas"] [data-card-id],
          [data-lp-editor-preview="1"] [data-editor-column="canvas"] [contenteditable="true"] {
            pointer-events: none !important;
          }
        `}</style>
      )}
    </div>
  );
}
