import { useState } from "react";
import type { ItineraryCard } from "@/types/itinerary";

export function useShareSheet() {
  const [shareItem, setShareItem] = useState<ItineraryCard | null>(null);

  return {
    shareItem,
    shareVisible: Boolean(shareItem),
    openShare: setShareItem,
    closeShare: () => setShareItem(null),
  };
}
