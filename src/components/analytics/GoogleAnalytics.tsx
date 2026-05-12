"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isGa4Enabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    typeof process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID === "string" &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID.startsWith("G-")
  );
}

function Ga4RoutePageViews({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const search = searchParams?.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;

    if (prevPathRef.current === undefined) {
      prevPathRef.current = pagePath;
      return;
    }
    if (prevPathRef.current === pagePath) return;
    prevPathRef.current = pagePath;

    if (typeof window.gtag !== "function") return;
    window.gtag("config", measurementId, { page_path: pagePath });
  }, [measurementId, pathname, searchParams]);

  return null;
}

/**
 * GA4: loads gtag.js (afterInteractive), initial page_view, and SPA navigations via App Router.
 * No-ops outside production or when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset.
 */
export function GoogleAnalytics() {
  if (!isGa4Enabled()) return null;

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: true });
`}
      </Script>
      <Suspense fallback={null}>
        <Ga4RoutePageViews measurementId={measurementId} />
      </Suspense>
    </>
  );
}
