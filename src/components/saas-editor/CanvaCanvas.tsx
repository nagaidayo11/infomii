"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { useSaasEditorStore } from "./store";
import { SaasBlockRenderer } from "./blocks/SaasBlockRenderer";
import type { SaasBlock } from "./types";

const MIN_W = 80;
const MIN_H = 40;
const DEFAULT_W = 280;
const DEFAULT_H = 120;

export function CanvaCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const blocks = useSaasEditorStore((s) => s.blocks);
  const selectedBlockId = useSaasEditorStore((s) => s.selectedBlockId);
  const updateBlock = useSaasEditorStore((s) => s.updateBlock);
  const selectBlock = useSaasEditorStore((s) => s.selectBlock);

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragStop = useCallback(
    (id: string, _e: unknown, d: { x: number; y: number }) => {
      updateBlock(id, { position: { x: d.x, y: d.y } });
    },
    [updateBlock]
  );

  const handleResizeStop = useCallback(
    (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, pos: { x: number; y: number }) => {
      const id = ref.getAttribute("data-block-id");
      if (!id) return;
      const w = ref.offsetWidth;
      const h = ref.offsetHeight;
      updateBlock(id, { position: { x: pos.x, y: pos.y }, size: { width: w, height: h } });
    },
    [updateBlock]
  );

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-auto bg-[#f5f5f5]"
      onClick={(e) => {
        if (e.target === e.currentTarget) selectBlock(null);
      }}
    >
      <div className="min-h-[800px] min-w-[800px] p-8">
        <div className="relative h-[720px] w-[720px] rounded-xl bg-white shadow-sm">
          <AnimatePresence>
            {sortedBlocks.map((block) => {
              const w = block.size?.width ?? DEFAULT_W;
              const h = block.size?.height ?? DEFAULT_H;
              const isSelected = selectedBlockId === block.id;
              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute left-0 top-0"
                >
                  <Rnd
                    data-block-id={block.id}
                    size={{ width: w, height: h }}
                    position={{ x: block.position.x, y: block.position.y }}
                    minWidth={MIN_W}
                    minHeight={MIN_H}
                    onDragStop={(_e, d) => handleDragStop(block.id, _e, d)}
                    onResizeStop={handleResizeStop}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      selectBlock(block.id);
                    }}
                    dragGrid={[8, 8]}
                    resizeGrid={[8, 8]}
                    bounds="parent"
                    className="!cursor-move"
                    style={{ zIndex: isSelected ? 10 : 1 }}
                    enableResizing={isSelected}
                    dragHandleClassName="drag-handle"
                  >
                    <div
                      className={`group h-full w-full overflow-hidden rounded-lg transition-shadow duration-200 ${
                        isSelected
                          ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg"
                          : "shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="drag-handle absolute left-0 top-0 right-0 z-10 h-6 cursor-grab bg-slate-100/80 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100" />
                      <div className="flex h-full w-full flex-col pt-6">
                        <SaasBlockRenderer block={block} />
                      </div>
                    </div>
                  </Rnd>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
