"use client";

import type { SaasBlock } from "../types";
import { SaasHeroBlock } from "./SaasHeroBlock";
import { SaasHighlightBlock } from "./SaasHighlightBlock";
import { SaasInfoBlock } from "./SaasInfoBlock";
import { SaasTextBlock } from "./SaasTextBlock";
import { SaasImageBlock } from "./SaasImageBlock";
import { SaasButtonBlock } from "./SaasButtonBlock";
import { SaasMapBlock } from "./SaasMapBlock";
import { SaasGalleryBlock } from "./SaasGalleryBlock";
import { SaasNoticeBlock } from "./SaasNoticeBlock";
import { SaasCouponBlock } from "./SaasCouponBlock";
import { SaasQrBlock } from "./SaasQrBlock";

export function SaasBlockRenderer({ block }: { block: SaasBlock }) {
  switch (block.type) {
    case "hero":
      return <SaasHeroBlock block={block} />;
    case "highlight":
      return <SaasHighlightBlock block={block} />;
    case "info":
      return <SaasInfoBlock block={block} />;
    case "text":
      return <SaasTextBlock block={block} />;
    case "image":
      return <SaasImageBlock block={block} />;
    case "button":
      return <SaasButtonBlock block={block} />;
    case "map":
      return <SaasMapBlock block={block} />;
    case "gallery":
      return <SaasGalleryBlock block={block} />;
    case "notice":
      return <SaasNoticeBlock block={block} />;
    case "coupon":
      return <SaasCouponBlock block={block} />;
    case "qr":
      return <SaasQrBlock block={block} />;
    default:
      return <SaasTextBlock block={block} />;
  }
}
