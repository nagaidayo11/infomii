import { ImageResponse } from "next/og";

export const alt = "Infomii | ホテル案内ページ作成SaaS";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "linear-gradient(135deg, #022c22 0%, #065f46 35%, #10b981 100%)",
          color: "white",
          fontFamily: "Noto Sans JP, sans-serif",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 2, opacity: 0.9 }}>INFOMII</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
            ホテル案内ページを
            <br />
            最短3分で公開
          </div>
          <div style={{ fontSize: 30, opacity: 0.95 }}>
            1画面編集で即時更新 / QR運用対応
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.9 }}>Free ¥0 / Pro ¥1,980</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
