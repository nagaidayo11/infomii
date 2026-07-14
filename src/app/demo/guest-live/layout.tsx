import type { ReactNode } from "react";

/**
 * Guest live demos fill the iframe/viewport edge-to-edge so nested
 * `h-full` scroll areas (header + main) get a real height budget.
 */
export default function GuestLiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-white">{children}</div>
  );
}
