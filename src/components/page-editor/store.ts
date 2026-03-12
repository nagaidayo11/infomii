import { create } from "zustand";
import { nanoid } from "nanoid";
import type { PageBlock, PageBlockType } from "./types";
import { createEmptyBlock } from "./types";

export type PageEditorState = {
  blocks: PageBlock[];
  selectedId: string | null;
  setBlocks: (blocks: PageBlock[]) => void;
  addBlock: (type: PageBlockType, index?: number) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  updateBlock: (id: string, patch: Partial<PageBlock>) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  selectBlock: (id: string | null) => void;
  toJSON: () => string;
  loadJSON: (json: string) => void;
};

function cloneBlock(block: PageBlock): PageBlock {
  const newId = nanoid(10);
  const json = JSON.stringify(block);
  const parsed = JSON.parse(json) as PageBlock;
  parsed.id = newId;
  if (parsed.type === "gallery" && "items" in parsed) {
    parsed.items = parsed.items.map((item, i) => ({
      ...item,
      id: `${newId}-g${i}`,
    }));
  }
  return parsed;
}

export const usePageEditorStore = create<PageEditorState>((set, get) => ({
  blocks: [
    { id: "1", type: "text", content: "館内案内" },
    {
      id: "2",
      type: "image",
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      alt: "ホテル",
    },
    { id: "3", type: "button", label: "WiFiを見る", href: "#wifi" },
  ],
  selectedId: null,

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (type, index) => {
    const id = nanoid(10);
    const block = createEmptyBlock(type, id);
    set((s) => {
      const next = [...s.blocks];
      const i = index != null ? Math.min(index, next.length) : next.length;
      next.splice(i, 0, block);
      return { blocks: next, selectedId: id };
    });
  },

  removeBlock: (id) =>
    set((s) => ({
      blocks: s.blocks.filter((b) => b.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  duplicateBlock: (id) => {
    const block = get().blocks.find((b) => b.id === id);
    if (!block) return;
    const copy = cloneBlock(block);
    set((s) => {
      const idx = s.blocks.findIndex((b) => b.id === id);
      const next = [...s.blocks];
      next.splice(idx + 1, 0, copy);
      return { blocks: next, selectedId: copy.id };
    });
  },

  updateBlock: (id, patch) =>
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? ({ ...b, ...patch } as PageBlock) : b
      ),
    })),

  reorderBlocks: (activeId, overId) => {
    if (activeId === overId) return;
    set((s) => {
      const blocks = [...s.blocks];
      const oldIndex = blocks.findIndex((b) => b.id === activeId);
      const newIndex = blocks.findIndex((b) => b.id === overId);
      if (oldIndex < 0 || newIndex < 0) return s;
      const [removed] = blocks.splice(oldIndex, 1);
      blocks.splice(newIndex, 0, removed);
      return { blocks };
    });
  },

  selectBlock: (id) => set({ selectedId: id }),

  toJSON: () => JSON.stringify(get().blocks, null, 2),

  loadJSON: (json) => {
    try {
      const parsed = JSON.parse(json) as PageBlock[];
      if (Array.isArray(parsed)) set({ blocks: parsed });
    } catch {
      // ignore
    }
  },
}));
