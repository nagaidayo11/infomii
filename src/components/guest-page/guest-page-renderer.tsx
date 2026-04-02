"use client";

import Image from "next/image";
import type { PageBlock } from "@/components/page-editor/types";
import { LineIcon, normalizeIconToken } from "@/components/cards/LineIcon";

type GuestPageRendererProps = {
  blocks: PageBlock[];
  /** Optional page title in status bar area */
  brandLabel?: string;
  className?: string;
}

/**
 * Mobile-first guest page: hero, title, text sections, buttons, icons, map.
 * Large readable type, clean hotel UI. Pure component — pass blocks from store for live updates.
 */
export function GuestPageRenderer({
  blocks,
  brandLabel = "案内",
  className = "",
}: GuestPageRendererProps) {
  // First image with src = hero; first text = title; rest text = sections
  let heroUsed = false;
  let titleUsed = false;

  return (
    <div
      className={
        "min-h-full bg-[#fafaf9] text-slate-800 antialiased " + className
      }
    >
      {/* Soft top bar — guest sees this after QR scan */}
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <p className="text-center text-[13px] font-semibold tracking-wide text-stone-600">
          {brandLabel}
        </p>
      </header>

      <main className="pb-10 pt-0">
        {blocks.length === 0 && (
          <div className="px-5 py-16 text-center">
            <p className="text-lg text-stone-400">コンテンツを追加するとここに表示されます</p>
          </div>
        )}

        {blocks.map((block) => {
          switch (block.type) {
            case "image": {
              if (!block.src) return null;
              if (!heroUsed) {
                heroUsed = true;
                return (
                  <section key={block.id} className="w-full">
                    <div className="relative aspect-[4/3] w-full bg-stone-200">
                      <Image
                        src={block.src}
                        alt={block.alt ?? ""}
                        fill
                        className="object-cover"
                        priority
                        unoptimized={block.src.startsWith("http")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>
                  </section>
                );
              }
              return (
                <section key={block.id} className="px-4 pt-6">
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-stone-200 shadow-sm">
                    <Image
                      src={block.src}
                      alt={block.alt ?? ""}
                      fill
                      className="object-cover"
                      unoptimized={block.src.startsWith("http")}
                    />
                  </div>
                </section>
              );
            }

            case "text": {
              const content = (block.content ?? "").trim();
              if (!content) return null;
              if (!titleUsed) {
                titleUsed = true;
                return (
                  <section
                    key={block.id}
                    className="px-5 pt-8 pb-2"
                  >
                    <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-stone-900">
                      {content}
                    </h1>
                  </section>
                );
              }
              return (
                <section
                  key={block.id}
                  className="px-5 pt-6"
                >
                  <p className="text-[1.125rem] leading-[1.65] text-stone-700">
                    {content}
                  </p>
                </section>
              );
            }

            case "button": {
              const href = block.href && block.href !== "#" ? block.href : undefined;
              const label = block.label || "タップ";
              const Btn = (
                <span className="flex w-full items-center justify-center rounded-2xl bg-ds-primary px-5 py-4 text-[1.0625rem] font-semibold text-white shadow-md active:scale-[0.98]">
                  {label}
                </span>
              );
              return (
                <section key={block.id} className="px-5 pt-6">
                  {href ? (
                    <a href={href} className="block w-full no-underline">
                      {Btn}
                    </a>
                  ) : (
                    <div className="w-full">{Btn}</div>
                  )}
                </section>
              );
            }

            case "icon": {
              const desc = block.description?.trim();
              return (
                <section key={block.id} className="px-5 pt-6">
                  <div className="rounded-2xl border border-stone-200/90 bg-white/90 p-4 shadow-sm ring-1 ring-stone-200/60">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-slate-700 shadow-sm ring-1 ring-stone-200/80"
                        aria-hidden
                      >
                        <LineIcon
                          name={normalizeIconToken(block.icon, "info")}
                          className="h-8 w-8"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        {block.label && (
                          <p className="text-[1.125rem] font-medium leading-snug text-stone-800">
                            {block.label}
                          </p>
                        )}
                        {desc && (
                          <p className="mt-1.5 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-stone-600">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            case "divider":
              return (
                <div
                  key={block.id}
                  className="mx-5 my-8 h-px bg-stone-200"
                  role="separator"
                />
              );

            case "map": {
              const address = block.address?.trim();
              return (
                <section
                  key={block.id}
                  className="mx-4 mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80"
                >
                  <div className="flex h-40 items-center justify-center bg-stone-100">
                    <div className="text-center">
                      <span className="text-3xl" aria-hidden>
                        📍
                      </span>
                      <p className="mt-2 text-sm font-medium text-stone-500">
                        地図
                      </p>
                    </div>
                  </div>
                  {address && (
                    <div className="border-t border-stone-100 px-4 py-4">
                      <p className="text-[0.8125rem] font-medium uppercase tracking-wider text-stone-400">
                        住所
                      </p>
                      <p className="mt-1 text-[1.0625rem] leading-relaxed text-stone-800">
                        {address}
                      </p>
                    </div>
                  )}
                </section>
              );
            }

            case "gallery": {
              const items = block.items?.filter((i) => i.src) ?? [];
              if (items.length === 0) return null;
              return (
                <section key={block.id} className="px-4 pt-8">
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden rounded-xl bg-stone-200"
                      >
                        <Image
                          src={item.src}
                          alt={item.caption ?? ""}
                          fill
                          className="object-cover"
                          unoptimized={item.src.startsWith("http")}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            case "wifi": {
              const label = block.label?.trim() || "WiFi";
              const ssid = block.ssid?.trim();
              const password = block.password?.trim();
              return (
                <section
                  key={block.id}
                  className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80"
                >
                  <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
                    <span className="text-2xl" aria-hidden>📶</span>
                    <p className="text-[1rem] font-semibold text-stone-800">{label}</p>
                  </div>
                  <div className="space-y-3 px-4 py-4">
                    {ssid && (
                      <div>
                        <p className="text-[0.75rem] font-medium uppercase tracking-wider text-stone-400">SSID</p>
                        <p className="mt-0.5 text-[1rem] font-mono text-stone-800">{ssid}</p>
                      </div>
                    )}
                    {password && (
                      <div>
                        <p className="text-[0.75rem] font-medium uppercase tracking-wider text-stone-400">パスワード</p>
                        <p className="mt-0.5 text-[1rem] font-mono text-stone-800">{password}</p>
                      </div>
                    )}
                    {!ssid && !password && (
                      <p className="text-sm text-stone-400">WiFi情報を設定してください</p>
                    )}
                  </div>
                </section>
              );
            }

            case "schedule": {
              const title = block.title?.trim() || "営業時間";
              const items = block.items?.filter((i) => (i.day ?? i.time ?? i.label)) ?? [];
              return (
                <section
                  key={block.id}
                  className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80"
                >
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="text-[1rem] font-semibold text-stone-800">{title}</p>
                  </div>
                  <ul className="divide-y divide-stone-100">
                    {items.length === 0 ? (
                      <li className="px-4 py-4 text-sm text-stone-400">スケジュールを追加</li>
                    ) : (
                      items.map((item, i) => (
                        <li key={item.id ?? i} className="flex items-center justify-between gap-4 px-4 py-3">
                          <span className="text-[1rem] text-stone-800">{item.day || item.label || "—"}</span>
                          <span className="text-sm font-medium text-stone-600">{item.time || "—"}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              );
            }

            case "menu": {
              const title = block.title?.trim() || "メニュー";
              const items = block.items?.filter((i) => (i.name ?? i.price)) ?? [];
              return (
                <section
                  key={block.id}
                  className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80"
                >
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="text-[1rem] font-semibold text-stone-800">{title}</p>
                  </div>
                  <ul className="divide-y divide-stone-100">
                    {items.length === 0 ? (
                      <li className="px-4 py-4 text-sm text-stone-400">メニューを追加</li>
                    ) : (
                      items.map((item, i) => (
                        <li key={item.id ?? i} className="px-4 py-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[1rem] font-medium text-stone-800">{item.name || "—"}</span>
                            {item.price && (
                              <span className="text-sm font-semibold text-stone-700">¥{item.price}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-1 text-[0.875rem] text-stone-500">{item.description}</p>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              );
            }

            case "breakfast": {
              const title = block.title?.trim() || "朝食";
              const time = block.time?.trim();
              const place = block.place?.trim();
              const note = block.note?.trim();
              return (
                <section
                  key={block.id}
                  className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80"
                >
                  <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
                    <span className="text-2xl" aria-hidden>🍳</span>
                    <p className="text-[1rem] font-semibold text-stone-800">{title}</p>
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    {time && (
                      <p className="text-[1rem] text-stone-800">
                        <span className="text-[0.75rem] font-medium uppercase tracking-wider text-stone-400">時間</span>
                        <span className="ml-2">{time}</span>
                      </p>
                    )}
                    {place && (
                      <p className="text-[1rem] text-stone-800">
                        <span className="text-[0.75rem] font-medium uppercase tracking-wider text-stone-400">会場</span>
                        <span className="ml-2">{place}</span>
                      </p>
                    )}
                    {note && <p className="text-[0.875rem] text-stone-600">{note}</p>}
                  </div>
                </section>
              );
            }

            case "checkout": {
              const title = block.title?.trim() || "チェックアウト";
              const time = block.time?.trim();
              const note = block.note?.trim();
              const linkUrl = block.linkUrl?.trim();
              const linkLabel = block.linkLabel?.trim() || "詳細";
              return (
                <section
                  key={block.id}
                  className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80"
                >
                  <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
                    <span className="text-2xl" aria-hidden>🕐</span>
                    <p className="text-[1rem] font-semibold text-stone-800">{title}</p>
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    {time && (
                      <p className="text-[1rem] font-medium text-stone-800">{time}</p>
                    )}
                    {note && <p className="text-[0.875rem] text-stone-600">{note}</p>}
                    {linkUrl && (
                      <a
                        href={linkUrl}
                        className="mt-2 inline-flex items-center rounded-xl bg-ds-primary px-4 py-2 text-sm font-medium text-white"
                      >
                        {linkLabel}
                      </a>
                    )}
                  </div>
                </section>
              );
            }

            case "notice": {
              const title = block.title?.trim() || "お知らせ";
              const body = block.body?.trim();
              const isWarning = block.variant === "warning";
              return (
                <section
                  key={block.id}
                  className={`mx-4 mt-6 overflow-hidden rounded-2xl shadow-sm ring-1 ${
                    isWarning ? "bg-amber-50 ring-amber-200/80" : "bg-sky-50/90 ring-sky-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3 border-b border-stone-100/80 px-4 py-3">
                    <span className="text-2xl" aria-hidden>{isWarning ? "⚠️" : "ℹ️"}</span>
                    <p className="text-[1rem] font-semibold text-stone-800">{title}</p>
                  </div>
                  {body && (
                    <div className="px-4 py-4">
                      <p className="text-[0.9375rem] leading-relaxed text-stone-700">{body}</p>
                    </div>
                  )}
                </section>
              );
            }

            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}
