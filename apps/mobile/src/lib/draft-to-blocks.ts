import type { DraftBlock, ItineraryBlock } from "@/types/itinerary";
import type { InformationBlock } from "@/types/information";

export const MOBILE_NEARBY_LABEL = "__infomii_mobile_nearby__";
export const MOBILE_STEPS_LABEL = "__infomii_mobile_steps__";

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function scheduleToHoursItems(draft: DraftBlock) {
  const items = draft.scheduleItems?.filter((i) => i.label.trim() || i.time.trim() || i.day.trim()) ?? [];
  if (!items.length) {
    const note = draft.body?.trim();
    return [{ id: uid("h"), label: note || "予定を入力", value: "", description: "" }];
  }
  return items.map((item) => ({
    id: uid("h"),
    label: item.label || "予定",
    value: item.time,
    description: item.day,
  }));
}

function hoursItemToScheduleRow(item: { label: string; value: string; description?: string }) {
  return { day: item.description ?? "", time: item.value ?? "", label: item.label ?? "" };
}

export function draftBlocksToContentBlocks(
  title: string,
  drafts: DraftBlock[],
): InformationBlock[] {
  const blocks: InformationBlock[] = [{ id: uid("title"), type: "title", text: title }];

  for (const draft of drafts) {
    const note = draft.body?.trim();
    switch (draft.type) {
      case "hero": {
        if (draft.imageUrl?.trim()) {
          blocks.push({
            id: `${draft.id}-img`,
            type: "image",
            url: draft.imageUrl.trim(),
            label: title,
          });
        }
        if (note) {
          blocks.push({
            id: draft.id,
            type: "heading",
            text: note,
          });
        }
        break;
      }
      case "schedule":
        blocks.push({
          id: draft.id,
          type: "hours",
          label: draft.title,
          hoursItems: scheduleToHoursItems(draft),
        });
        break;
      case "checklist": {
        const texts =
          draft.checklistItems?.map((t) => t.trim()).filter(Boolean) ??
          (note ? [note] : ["持ち物を入力"]);
        blocks.push({
          id: draft.id,
          type: "checklist",
          label: draft.title,
          checklistItems: texts.map((text) => ({ id: uid("c"), text })),
        });
        break;
      }
      case "quote":
        blocks.push({
          id: draft.id,
          type: "quote",
          text: note || "引用文を入力",
          quoteAuthor: draft.quoteAuthor?.trim() || undefined,
        });
        break;
      case "gallery": {
        const items = draft.galleryItems?.filter((g) => g.url.trim()) ?? [];
        if (!items.length) break;
        blocks.push({
          id: draft.id,
          type: "gallery",
          label: draft.title,
          galleryItems: items.map((g) => ({
            id: uid("gal"),
            url: g.url.trim(),
            caption: g.caption,
          })),
        });
        break;
      }
      case "pricing": {
        const items = draft.pricingItems?.filter((p) => p.label.trim() || p.value.trim()) ?? [];
        if (!items.length) break;
        blocks.push({
          id: draft.id,
          type: "pricing",
          label: draft.title,
          pricingItems: items.map((p) => ({
            id: uid("pr"),
            label: p.label,
            value: p.value,
          })),
        });
        break;
      }
      case "cta":
        blocks.push({
          id: draft.id,
          type: "cta",
          ctaLabel: draft.ctaLabel?.trim() || draft.title || "詳しく見る",
          ctaUrl: draft.ctaUrl?.trim() || "#",
        });
        break;
      case "badge":
        blocks.push({
          id: draft.id,
          type: "badge",
          badgeText: draft.badgeText?.trim() || draft.title || "バッジ",
          badgeColor: draft.badgeColor ?? "#dcfce7",
          badgeTextColor: draft.badgeTextColor ?? "#065f46",
        });
        break;
      case "steps": {
        const steps = draft.steps?.filter((s) => s.title.trim() || s.description.trim()) ?? [];
        if (steps.length) {
          steps.forEach((step, index) => {
            blocks.push({
              id: uid("stp"),
              type: "section",
              sectionTitle: step.title || draft.title,
              sectionBody: step.description,
              label: MOBILE_STEPS_LABEL,
              description: draft.id,
              text: index === 0 ? draft.title : undefined,
            });
          });
        } else {
          blocks.push({
            id: draft.id,
            type: "section",
            sectionTitle: draft.title,
            sectionBody: note || "ステップの内容を入力",
          });
        }
        break;
      }
      case "nearby": {
        const places = draft.nearby?.filter((p) => p.name.trim() || p.description.trim()) ?? [];
        if (places.length) {
          places.forEach((place, index) => {
            blocks.push({
              id: uid("near"),
              type: "section",
              sectionTitle: place.name,
              sectionBody: place.description,
              label: MOBILE_NEARBY_LABEL,
              description: draft.id,
              text: index === 0 ? draft.title : undefined,
            });
          });
        } else {
          blocks.push({
            id: draft.id,
            type: "section",
            sectionTitle: draft.title,
            sectionBody: note || "スポット名とメモを入力",
          });
        }
        break;
      }
      case "image":
        if (draft.imageUrl?.trim()) {
          blocks.push({
            id: draft.id,
            type: "image",
            url: draft.imageUrl.trim(),
            label: draft.title,
            text: note,
          });
        }
        break;
      case "map":
      case "notice":
      case "welcome":
        blocks.push({
          id: draft.id,
          type: "paragraph",
          text: note ? `${draft.title}: ${note}` : `${draft.title}の内容を入力`,
        });
        break;
      default:
        break;
    }
  }

  return blocks;
}

