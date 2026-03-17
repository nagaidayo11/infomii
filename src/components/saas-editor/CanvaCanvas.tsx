"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { useSaasEditorStore } from "./store";
import { SaasBlockRenderer } from "./blocks/SaasBlockRenderer";
import type { SaasBlock, SaasBlockType } from "./types";

const MIN_W = 80;
const MIN_H = 40;
const DEFAULT_W = 280;
const DEFAULT_H = 120;

function getSelectionRingClass(type: SaasBlockType, isSelected: boolean): string {
  const base = "rounded-[16px]";
  if (!isSelected) return `${base} transition-shadow`;
  switch (type) {
    case "hero":
      return `${base} ring-2 ring-blue-400 ring-offset-2`;
    case "highlight":
      return `${base} ring-2 ring-amber-400 ring-offset-2`;
    case "info":
      return `${base} ring-2 ring-slate-400 ring-offset-2`;
    default:
      return `${base} ring-2 ring-blue-400 ring-offset-2`;
  }
}

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

  const canvasShadow = "0 8px 40px rgba(0,0,0,0.08)";

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-auto"
      style={{
        background: "#eef0f3",
        backgroundImage: "radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) selectBlock(null);
      }}
    >
      <div className="min-h-[900px] min-w-[900px] p-6">
        <div
          className="relative h-[800px] w-[800px] rounded-[16px] bg-white"
          style={{ boxShadow: canvasShadow }}
        >
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
                      className={`group h-full w-full overflow-hidden ${getSelectionRingClass(
                        block.type as SaasBlockType,
                        isSelected
                      )}`}
                      style={{
                        boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="drag-handle absolute left-0 top-0 right-0 z-10 h-8 cursor-grab rounded-t-[16px] bg-slate-200/90 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100" />
                      <div className="flex h-full w-full flex-col pt-8">
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
