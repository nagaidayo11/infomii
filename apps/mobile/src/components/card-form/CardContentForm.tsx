import type React from "react";
import { ImagePickUpload } from "@/components/ImagePickUpload";
import { asObjectArray, fieldStr, patchBool, patchField, patchNumber } from "@/lib/card-form-helpers";
import { cardTypeLabel, isBusinessOnlyCard, type EditorCard } from "@/types/editor-card";
import {
  FieldInput,
  FieldSwitch,
  ListEditor,
  ListRowShell,
} from "./FormPrimitives";

type Props = {
  card: EditorCard;
  onChange: (content: Record<string, unknown>) => void;
  uploadPrefix: string;
  readOnly?: boolean;
};

function moveRow<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir;
  if (next < 0 || next >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

function F(props: React.ComponentProps<typeof FieldInput>) {
  return <FieldInput {...props} />;
}

export function CardContentForm({ card, onChange, uploadPrefix, readOnly }: Props) {
  const c = card.content;
  const ro = readOnly === true;
  const Input = (p: React.ComponentProps<typeof FieldInput>) => <F {...p} editable={!ro} />;
  const set = (next: Record<string, unknown>) => {
    if (!ro) onChange(next);
  };
  const u = (key: string, value: string) => set(patchField(c, key, value));
  const ub = (key: string, value: boolean) => set(patchBool(c, key, value));
  const un = (key: string, value: number) => set(patchNumber(c, key, value));

  if (isBusinessOnlyCard(card.type)) {
    return (
      <>
        <Input label="カード種別" value={cardTypeLabel(card.type)} onChangeText={() => undefined} />
        <Input
          label="タイトル"
          value={fieldStr(c, "title")}
          onChangeText={(v) => u("title", v)}
          placeholder="Business 専用（Web で編集）"
        />
        <Input
          label="本文 / メッセージ"
          value={fieldStr(c, "body") || fieldStr(c, "message") || fieldStr(c, "description")}
          onChangeText={(v) => u("message", v)}
          multiline
        />
      </>
    );
  }

  switch (card.type) {
    case "hero":
      return (
        <>
          <ImagePickUpload
            label="背景画像"
            value={fieldStr(c, "image") || undefined}
            onChange={(uri) => u("image", uri ?? "")}
            uploadPrefix={uploadPrefix}
            height={160}
          />
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="サブタイトル"
            value={fieldStr(c, "subtitle")}
            onChangeText={(v) => u("subtitle", v)}
            multiline
          />
        </>
      );

    case "heading_body":
      return (
        <>
          <Input label="見出し" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="本文"
            value={fieldStr(c, "body")}
            onChangeText={(v) => u("body", v)}
            multiline
          />
          <FieldSwitch
            disabled={ro}
            label="区切り線を表示"
            value={c.dividerEnabled === true}
            onValueChange={(v) => ub("dividerEnabled", v)}
          />
        </>
      );

    case "text":
      return (
        <>
          <Input label="見出し（任意）" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="本文"
            value={fieldStr(c, "content")}
            onChangeText={(v) => u("content", v)}
            multiline
          />
        </>
      );

    case "image":
      return (
        <>
          <ImagePickUpload
            label="画像"
            value={fieldStr(c, "src") || undefined}
            onChange={(uri) => u("src", uri ?? "")}
            uploadPrefix={uploadPrefix}
          />
          <Input label="代替テキスト" value={fieldStr(c, "alt")} onChangeText={(v) => u("alt", v)} />
        </>
      );

    case "gallery": {
      const items = asObjectArray(c.items);
      const list = items.length ? items : [{ src: "", alt: "" }];
      const updateItems = (next: Record<string, unknown>[]) => set({ ...c, items: next });
      return (
        <>
          <Input label="見出し（任意）" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor
            title="画像"
            onAdd={() => updateItems([...list, { src: "", alt: "" }])}
          >
            {list.map((item, index) => (
              <ListRowShell
                key={`gal-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateItems(moveRow(list, index, -1))}
                onDown={() => updateItems(moveRow(list, index, 1))}
                onRemove={() => updateItems(list.filter((_, i) => i !== index).length ? list.filter((_, i) => i !== index) : [{ src: "", alt: "" }])}
              >
                <ImagePickUpload
                  value={fieldStr(item, "src") || undefined}
                  onChange={(uri) => {
                    const next = list.map((row, i) =>
                      i === index ? { ...row, src: uri ?? "" } : row,
                    );
                    updateItems(next);
                  }}
                  uploadPrefix={uploadPrefix}
                  height={100}
                />
                <Input
                  label="キャプション"
                  value={fieldStr(item, "alt")}
                  onChangeText={(v) => {
                    const next = list.map((row, i) => (i === index ? { ...row, alt: v } : row));
                    updateItems(next);
                  }}
                />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "quote":
      return (
        <>
          <Input
            label="引用文"
            value={fieldStr(c, "quote")}
            onChangeText={(v) => u("quote", v)}
            multiline
          />
          <Input label="著者" value={fieldStr(c, "author")} onChangeText={(v) => u("author", v)} />
        </>
      );

    case "action":
    case "button":
      return (
        <>
          <Input
            label="ボタン文言"
            value={fieldStr(c, "label")}
            onChangeText={(v) => u("label", v)}
          />
          <Input
            label="リンク URL"
            value={fieldStr(c, "href")}
            onChangeText={(v) => u("href", v)}
            keyboardType="url"
            placeholder="https://"
          />
        </>
      );

    case "notice":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input label="本文" value={fieldStr(c, "body")} onChangeText={(v) => u("body", v)} multiline />
        </>
      );

    case "highlight":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input label="本文" value={fieldStr(c, "body")} onChangeText={(v) => u("body", v)} multiline />
          <Input label="アクセント色" value={fieldStr(c, "accent")} onChangeText={(v) => u("accent", v)} placeholder="amber / blue" />
        </>
      );

    case "welcome":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="メッセージ"
            value={fieldStr(c, "message")}
            onChangeText={(v) => u("message", v)}
            multiline
          />
        </>
      );

    case "map":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input label="住所" value={fieldStr(c, "address")} onChangeText={(v) => u("address", v)} />
          <Input
            label="地図埋め込み URL"
            value={fieldStr(c, "mapEmbedUrl")}
            onChangeText={(v) => u("mapEmbedUrl", v)}
            keyboardType="url"
          />
        </>
      );

    case "wifi":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input label="SSID" value={fieldStr(c, "ssid")} onChangeText={(v) => u("ssid", v)} />
          <Input label="パスワード" value={fieldStr(c, "password")} onChangeText={(v) => u("password", v)} />
        </>
      );

    case "schedule": {
      const items = asObjectArray(c.items);
      const list = items.length ? items : [{ day: "", time: "", label: "" }];
      const updateItems = (next: Record<string, unknown>[]) => set({ ...c, items: next });
      return (
        <>
          <Input label="見出し" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor title="予定" onAdd={() => updateItems([...list, { day: "", time: "", label: "" }])}>
            {list.map((item, index) => (
              <ListRowShell
                key={`sch-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateItems(moveRow(list, index, -1))}
                onDown={() => updateItems(moveRow(list, index, 1))}
                onRemove={() =>
                  updateItems(
                    list.length <= 1 ? [{ day: "", time: "", label: "" }] : list.filter((_, i) => i !== index),
                  )
                }
              >
                <Input label="日・区分" value={fieldStr(item, "day")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, day: v } : row));
                  updateItems(next);
                }} />
                <Input label="時間" value={fieldStr(item, "time")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, time: v } : row));
                  updateItems(next);
                }} />
                <Input label="内容" value={fieldStr(item, "label")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, label: v } : row));
                  updateItems(next);
                }} multiline />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "checklist": {
      const items = asObjectArray(c.items);
      const list = items.length ? items : [{ text: "", checked: false }];
      const updateItems = (next: Record<string, unknown>[]) => set({ ...c, items: next });
      return (
        <>
          <Input label="見出し" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor title="項目" onAdd={() => updateItems([...list, { text: "", checked: false }])}>
            {list.map((item, index) => (
              <ListRowShell
                key={`chk-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateItems(moveRow(list, index, -1))}
                onDown={() => updateItems(moveRow(list, index, 1))}
                onRemove={() =>
                  updateItems(
                    list.length <= 1 ? [{ text: "", checked: false }] : list.filter((_, i) => i !== index),
                  )
                }
              >
                <Input
                  label="テキスト"
                  value={fieldStr(item, "text")}
                  onChangeText={(v) => {
                    const next = list.map((row, i) => (i === index ? { ...row, text: v } : row));
                    updateItems(next);
                  }}
                />
                <FieldSwitch
                  disabled={ro}
                  label="チェック済み"
                  value={item.checked === true}
                  onValueChange={(v) => {
                    const next = list.map((row, i) => (i === index ? { ...row, checked: v } : row));
                    updateItems(next);
                  }}
                />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "steps": {
      const items = asObjectArray(c.items);
      const list = items.length ? items : [{ title: "", description: "" }];
      const updateItems = (next: Record<string, unknown>[]) => set({ ...c, items: next });
      return (
        <>
          <Input label="見出し" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor title="ステップ" onAdd={() => updateItems([...list, { title: "", description: "" }])}>
            {list.map((item, index) => (
              <ListRowShell
                key={`stp-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateItems(moveRow(list, index, -1))}
                onDown={() => updateItems(moveRow(list, index, 1))}
                onRemove={() =>
                  updateItems(
                    list.length <= 1 ? [{ title: "", description: "" }] : list.filter((_, i) => i !== index),
                  )
                }
              >
                <Input
                  label="タイトル"
                  value={fieldStr(item, "title")}
                  onChangeText={(v) => {
                    const next = list.map((row, i) => (i === index ? { ...row, title: v } : row));
                    updateItems(next);
                  }}
                />
                <Input
                  label="説明"
                  value={fieldStr(item, "description")}
                  onChangeText={(v) => {
                    const next = list.map((row, i) => (i === index ? { ...row, description: v } : row));
                    updateItems(next);
                  }}
                  multiline
                />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "nearby": {
      const items = asObjectArray(c.items);
      const list = items.length ? items : [{ name: "", description: "", link: "" }];
      const updateItems = (next: Record<string, unknown>[]) => set({ ...c, items: next });
      return (
        <>
          <Input label="見出し" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor title="スポット" onAdd={() => updateItems([...list, { name: "", description: "", link: "" }])}>
            {list.map((item, index) => (
              <ListRowShell
                key={`near-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateItems(moveRow(list, index, -1))}
                onDown={() => updateItems(moveRow(list, index, 1))}
                onRemove={() =>
                  updateItems(
                    list.length <= 1 ? [{ name: "", description: "", link: "" }] : list.filter((_, i) => i !== index),
                  )
                }
              >
                <Input label="名前" value={fieldStr(item, "name")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, name: v } : row));
                  updateItems(next);
                }} />
                <Input label="説明" value={fieldStr(item, "description")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, description: v } : row));
                  updateItems(next);
                }} multiline />
                <Input label="リンク" value={fieldStr(item, "link")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, link: v } : row));
                  updateItems(next);
                }} keyboardType="url" />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "compare": {
      const rows = asObjectArray(c.pricingRows);
      const list = rows.length ? rows : [{ label: "", values: ["", ""] }];
      const updateRows = (next: Record<string, unknown>[]) => set({ ...c, layout: "pricing", pricingRows: next });
      return (
        <>
          <Input label="表タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor title="料金行" onAdd={() => updateRows([...list, { label: "", values: [""] }])}>
            {list.map((row, index) => (
              <ListRowShell
                key={`cmp-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateRows(moveRow(list, index, -1))}
                onDown={() => updateRows(moveRow(list, index, 1))}
                onRemove={() =>
                  updateRows(list.length <= 1 ? [{ label: "", values: [""] }] : list.filter((_, i) => i !== index))
                }
              >
                <Input label="項目名" value={fieldStr(row, "label")} onChangeText={(v) => {
                  const next = list.map((r, i) => (i === index ? { ...r, label: v } : r));
                  updateRows(next);
                }} />
                <Input
                  label="値（カンマ区切りで複数列）"
                  value={Array.isArray(row.values) ? (row.values as string[]).join(", ") : ""}
                  onChangeText={(v) => {
                    const values = v.split(",").map((s) => s.trim());
                    const next = list.map((r, i) => (i === index ? { ...r, values } : r));
                    updateRows(next);
                  }}
                />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "info": {
      const rows = asObjectArray(c.rows);
      const list = rows.length ? rows : [{ label: "", value: "" }];
      const updateRows = (next: Record<string, unknown>[]) => set({ ...c, rows: next });
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input label="アイコン" value={fieldStr(c, "icon")} onChangeText={(v) => u("icon", v)} placeholder="wifi / info" />
          <ListEditor title="行" onAdd={() => updateRows([...list, { label: "", value: "" }])}>
            {list.map((row, index) => (
              <ListRowShell
                key={`info-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateRows(moveRow(list, index, -1))}
                onDown={() => updateRows(moveRow(list, index, 1))}
                onRemove={() =>
                  updateRows(list.length <= 1 ? [{ label: "", value: "" }] : list.filter((_, i) => i !== index))
                }
              >
                <Input label="ラベル" value={fieldStr(row, "label")} onChangeText={(v) => {
                  const next = list.map((r, i) => (i === index ? { ...r, label: v } : r));
                  updateRows(next);
                }} />
                <Input label="値" value={fieldStr(row, "value")} onChangeText={(v) => {
                  const next = list.map((r, i) => (i === index ? { ...r, value: v } : r));
                  updateRows(next);
                }} />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "faq": {
      const items = asObjectArray(c.items);
      const list = items.length ? items : [{ q: "", a: "" }];
      const updateItems = (next: Record<string, unknown>[]) => set({ ...c, items: next });
      return (
        <>
          <Input label="見出し" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <ListEditor title="Q&A" onAdd={() => updateItems([...list, { q: "", a: "" }])}>
            {list.map((item, index) => (
              <ListRowShell
                key={`faq-${index}`}
                index={index}
                total={list.length}
                onUp={() => updateItems(moveRow(list, index, -1))}
                onDown={() => updateItems(moveRow(list, index, 1))}
                onRemove={() =>
                  updateItems(list.length <= 1 ? [{ q: "", a: "" }] : list.filter((_, i) => i !== index))
                }
              >
                <Input label="質問" value={fieldStr(item, "q")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, q: v } : row));
                  updateItems(next);
                }} />
                <Input label="回答" value={fieldStr(item, "a")} onChangeText={(v) => {
                  const next = list.map((row, i) => (i === index ? { ...row, a: v } : row));
                  updateItems(next);
                }} multiline />
              </ListRowShell>
            ))}
          </ListEditor>
        </>
      );
    }

    case "divider":
      return (
        <Input
          label="スタイル"
          value={fieldStr(c, "style")}
          onChangeText={(v) => u("style", v)}
          placeholder="line / dashed"
        />
      );

    case "space": {
      const h = typeof c.height === "number" ? c.height : Number(fieldStr(c, "height")) || 48;
      return (
        <Input
          label="高さ（px）"
          value={String(h)}
          onChangeText={(v) => {
            const n = parseInt(v, 10);
            un("height", Number.isFinite(n) ? n : 48);
          }}
          keyboardType="default"
        />
      );
    }

    case "video":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="動画 URL"
            value={fieldStr(c, "videoUrl")}
            onChangeText={(v) => u("videoUrl", v)}
            keyboardType="url"
          />
          <Input label="キャプション" value={fieldStr(c, "caption")} onChangeText={(v) => u("caption", v)} />
        </>
      );

    case "checkout":
    case "breakfast":
    case "spa":
    case "restaurant":
    case "laundry":
    case "taxi":
    case "emergency":
    case "parking":
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="時間"
            value={fieldStr(c, "time") || fieldStr(c, "hours")}
            onChangeText={(v) => u("time", v)}
          />
          <Input label="場所" value={fieldStr(c, "location")} onChangeText={(v) => u("location", v)} />
          <Input
            label="説明 / メニュー"
            value={fieldStr(c, "menu") || fieldStr(c, "description") || fieldStr(c, "note")}
            onChangeText={(v) => u("menu", v)}
            multiline
          />
          <Input label="電話" value={fieldStr(c, "phone")} onChangeText={(v) => u("phone", v)} />
          <Input
            label="リンク"
            value={fieldStr(c, "linkUrl")}
            onChangeText={(v) => u("linkUrl", v)}
            keyboardType="url"
          />
        </>
      );

    default:
      return (
        <>
          <Input label="タイトル" value={fieldStr(c, "title")} onChangeText={(v) => u("title", v)} />
          <Input
            label="本文"
            value={
              fieldStr(c, "body") ||
              fieldStr(c, "content") ||
              fieldStr(c, "message") ||
              fieldStr(c, "description")
            }
            onChangeText={(v) => u("body", v)}
            multiline
          />
          <Input label="リンク" value={fieldStr(c, "href") || fieldStr(c, "ctaUrl")} onChangeText={(v) => u("href", v)} keyboardType="url" />
        </>
      );
  }
}