/** Supabase content_blocks → 作る画面用 DraftBlock */
export function contentBlocksToDraftBlocks(
  contentBlocks: InformationBlock[],
  fallbackTitle: string,
): DraftBlock[] {
  const drafts: DraftBlock[] = [];
  const consumed = new Set<number>();
  let pendingCoverUrl: string | undefined;

  for (let i = 0; i < contentBlocks.length; i += 1) {
    if (consumed.has(i)) continue;
    const block = contentBlocks[i];

    if (block.type === "title") continue;

    if (block.type === "image" && block.url) {
      const next = contentBlocks[i + 1];
      if (next?.type === "heading") {
        drafts.push({
          id: next.id,
          type: "hero",
          title: "カバー",
          body: next.text ?? "",
          imageUrl: block.url,
        });
        consumed.add(i + 1);
        continue;
      }
      pendingCoverUrl = block.url;
      continue;
    }

    if (block.type === "heading") {
      drafts.push({
        id: block.id,
        type: "hero",
        title: "カバー",
        body: block.text ?? "",
        imageUrl: pendingCoverUrl,
      });
      pendingCoverUrl = undefined;
      continue;
    }

    if (block.type === "hours" && block.hoursItems?.length) {
      drafts.push({
        id: block.id,
        type: "schedule",
        title: block.label ?? "タイムライン",
        scheduleItems: block.hoursItems.map(hoursItemToScheduleRow),
      });
      continue;
    }

    if (block.type === "checklist" && block.checklistItems?.length) {
      drafts.push({
        id: block.id,
        type: "checklist",
        title: block.label ?? "持ち物",
        checklistItems: block.checklistItems.map((c) => c.text),
      });
      continue;
    }

    if (block.type === "quote") {
      drafts.push({
        id: block.id,
        type: "quote",
        title: "引用",
        body: block.text ?? "",
        quoteAuthor: block.quoteAuthor,
      });
      continue;
    }

    if (block.type === "gallery") {
      drafts.push({
        id: block.id,
        type: "gallery",
        title: block.label ?? "ギャラリー",
        galleryItems: (block.galleryItems ?? []).map((g) => ({
          url: g.url,
          caption: g.caption,
        })),
      });
      continue;
    }

    if (block.type === "pricing" && block.pricingItems?.length) {
      drafts.push({
        id: block.id,
        type: "pricing",
        title: block.label ?? "料金・プラン",
        pricingItems: block.pricingItems.map((p) => ({ label: p.label, value: p.value })),
      });
      continue;
    }

    if (block.type === "cta") {
      drafts.push({
        id: block.id,
        type: "cta",
        title: "ボタン・リンク",
        ctaLabel: block.ctaLabel ?? "",
        ctaUrl: block.ctaUrl ?? "",
      });
      continue;
    }

    if (block.type === "badge") {
      drafts.push({
        id: block.id,
        type: "badge",
        title: "バッジ",
        badgeText: block.badgeText ?? "",
        badgeColor: block.badgeColor,
        badgeTextColor: block.badgeTextColor ?? block.textColor,
      });
      continue;
    }

    if (block.type === "section" && block.label === MOBILE_NEARBY_LABEL) {
      const parentId = block.description ?? block.id;
      const nearby: NonNullable<DraftBlock["nearby"]> = [];
      let title = block.text ?? "よく行きそうな場所";
      let j = i;
      for (; j < contentBlocks.length; j += 1) {
        const row = contentBlocks[j];
        if (row.type !== "section" || row.label !== MOBILE_NEARBY_LABEL || row.description !== parentId) {
          break;
        }
        consumed.add(j);
        if (row.text) title = row.text;
        nearby.push({ name: row.sectionTitle ?? "", description: row.sectionBody ?? "" });
      }
      drafts.push({ id: parentId, type: "nearby", title, nearby });
      i = j - 1;
      continue;
    }

    if (block.type === "section" && block.label === MOBILE_STEPS_LABEL) {
      const parentId = block.description ?? block.id;
      const steps: NonNullable<DraftBlock["steps"]> = [];
      let title = block.text ?? "ステップ";
      let j = i;
      for (; j < contentBlocks.length; j += 1) {
        const row = contentBlocks[j];
        if (row.type !== "section" || row.label !== MOBILE_STEPS_LABEL || row.description !== parentId) {
          break;
        }
        consumed.add(j);
        if (row.text) title = row.text;
        steps.push({ title: row.sectionTitle ?? "", description: row.sectionBody ?? "" });
      }
      drafts.push({ id: parentId, type: "steps", title, steps });
      i = j - 1;
      continue;
    }

    if (block.type === "section") {
      drafts.push({
        id: block.id,
        type: "steps",
        title: block.sectionTitle ?? "セクション",
        steps: [{ title: block.sectionTitle ?? "", description: block.sectionBody ?? "" }],
      });
      continue;
    }

    if (block.type === "paragraph" && block.text) {
      drafts.push({ id: block.id, type: "notice", title: "メモ", body: block.text });
    }
  }

  if (pendingCoverUrl && !drafts.some((d) => d.type === "hero")) {
    drafts.unshift({
      id: "draft-hero",
      type: "hero",
      title: "カバー",
      body: "",
      imageUrl: pendingCoverUrl,
    });
  }

  if (!drafts.length) {
    return [
      { id: "draft-hero", type: "hero", title: "カバー", body: fallbackTitle },
      { id: "draft-schedule", type: "schedule", title: "タイムライン", scheduleItems: [{ day: "", time: "", label: "" }] },
    ];
  }

  return drafts;
}

export function itineraryBlocksToDraftBlocks(blocks: ItineraryBlock[]): DraftBlock[] {
  return blocks.map((block) => {
    const draft: DraftBlock = {
      id: block.id.startsWith("draft-") ? block.id : `draft-${block.id}`,
      type: block.type,
      title: block.title ?? block.type,
      body: block.body ?? block.subtitle,
      imageUrl: block.imageUrl,
      quoteAuthor: block.quoteAuthor,
      galleryItems: block.galleryItems?.map((g) => ({ ...g })),
      pricingItems: block.pricingItems?.map((p) => ({ ...p })),
      ctaLabel: block.ctaLabel,
      ctaUrl: block.ctaUrl,
      badgeText: block.badgeText,
      badgeColor: block.badgeColor,
      badgeTextColor: block.badgeTextColor,
    };
    if (block.scheduleItems?.length) draft.scheduleItems = block.scheduleItems.map((i) => ({ ...i }));
    if (block.checklistItems?.length) draft.checklistItems = [...block.checklistItems];
    if (block.nearby?.length) draft.nearby = block.nearby.map((p) => ({ ...p }));
    if (block.steps?.length) draft.steps = block.steps.map((s) => ({ ...s }));
    return draft;
  });
}
