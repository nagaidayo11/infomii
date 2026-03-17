"use client";

import { useState, useEffect } from "react";
import { SaasEditor } from "@/components/saas-editor";

export default function SaasEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  return <SaasEditor pageId={resolvedParams.id} />;
}
