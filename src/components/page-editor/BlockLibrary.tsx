"use client";

import { useDraggable } from "@dnd-kit/core";
import { BLOCK_LIBRARY_ITEMS, type PageBlockType } from "./types";
import { usePageEditorStore } from "./store";

const CARD_ICONS: Record<PageBlockType, React.ReactNode> = {
  text: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  image: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  map: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  button: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  wifi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  schedule: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  menu: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  breakfast: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  checkout: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  notice: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  icon: (
    <span className="text-base">◇</span>
  ),
  divider: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  gallery: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};

function LibraryItem({
  type,
  label,
  description,
}: {
  type: PageBlockType;
  label: string;
  description: string;
}) {
  const addBlock = usePageEditorStore((s) => s.addBlock);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { fromLibrary: true, blockType: type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => addBlock(type)}
      className={
        "flex w-full items-center gap-3 rounded-xl border border-ds-border bg-ds-card px-3 py-2.5 text-left shadow-[var(--shadow-ds-sm)] transition-all duration-200 " +
        (isDragging
          ? "cursor-grabbing opacity-80 ring-2 ring-ds-primary/30"
          : "cursor-grab hover:border-slate-300 hover:shadow-[var(--shadow-ds-md)] active:scale-[0.99]")
      }
      aria-label={`${label}を追加`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {CARD_ICONS[type]}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </div>
    </button>
  );
}

/** 左パネル表示順: Text, Image, WiFi, Breakfast, Checkout, Map, Notice, Button, Schedule */
const MAIN_CARD_TYPES: PageBlockType[] = [
  "text", "image", "wifi", "breakfast", "checkout", "map", "notice", "button", "schedule",
];

export function BlockLibrary() {
  const byOrder = (a: (typeof BLOCK_LIBRARY_ITEMS)[0], b: (typeof BLOCK_LIBRARY_ITEMS)[0]) =>
    MAIN_CARD_TYPES.indexOf(a.type) - MAIN_CARD_TYPES.indexOf(b.type);
  const mainItems = BLOCK_LIBRARY_ITEMS.filter((item) => MAIN_CARD_TYPES.includes(item.type)).sort(byOrder);
  const moreItems = BLOCK_LIBRARY_ITEMS.filter((item) => !MAIN_CARD_TYPES.includes(item.type));

  return (
    <aside
      className="flex h-full w-[280px] shrink-0 flex-col border-r border-ds-border bg-ds-bg transition-colors"
      role="region"
      aria-label="カードを追加"
    >
      <div className="shrink-0 border-b border-ds-border bg-ds-card px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">カードを追加</h2>
        <p className="mt-1 text-xs text-slate-500">
          クリックで追加、またはドラッグして並べ替え
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {mainItems.map((item) => (
            <LibraryItem
              key={item.type}
              type={item.type}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
        {moreItems.length > 0 && (
          <>
            <div className="my-4 border-t border-ds-border pt-4">
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                その他
              </p>
            </div>
            <div className="space-y-2">
              {moreItems.map((item) => (
                <LibraryItem
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  description={item.description}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
