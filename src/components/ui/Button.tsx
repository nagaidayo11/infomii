"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { useButtonLift } from "@/components/providers/ButtonLiftProvider";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverted";
type ButtonSize = "sm" | "md" | "lg";

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButton = SharedButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedButtonProps | "href"> & {
    href?: undefined;
  };

type ButtonAsLink = SharedButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedButtonProps | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClass =
  "inline-flex items-center justify-center rounded-ds font-semibold " +
  "transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out " +
  "shadow-ds-sm " +
  "active:scale-[0.98] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ds-card";

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

function buildVariantClass(variant: ButtonVariant, lift: boolean): string {
  switch (variant) {
    case "primary":
      return (
        "border border-ds-primary/20 bg-ds-primary !text-white hover:bg-ds-primary-hover hover:shadow-ds-primary-glow " +
        (lift
          ? "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-ds-lg "
          : "motion-safe:hover:scale-[1.02] ")
      );
    case "secondary":
      return (
        "border border-ds-border bg-ds-card text-ds-foreground-secondary hover:border-ds-border-strong hover:bg-ds-bg hover:shadow-ds-sm " +
        (lift
          ? "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-ds-md "
          : "motion-safe:hover:scale-[1.02] ")
      );
    case "ghost":
      return (
        "text-ds-muted shadow-none hover:bg-ds-bg hover:text-ds-foreground " +
        (lift ? "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-ds-sm " : "")
      );
    case "inverted":
      return (
        "border border-ds-card bg-ds-card text-ds-foreground hover:bg-ds-bg hover:shadow-ds-md " +
        (lift
          ? "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-ds-lg "
          : "motion-safe:hover:scale-[1.02] ")
      );
    default:
      return "";
  }
}

/**
 * Product / LP 共通: ds-primary（青）とトークン上の neutrals。
 * ホバー浮きは ButtonLiftProvider により /lp/*・/editor* ではオフ。
 */
export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const { liftEnabled } = useButtonLift();
  const combined =
    baseClass +
    " " +
    sizeClass[size] +
    " " +
    buildVariantClass(variant, liftEnabled) +
    " " +
    className;

  if (typeof props.href === "string" && props.href) {
    const {
      href,
      children: _linkChildren,
      variant: _linkVariant,
      size: _linkSize,
      className: _linkClassName,
      ...anchorRest
    } = props as ButtonAsLink;
    return (
      <a href={href} className={combined} {...anchorRest}>
        {children}
      </a>
    );
  }

  const {
    type = "button",
    children: _buttonChildren,
    variant: _buttonVariant,
    size: _buttonSize,
    className: _buttonClassName,
    href: _href,
    ...buttonRest
  } = props as ButtonAsButton;
  return (
    <button type={type} className={combined} {...buttonRest}>
      {children}
    </button>
  );
}
