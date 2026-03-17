"use client";

import type { SaasBlock } from "../types";
import { SaasTextBlock } from "./SaasTextBlock";
import { SaasImageBlock } from "./SaasImageBlock";
import { SaasButtonBlock } from "./SaasButtonBlock";
import { SaasVideoBlock } from "./SaasVideoBlock";
import { SaasMapBlock } from "./SaasMapBlock";
import { SaasMenuBlock } from "./SaasMenuBlock";

export function SaasBlockRenderer({ block }: { block: SaasBlock }) {
  switch (block.type) {
    case "text":
      return <SaasTextBlock block={block} />;
    case "image":
      return <SaasImageBlock block={block} />;
    case "button":
      return <SaasButtonBlock block={block} />;
    case "video":
      return <SaasVideoBlock block={block} />;
    case "map":
      return <SaasMapBlock block={block} />;
    case "menu":
      return <SaasMenuBlock block={block} />;
    default:
      return <SaasTextBlock block={block} />;
  }
}
