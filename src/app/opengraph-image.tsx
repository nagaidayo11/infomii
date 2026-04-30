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
          justifyContent: "center",
          alignItems: "center",
          padding: "56px",
          background:
            "linear-gradient(135deg, #022c22 0%, #065f46 35%, #10b981 100%)",
          color: "white",
          fontFamily: "Noto Sans JP, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "920px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 34, letterSpacing: 0.6, opacity: 0.95, fontWeight: 700 }}>Infomii</div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>ホテル案内ページを</span>
            <span>最短3分で公開</span>
          </div>
          <div style={{ fontSize: 28, opacity: 0.95 }}>
            1画面編集で即時更新 / QR運用対応
          </div>
          <div style={{ fontSize: 22, opacity: 0.9 }}>Free ¥0 / Pro ¥1,980</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
