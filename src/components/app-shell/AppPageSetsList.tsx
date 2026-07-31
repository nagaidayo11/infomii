"use client";

import { flattenPageConnectionTree, type PageConnectionSet, type PageRow } from "@/lib/storage";
import { AppWorksList, AppWorksListItemMotion } from "./AppWorksList";
import { AppWorksListItem } from "./AppWorksListItem";

type AppPageSetsListProps = {
  sets: PageConnectionSet[];
  infoBySlug: Map<string, { status?: string; updatedAt?: string }>;
  togglingId?: string | null;
  deletingId?: string | null;
  canEdit?: boolean;
  onTogglePublish?: (id: string, nextStatus: "draft" | "published") => void;
  onDelete?: (page: PageRow) => void;
  showPublishSwitch?: boolean;
  motionStartIndex?: number;
};

function renderPageItem(
  page: PageRow,
  index: number,
  props: Omit<AppPageSetsListProps, "sets" | "motionStartIndex">,
  opts?: { depth?: number; isRoot?: boolean },
) {
  const info = props.infoBySlug.get(page.slug);
  const depth = opts?.depth ?? 0;
  const titlePrefix = depth > 0 ? `${"　".repeat(Math.min(depth, 4))}└ ` : "";
  const titleSuffix = opts?.isRoot ? "（ルート）" : "";
  return (
    <AppWorksListItemMotion key={page.id} index={index}>
      <AppWorksListItem
        id={page.id}
        title={`${titlePrefix}${page.title || "(無題)"}${titleSuffix}`}
        slug={page.slug}
        kind={page.kind === "stamp" ? "stamp" : "guide"}
        status={info?.status === "published" ? "published" : "draft"}
        updatedAt={info?.updatedAt ?? new Date().toISOString()}
        showPublishSwitch={props.showPublishSwitch ?? true}
        publishToggling={props.togglingId === page.id}
        deleting={props.deletingId === page.id}
        onTogglePublish={props.canEdit ? props.onTogglePublish : undefined}
        onDelete={props.canEdit && props.onDelete ? () => props.onDelete?.(page) : undefined}
        previewCards={page.previewCards}
      />
    </AppWorksListItemMotion>
  );
}

/** Renders pages as separate cards, or grouped when linked via pageLinks nodes. */
export function AppPageSetsList({
  sets,
  motionStartIndex = 0,
  ...itemProps
}: AppPageSetsListProps) {
  const getMotionOffset = (setIndex: number) =>
    motionStartIndex +
    sets.slice(0, setIndex).reduce((acc, set) => {
      if (set.mode === "linked") return acc + flattenPageConnectionTree(set).length;
      return acc + set.pages.length;
    }, 0);

  return (
    <div className="app-page-sets">
      {sets.map((set, setIndex) => {
        const motionOffset = getMotionOffset(setIndex);
        if (set.mode === "linked") {
          const rows = flattenPageConnectionTree(set);
          const group = (
            <div key={set.id} className="app-page-set app-page-set--linked app-reveal">
              <div className="app-page-set-header">
                <p className="app-page-set-title">{set.name}</p>
                <span className="app-page-set-badge">連携ページ</span>
              </div>
              <AppWorksList variant="grouped">
                {rows.map((row, rowIndex) =>
                  renderPageItem(row.page, motionOffset + rowIndex, itemProps, {
                    depth: row.depth,
                    isRoot: row.isRoot,
                  }),
                )}
              </AppWorksList>
            </div>
          );
          return group;
        }

        return set.pages.map((page, pageIndex) => (
          <div key={page.id} className="app-page-set app-page-set--single">
            {renderPageItem(page, motionOffset + pageIndex, itemProps)}
          </div>
        ));
      })}
    </div>
  );
}
