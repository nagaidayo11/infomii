import type { ModularBlockData } from "./types";
import { BlockRenderer } from "./BlockRenderer";

export type BlocksListProps = {
  /** Array of JSON block objects */
  blocks: ModularBlockData[];
  className?: string;
  itemClassName?: string;
  hideImageWhenEmpty?: boolean;
};

/**
 * Renders a list of blocks from JSON array.
 */
export function BlocksList({
  blocks,
  className = "",
  itemClassName,
  hideImageWhenEmpty,
}: BlocksListProps) {
  return (
    <div className={className || undefined}>
      {blocks.map((block, index) => (
        <BlockRenderer
          key={block.id ?? `${block.type}-${index}`}
          block={block}
          className={itemClassName}
          hideImageWhenEmpty={hideImageWhenEmpty}
        />
      ))}
    </div>
  );
}
