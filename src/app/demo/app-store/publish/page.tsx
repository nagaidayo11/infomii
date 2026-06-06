"use client";

import { PublishModal } from "@/components/editor/PublishModal";
import {
  APP_STORE_SAMPLE_PAGE_TITLE,
  APP_STORE_SAMPLE_PUBLIC_URL,
  APP_STORE_SAMPLE_SLUG,
} from "@/lib/app-store-demo/group-travel-sample";

/** Static publish modal for App Store screenshot capture. */
export default function AppStorePublishDemoPage() {
  return (
    <div className="min-h-[100dvh] bg-slate-900/60">
      <PublishModal
        publicUrl={APP_STORE_SAMPLE_PUBLIC_URL}
        pageTitle={APP_STORE_SAMPLE_PAGE_TITLE}
        slug={APP_STORE_SAMPLE_SLUG}
        onClose={() => {}}
        variant="publish-success"
      />
    </div>
  );
}
