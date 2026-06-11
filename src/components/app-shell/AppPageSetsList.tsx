"use client";

import type { PageConnectionSet, PageRow } from "@/lib/storage";
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
) {
  const info = props.infoBySlug.get(page.slug);
  return (
    <AppWorksListItemMotion key={page.id} index={index}>
      <AppWorksListItem
        id={page.id}
        title={page.title}
        slug={page.slug}
        status={info?.status === "published" ? "published" : "draft"}
        updatedAt={info?.updatedAt ?? new Date().toISOString()}
        showPublishSwitch={props.showPublishSwitch ?? true}
        publishToggling={props.togglingId === page.id}
        deleting={props.deletingId === page.id}
        onTogglePublish={props.canEdit ? props.onTogglePublish : undefined}
        onDelete={props.canEdit && props.onDelete ? () => props.onDelete?.(page) : undefined}
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
  let motionIndex = motionStartIndex;

  return (
    <div className="app-page-sets">
      {sets.map((set) => {
        if (set.mode === "linked") {
          const group = (
            <div key={set.id} className="app-page-set app-page-set--linked app-reveal">
              <div className="app-page-set-header">
                <p className="app-page-set-title">{set.name}</p>
                <span className="app-page-set-badge">ページ連携</span>
              </div>
              <AppWorksList variant="grouped">
                {set.pages.map((page) => {
                  const node = renderPageItem(page, motionIndex, itemProps);
                  motionIndex += 1;
                  return node;
                })}
              </AppWorksList>
            </div>
          );
          return group;
        }

        return set.pages.map((page) => {
          const card = renderPageItem(page, motionIndex, itemProps);
          motionIndex += 1;
          return <div key={page.id} className="app-page-set app-page-set--single">{card}</div>;
        });
      })}
    </div>
  );
}
