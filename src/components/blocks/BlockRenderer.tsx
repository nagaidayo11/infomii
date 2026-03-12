import type { ModularBlockData } from "./types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import { IconBlock } from "./IconBlock";
import { DividerBlock } from "./DividerBlock";
import { MapBlock } from "./MapBlock";

export type BlockRendererProps = {
  /** JSON-shaped block (type + payload) */
  block: ModularBlockData;
  /** Wrapper class for the root element */
  className?: string;
  /** Passed to ImageBlock */
  hideImageWhenEmpty?: boolean;
};

/**
 * Dynamically renders the correct block component from JSON data.
 *
 * @example
 * <BlockRenderer block={{ type: "text", content: "館内案内" }} />
 */
export function BlockRenderer({
  block,
  className = "",
  hideImageWhenEmpty = true,
}: BlockRendererProps) {
  const key = block.id ?? block.type;

  switch (block.type) {
    case "text":
      return (
        <div key={key} className={className || undefined}>
          <TextBlock data={block} />
        </div>
      );
    case "image":
      return (
        <div key={key} className={className || undefined}>
          <ImageBlock data={block} hideWhenEmpty={hideImageWhenEmpty} />
        </div>
      );
    case "button":
      return (
        <div key={key} className={className || undefined}>
          <ButtonBlock data={block} />
        </div>
      );
    case "icon":
      return (
        <div key={key} className={className || undefined}>
          <IconBlock data={block} />
        </div>
      );
    case "divider":
      return (
        <div key={key} className={className || undefined}>
          <DividerBlock data={block} />
        </div>
      );
    case "map":
      return (
        <div key={key} className={className || undefined}>
          <MapBlock data={block} />
        </div>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
