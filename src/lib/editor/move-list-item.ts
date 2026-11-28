export function moveListItem<T>(items: readonly T[], index: number, dir: -1 | 1): T[] | null {
  const to = index + dir;
  if (to < 0 || to >= items.length) return null;
  const next = items.slice();
  const [row] = next.splice(index, 1);
  if (row === undefined) return null;
  next.splice(to, 0, row);
  return next;
}
