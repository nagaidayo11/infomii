"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 旧 /dashboard/templates → /templates にリダイレクト
 */
export default function DashboardTemplatesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/templates");
  }, [router]);
  return null;
}
