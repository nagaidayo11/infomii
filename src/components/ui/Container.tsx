import type { ReactNode } from "react";

type ContainerSize = "sm" | "md" | "wide";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** sm: max-w-3xl, md: max-w-6xl (default), wide: max-w-[1820px] */
  size?: ContainerSize;
};

const sizeClass: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-6xl",
  wide: "max-w-[1820px]",
};

/**
 * SaaS landing page–aligned container.
 * mx-auto, balanced padding (px-4 sm:px-6), configurable max width.
 */
export function Container({
  children,
  className = "",
  size = "md",
}: ContainerProps) {
  return (
    <div
      className={
        "mx-auto w-full px-4 sm:px-6 " + sizeClass[size] + " " + className
      }
    >
      {children}
    </div>
  );
}
