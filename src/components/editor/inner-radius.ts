/**
 * Block style `innerBorderRadius` (px) is exposed as this CSS variable on the block wrapper (getBlockStyle).
 * Apply `editorInnerRadiusClassName` to chips, gallery tiles, link cells, KPI cells, etc.
 */
export const EDITOR_INNER_RADIUS_VAR = "--editor-inner-border-radius";

export const editorInnerRadiusClassName =
  "rounded-[var(--editor-inner-border-radius,0.75rem)]";
