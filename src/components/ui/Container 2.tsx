import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** Max width: same as SaaS LP (max-w-6xl) */
  narrow?: boolean;
};

/**
 * SaaS landing page–aligned container.
 * max-w-6xl, mx-auto, balanced padding (px-4 sm:px-6).
 */
export function Container({
  children,
  className = "",
  narrow = true,
}: ContainerProps) {
  return (
    <div
      className={
        "mx-auto w-full px-4 sm:px-6 " +
        (narrow ? "max-w-6xl" : "max-w-[1820px]") +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
