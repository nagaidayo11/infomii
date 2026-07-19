import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const alt = "Infomii Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = { params: Promise<{ slug: string }> };

/** Per-post OG image with the article title for higher social CTR. */
export default async function BlogPostOgImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title?.trim() || "ホテル運営に効くQR案内ノウハウ";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #022c22 0%, #065f46 40%, #10b981 100%)",
          color: "white",
          fontFamily: "Noto Sans JP, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, opacity: 0.95 }}>
          <span>Infomii</span>
          <span style={{ fontSize: 24, fontWeight: 500, opacity: 0.85 }}>Blog</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 40 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.92 }}>
          ホテル・宿泊施設のQR館内案内ノウハウ
        </div>
      </div>
    ),
    { ...size },
  );
}
