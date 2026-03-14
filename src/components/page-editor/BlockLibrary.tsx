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
        "flex w-full items-center gap-3 rounded-lg border border-transparent bg-transparent px-3 py-2.5 text-left transition duration-200 " +
        (isDragging
          ? "cursor-grabbing opacity-80"
          : "cursor-grab hover:bg-slate-100 active:bg-slate-200")
      }
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        {CARD_ICONS[type]}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </div>
    </button>
  );
}

export function BlockLibrary() {
  const primary = ["text", "image", "map", "button", "wifi", "schedule", "menu"];
  const primaryTypes = BLOCK_LIBRARY_ITEMS.filter((item) => primary.includes(item.type));
  const otherTypes = BLOCK_LIBRARY_ITEMS.filter((item) => !primary.includes(item.type));

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-ds-border bg-ds-card transition-colors">
      <div className="shrink-0 border-b border-ds-border px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-800">Add card</h2>
        <p className="mt-1 text-xs text-slate-500">
          Click to add or drag onto the page
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {primaryTypes.map((item) => (
            <LibraryItem
              key={item.type}
              type={item.type}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
        {otherTypes.length > 0 && (
          <>
            <div className="my-3 border-t border-ds-border pt-3">
              <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                More
              </p>
            </div>
            <div className="space-y-0.5">
              {otherTypes.map((item) => (
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
