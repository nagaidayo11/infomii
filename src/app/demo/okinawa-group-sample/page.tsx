"use client";

import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import {
  APP_STORE_SAMPLE_PAGE_TITLE,
  getGroupTravelSampleEditorCards,
  GROUP_TRAVEL_SAMPLE_PAGE_BACKGROUND,
} from "@/lib/app-store-demo/group-travel-sample";

/** Static guest view for App Store screenshot capture (not linked from production nav). */
export default function OkinawaGroupSampleDemoPage() {
  return (
    <GuestCardPageView
      title={APP_STORE_SAMPLE_PAGE_TITLE}
      cards={getGroupTravelSampleEditorCards()}
      initialLocale="ja"
      localeLocked
      showLocaleToggle={false}
      pageBackground={GROUP_TRAVEL_SAMPLE_PAGE_BACKGROUND}
    />
  );
}
