"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { SaasBlock, SaasBlockType, BlockPosition, BlockSize, BlockStyle } from "./types";
import { createEmptyBlock } from "./types";

export type SaasEditorState = {
  pageId: string | null;
  pageTitle: string;
  blocks: SaasBlock[];
  selectedBlockId: string | null;
  isSaving: boolean;
  lastSavedAt: number | null;
  setPage: (pageId: string | null, pageTitle: string) => void;
  setBlocks: (blocks: SaasBlock[]) => void;
  addBlock: (type: SaasBlockType, position: BlockPosition) => SaasBlock;
  updateBlock: (
    id: string,
    patch: Partial<Pick<SaasBlock, "content" | "style" | "position" | "size">>
  ) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (at: number | null) => void;
};

export const useSaasEditorStore = create<SaasEditorState>((set, get) => ({
  pageId: null,
  pageTitle: "",
  blocks: [],
  selectedBlockId: null,
  isSaving: false,
  lastSavedAt: null,

  setPage: (pageId, pageTitle) => set({ pageId, pageTitle }),

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (type, position) => {
    const { blocks } = get();
    const order = blocks.length;
    const id = nanoid(10);
    const block = createEmptyBlock(type, id, position, order);
    set({
      blocks: [...blocks, block],
      selectedBlockId: id,
    });
    return block;
  },

  updateBlock: (id, patch) =>
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              ...(patch.content !== undefined && { content: { ...b.content, ...patch.content } }),
              ...(patch.style !== undefined && { style: { ...b.style, ...patch.style } }),
              ...(patch.position !== undefined && { position: patch.position }),
              ...(patch.size !== undefined && { size: patch.size }),
            }
          : b
      ),
    })),

  removeBlock: (id) =>
    set((s) => ({
      blocks: s.blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })),
      selectedBlockId: s.selectedBlockId === id ? null : s.selectedBlockId,
    })),

  selectBlock: (id) => set({ selectedBlockId: id }),

  reorderBlocks: (fromIndex, toIndex) => {
    const { blocks } = get();
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= blocks.length || toIndex >= blocks.length)
      return;
    const next = [...blocks];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    const withOrder = next.map((b, i) => ({ ...b, order: i }));
    set({ blocks: withOrder });
  },

  setSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
}));
