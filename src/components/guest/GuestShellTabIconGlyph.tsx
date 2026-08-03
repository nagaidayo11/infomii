"use client";

import type { GuestShellTabIcon } from "@/lib/guest-shell";

const ICON_CLASS = "h-5 w-5";

/** Shared glyph for guest-nav tab icons (editor picker + chrome). */
export function GuestShellTabIconGlyph({
  name,
  className = ICON_CLASS,
}: {
  name: GuestShellTabIcon;
  className?: string;
}) {
  if (name === "home") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    );
  }
  if (name === "menu") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h2.3a1 1 0 01.96.73l1.1 3.7a1 1 0 01-.27 1.05L7.9 10.7a12.05 12.05 0 005.4 5.4l2.22-1.19a1 1 0 011.05-.27l3.7 1.1a1 1 0 01.73.96V19a2 2 0 01-2 2h-.5C10.16 21 3 13.84 3 5.5V5z"
        />
      </svg>
    );
  }
  if (name === "map") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
        />
        <circle cx="12" cy="10" r="2.25" />
      </svg>
    );
  }
  if (name === "luggage") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6V5a2 2 0 012-2h2a2 2 0 012 2v1m-8 0h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2zm2 4v6m6-6v6"
        />
      </svg>
    );
  }
  if (name === "wifi") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5a5 5 0 017 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10.5a9 9 0 0113 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 7.5a13 13 0 0119 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
      </svg>
    );
  }
  if (name === "page") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5 0 4.5-4 4.5-9S14.5 3 12 3 7.5 7 7.5 12s2 9 4.5 9zm-7.5-9h15"
      />
    </svg>
  );
}
