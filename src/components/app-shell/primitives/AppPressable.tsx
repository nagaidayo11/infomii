"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type AppPressableProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
} & (
  | ({ as?: "button" } & Omit<ComponentProps<"button">, "className" | "children">)
  | ({ as: "link"; href: string } & Omit<ComponentProps<typeof Link>, "className" | "children" | "href">)
);

export function AppPressable(props: AppPressableProps) {
  const { children, className = "", disabled, ...rest } = props;
  const base =
    "app-pressable ui-pop-tap inline-flex items-center justify-center " + className;

  if (props.as === "link") {
    const { href, ...linkRest } = rest as { href: string } & Omit<
      ComponentProps<typeof Link>,
      "href"
    >;
    return (
      <Link href={href} className={base} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ComponentProps<"button">;
  return (
    <button type="button" className={base} disabled={disabled} {...buttonRest}>
      {children}
    </button>
  );
}
