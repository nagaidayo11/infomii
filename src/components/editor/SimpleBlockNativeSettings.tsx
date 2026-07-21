"use client";

import type { ReactNode } from "react";
import {
  AppFieldInput,
  AppFieldLabel,
  AppFieldTextarea,
  AppOptionCard,
  AppOptionCardRow,
  AppSectionHeader,
} from "@/components/app-shell/primitives";

type FieldProps = {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
};

type LocalizedFieldProps = FieldProps & {
  display: (key: string) => string;
  updateLocalized: (key: string, value: string) => void;
};

function NativeField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppFieldLabel>{label}</AppFieldLabel>
      {children}
    </div>
  );
}

function NativeToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-[var(--app-tap-min)] items-center gap-3 rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-[var(--app-surface)] px-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)]"
      />
      <span className="text-sm font-medium text-[var(--app-text)]">{label}</span>
    </label>
  );
}

export function TextNativeSettings({
  display,
  updateLocalized,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="テキスト">
        <AppFieldTextarea
          value={display("content")}
          onChange={(e) => updateLocalized("content", e.target.value)}
          placeholder="見出しまたは本文"
          rows={4}
        />
      </NativeField>
    </div>
  );
}

export function HeadingBodyNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
}: LocalizedFieldProps) {
  const dividerEnabled = content.dividerEnabled === true;
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="見出しテキスト"
        />
      </NativeField>
      <NativeField label="本文">
        <AppFieldTextarea
          value={display("body")}
          onChange={(e) => updateLocalized("body", e.target.value)}
          placeholder="本文テキスト"
          rows={4}
        />
      </NativeField>
      <NativeToggle
        checked={dividerEnabled}
        onChange={(v) => onUpdate("dividerEnabled", v)}
        label="区切り線を表示"
      />
      {dividerEnabled ? (
        <div>
          <AppSectionHeader title="線種" as="p" />
          <AppOptionCardRow className="mt-2">
            <AppOptionCard
              selected={(content.dividerStyle as string) !== "dashed"}
              onClick={() => onUpdate("dividerStyle", "solid")}
              label="実線"
            />
            <AppOptionCard
              selected={(content.dividerStyle as string) === "dashed"}
              onClick={() => onUpdate("dividerStyle", "dashed")}
              label="破線"
            />
          </AppOptionCardRow>
        </div>
      ) : null}
    </div>
  );
}

export function ButtonNativeSettings({
  display,
  updateLocalized,
  onUpdate,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized" | "onUpdate">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="ラベル">
        <AppFieldInput
          value={display("label")}
          onChange={(e) => updateLocalized("label", e.target.value)}
          placeholder="ボタンテキスト"
        />
      </NativeField>
      <NativeField label="リンク">
        <AppFieldInput
          value={display("href")}
          onChange={(e) => onUpdate("href", e.target.value)}
          placeholder="https://..."
        />
      </NativeField>
    </div>
  );
}

export function QuoteNativeSettings({
  display,
  updateLocalized,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="引用文">
        <AppFieldTextarea
          value={display("quote")}
          onChange={(e) => updateLocalized("quote", e.target.value)}
          placeholder="引用文"
          rows={3}
        />
      </NativeField>
      <NativeField label="出典・著者">
        <AppFieldInput
          value={display("author")}
          onChange={(e) => updateLocalized("author", e.target.value)}
          placeholder="フロント / レビュー投稿者"
        />
      </NativeField>
    </div>
  );
}

export function MapNativeSettings({
  display,
  updateLocalized,
  onUpdate,
  content,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized" | "onUpdate"> & {
  content?: Record<string, unknown>;
}) {
  const pins = (Array.isArray(content?.pins) ? content.pins : []) as Array<{
    name?: string;
    walk?: string;
    note?: string;
  }>;
  const accentColor =
    typeof content?.accentColor === "string" && content.accentColor.trim()
      ? content.accentColor.trim()
      : "#0f766e";

  const setPins = (next: typeof pins) => onUpdate("pins", next);
  const updatePin = (index: number, field: "name" | "walk" | "note", value: string) => {
    const next = [...pins];
    next[index] = { ...(next[index] ?? {}), [field]: value };
    setPins(next);
  };

  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="例: 場所"
        />
      </NativeField>
      <NativeField label="住所">
        <AppFieldTextarea
          value={display("address")}
          onChange={(e) => updateLocalized("address", e.target.value)}
          placeholder="住所または場所名"
          rows={2}
        />
      </NativeField>
      <NativeField label="Googleマップ埋め込み">
        <AppFieldTextarea
          value={display("mapEmbedUrl")}
          onChange={(e) => onUpdate("mapEmbedUrl", e.target.value)}
          placeholder="共有URL または iframe埋め込みコード"
          rows={3}
        />
      </NativeField>
      <p className="text-xs text-[var(--app-text-muted)]">
        共有URL・「地図を埋め込む」のiframeコードのどちらでもOKです。
      </p>
      <NativeField label="アクセント色">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => onUpdate("accentColor", e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-[var(--app-radius-md)] border border-[var(--app-border)] bg-white"
          />
          <AppFieldInput
            value={accentColor}
            onChange={(e) => onUpdate("accentColor", e.target.value)}
            placeholder="#0f766e"
          />
        </div>
      </NativeField>
      <div>
        <AppSectionHeader
          title="周辺ピン"
          trailing={
            <button
              type="button"
              onClick={() => setPins([...pins, { name: "新規スポット", walk: "", note: "" }])}
              className="app-native-add-btn ui-pop-tap"
            >
              + 追加
            </button>
          }
        />
        <div className="mt-2 space-y-3">
          {pins.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">周辺スポットを追加できます</p>
          ) : (
            pins.map((pin, i) => (
              <div
                key={i}
                className="space-y-2 rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPins(pins.filter((_, idx) => idx !== i))}
                    className="app-native-settings-action app-native-settings-action--danger"
                  >
                    削除
                  </button>
                </div>
                <NativeField label="スポット名">
                  <AppFieldInput
                    value={pin.name ?? ""}
                    onChange={(e) => updatePin(i, "name", e.target.value)}
                    placeholder="コンビニ"
                  />
                </NativeField>
                <NativeField label="徒歩目安">
                  <AppFieldInput
                    value={pin.walk ?? ""}
                    onChange={(e) => updatePin(i, "walk", e.target.value)}
                    placeholder="徒歩2分"
                  />
                </NativeField>
                <NativeField label="補足">
                  <AppFieldInput
                    value={pin.note ?? ""}
                    onChange={(e) => updatePin(i, "note", e.target.value)}
                    placeholder="24時間営業"
                  />
                </NativeField>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function WelcomeNativeSettings({
  display,
  updateLocalized,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="ようこそ"
        />
      </NativeField>
      <NativeField label="メッセージ">
        <AppFieldTextarea
          value={display("message")}
          onChange={(e) => updateLocalized("message", e.target.value)}
          placeholder="おもてなしメッセージ"
          rows={3}
        />
      </NativeField>
    </div>
  );
}

export function CheckoutNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
  patchContent,
}: LocalizedFieldProps & {
  patchContent: (patch: Record<string, unknown>) => void;
}) {
  const showTime = content.show_time !== false;
  const showNote =
    content.show_note === true || (content.show_note !== false && Boolean(display("note")));

  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="チェックアウト"
        />
      </NativeField>
      <NativeToggle
        checked={showTime}
        onChange={(v) => patchContent({ show_time: v })}
        label="時刻を表示"
      />
      {showTime ? (
        <NativeField label="時間">
          <AppFieldInput
            value={display("time")}
            onChange={(e) => updateLocalized("time", e.target.value)}
            placeholder="11:00"
          />
        </NativeField>
      ) : null}
      <NativeToggle
        checked={showNote}
        onChange={(v) => patchContent({ show_note: v })}
        label="補足を表示"
      />
      {showNote ? (
        <NativeField label="補足">
          <AppFieldInput
            value={display("note")}
            onChange={(e) => updateLocalized("note", e.target.value)}
            placeholder="任意"
          />
        </NativeField>
      ) : null}
      <NativeField label="リンクURL">
        <AppFieldInput
          value={display("linkUrl")}
          onChange={(e) => onUpdate("linkUrl", e.target.value)}
          placeholder="https://..."
        />
      </NativeField>
      <NativeField label="リンクラベル">
        <AppFieldInput
          value={display("linkLabel")}
          onChange={(e) => updateLocalized("linkLabel", e.target.value)}
          placeholder="詳細"
        />
      </NativeField>
    </div>
  );
}

export function NoticeNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
}: LocalizedFieldProps) {
  const variant = (content.variant as string) ?? "info";
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="お知らせ"
        />
      </NativeField>
      <NativeField label="本文">
        <AppFieldTextarea
          value={display("body")}
          onChange={(e) => updateLocalized("body", e.target.value)}
          placeholder="お知らせ内容"
          rows={3}
        />
      </NativeField>
      <div>
        <AppSectionHeader title="重要度" as="p" />
        <AppOptionCardRow className="mt-2">
          <AppOptionCard
            selected={variant !== "warning"}
            onClick={() => onUpdate("variant", "info")}
            label="お知らせ"
          />
          <AppOptionCard
            selected={variant === "warning"}
            onClick={() => onUpdate("variant", "warning")}
            label="ご注意"
          />
        </AppOptionCardRow>
      </div>
    </div>
  );
}

export function HighlightNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
}: LocalizedFieldProps) {
  const accent = (content.accent as string) ?? "amber";
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="重要なお知らせ"
        />
      </NativeField>
      <NativeField label="本文">
        <AppFieldTextarea
          value={display("body")}
          onChange={(e) => updateLocalized("body", e.target.value)}
          placeholder="強調したい内容"
          rows={3}
        />
      </NativeField>
      <div>
        <AppSectionHeader title="アクセント" as="p" />
        <AppOptionCardRow className="mt-2 !grid-cols-3">
          <AppOptionCard
            selected={accent === "amber"}
            onClick={() => onUpdate("accent", "amber")}
            label="アンバー"
          />
          <AppOptionCard
            selected={accent === "blue"}
            onClick={() => onUpdate("accent", "blue")}
            label="ブルー"
          />
          <AppOptionCard
            selected={accent === "emerald"}
            onClick={() => onUpdate("accent", "emerald")}
            label="エメラルド"
          />
        </AppOptionCardRow>
      </div>
    </div>
  );
}

export function ContactHubNativeSettings({
  display,
  updateLocalized,
  onUpdate,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized" | "onUpdate">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="お問い合わせ"
        />
      </NativeField>
      <NativeField label="電話番号">
        <AppFieldInput
          value={display("phone")}
          onChange={(e) => onUpdate("phone", e.target.value)}
          placeholder="03-1234-5678"
        />
      </NativeField>
      <NativeField label="メール">
        <AppFieldInput
          value={display("email")}
          onChange={(e) => onUpdate("email", e.target.value)}
          placeholder="front@example.com"
        />
      </NativeField>
      <NativeField label="LINE URL">
        <AppFieldInput
          value={display("lineUrl")}
          onChange={(e) => onUpdate("lineUrl", e.target.value)}
          placeholder="https://..."
        />
      </NativeField>
      <NativeField label="地図URL">
        <AppFieldInput
          value={display("mapUrl")}
          onChange={(e) => onUpdate("mapUrl", e.target.value)}
          placeholder="https://..."
        />
      </NativeField>
      <NativeField label="補足">
        <AppFieldTextarea
          value={display("note")}
          onChange={(e) => updateLocalized("note", e.target.value)}
          rows={2}
        />
      </NativeField>
    </div>
  );
}

export function ImageNativeSettings({
  display,
  updateLocalized,
  children,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized"> & {
  children?: ReactNode;
}) {
  return (
    <div className="app-native-settings space-y-5">
      {children}
      <NativeField label="代替テキスト">
        <AppFieldInput
          value={display("alt")}
          onChange={(e) => updateLocalized("alt", e.target.value)}
          placeholder="画像の説明"
        />
      </NativeField>
    </div>
  );
}

export function HeroNativeSettings({
  display,
  updateLocalized,
  children,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized"> & {
  children?: ReactNode;
}) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="Infomii Hotel"
        />
      </NativeField>
      <NativeField label="サブタイトル">
        <AppFieldInput
          value={display("subtitle")}
          onChange={(e) => updateLocalized("subtitle", e.target.value)}
          placeholder="任意"
        />
      </NativeField>
      {children}
    </div>
  );
}

export function EmergencyNativeSettings({
  display,
  updateLocalized,
  onUpdate,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized" | "onUpdate">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="緊急連絡先"
        />
      </NativeField>
      <NativeField label="消防">
        <AppFieldInput
          value={display("fire")}
          onChange={(e) => onUpdate("fire", e.target.value)}
          placeholder="119"
        />
      </NativeField>
      <NativeField label="警察">
        <AppFieldInput
          value={display("police")}
          onChange={(e) => onUpdate("police", e.target.value)}
          placeholder="110"
        />
      </NativeField>
      <NativeField label="病院">
        <AppFieldInput
          value={display("hospital")}
          onChange={(e) => updateLocalized("hospital", e.target.value)}
          placeholder="病院名・電話"
        />
      </NativeField>
      <NativeField label="補足">
        <AppFieldInput
          value={display("note")}
          onChange={(e) => updateLocalized("note", e.target.value)}
          placeholder="任意"
        />
      </NativeField>
    </div>
  );
}

export function OpenStatusNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
}: FieldProps & {
  display: (key: string) => string;
  updateLocalized: (key: string, value: string) => void;
}) {
  const mode = content.mode === "hours" ? "hours" : "manual";
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="営業時間"
        />
      </NativeField>
      <div>
        <AppSectionHeader title="判定方法" as="p" />
        <AppOptionCardRow className="mt-2">
          <AppOptionCard
            selected={mode === "manual"}
            onClick={() => onUpdate("mode", "manual")}
            label="手動"
          />
          <AppOptionCard
            selected={mode === "hours"}
            onClick={() => onUpdate("mode", "hours")}
            label="時間帯"
          />
        </AppOptionCardRow>
      </div>
      {mode === "manual" ? (
        <NativeToggle
          checked={content.openNow !== false}
          onChange={(v) => onUpdate("openNow", v)}
          label="いま営業中"
        />
      ) : (
        <>
          <NativeField label="開始時">
            <AppFieldInput
              type="number"
              value={String(content.startHour ?? 7)}
              onChange={(e) => onUpdate("startHour", Number(e.target.value) || 0)}
            />
          </NativeField>
          <NativeField label="終了時">
            <AppFieldInput
              type="number"
              value={String(content.endHour ?? 23)}
              onChange={(e) => onUpdate("endHour", Number(e.target.value) || 0)}
            />
          </NativeField>
        </>
      )}
      <NativeField label="営業中ラベル">
        <AppFieldInput
          value={display("openLabel")}
          onChange={(e) => updateLocalized("openLabel", e.target.value)}
          placeholder="営業中"
        />
      </NativeField>
      <NativeField label="営業時間外ラベル">
        <AppFieldInput
          value={display("closedLabel")}
          onChange={(e) => updateLocalized("closedLabel", e.target.value)}
          placeholder="営業時間外"
        />
      </NativeField>
      <NativeField label="営業時間テキスト">
        <AppFieldInput
          value={display("hoursText")}
          onChange={(e) => updateLocalized("hoursText", e.target.value)}
          placeholder="7:00-23:00"
        />
      </NativeField>
    </div>
  );
}

export function CouponNativeSettings({
  display,
  updateLocalized,
  onUpdate,
}: Pick<LocalizedFieldProps, "display" | "updateLocalized" | "onUpdate">) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="ご宿泊者限定クーポン"
        />
      </NativeField>
      <NativeField label="クーポンコード">
        <AppFieldInput
          value={display("code")}
          onChange={(e) => onUpdate("code", e.target.value)}
          placeholder="WELCOME10"
        />
      </NativeField>
      <NativeField label="有効期限">
        <AppFieldInput
          value={display("expiryText")}
          onChange={(e) => onUpdate("expiryText", e.target.value)}
          placeholder="有効期限: 2026/12/31"
        />
      </NativeField>
      <NativeField label="注意事項">
        <AppFieldTextarea
          value={display("notes")}
          onChange={(e) => onUpdate("notes", e.target.value)}
          placeholder="利用条件や注意点"
          rows={2}
        />
      </NativeField>
      <NativeField label="CTAラベル（任意）">
        <AppFieldInput
          value={display("ctaLabel")}
          onChange={(e) => onUpdate("ctaLabel", e.target.value)}
          placeholder="詳細を見る"
        />
      </NativeField>
      <NativeField label="CTAリンクURL（任意）">
        <AppFieldInput
          value={display("ctaUrl")}
          onChange={(e) => onUpdate("ctaUrl", e.target.value)}
          placeholder="https://..."
        />
      </NativeField>
    </div>
  );
}

export function CampaignTimerNativeSettings({
  content,
  onUpdate,
  display,
  updateLocalized,
  isoToLocalInput,
  localInputToIso,
}: LocalizedFieldProps & {
  isoToLocalInput: (value: unknown) => string;
  localInputToIso: (value: string) => string;
}) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput
          value={display("title")}
          onChange={(e) => updateLocalized("title", e.target.value)}
          placeholder="キャンペーン名"
        />
      </NativeField>
      <NativeField label="説明">
        <AppFieldTextarea
          value={display("description")}
          onChange={(e) => updateLocalized("description", e.target.value)}
          placeholder="任意"
          rows={3}
        />
      </NativeField>
      <NativeField label="開始日時">
        <AppFieldInput
          type="datetime-local"
          value={isoToLocalInput(content.startAt)}
          onChange={(e) => onUpdate("startAt", localInputToIso(e.target.value))}
        />
      </NativeField>
      <NativeField label="終了日時">
        <AppFieldInput
          type="datetime-local"
          value={isoToLocalInput(content.endAt)}
          onChange={(e) => onUpdate("endAt", localInputToIso(e.target.value))}
        />
      </NativeField>
      <NativeToggle
        checked={content.hideBeforeStart === true}
        onChange={(v) => onUpdate("hideBeforeStart", v)}
        label="開始前は非表示"
      />
      <NativeToggle
        checked={content.hideAfterEnd === true}
        onChange={(v) => onUpdate("hideAfterEnd", v)}
        label="終了後は非表示"
      />
      <NativeToggle
        checked={content.showSeconds !== false}
        onChange={(v) => onUpdate("showSeconds", v)}
        label="秒を表示"
      />
      <NativeField label="CTAラベル">
        <AppFieldInput
          value={display("ctaLabel")}
          onChange={(e) => onUpdate("ctaLabel", e.target.value)}
          placeholder="詳細を見る"
        />
      </NativeField>
      <NativeField label="CTA URL">
        <AppFieldInput
          value={display("ctaUrl")}
          onChange={(e) => onUpdate("ctaUrl", e.target.value)}
          placeholder="https://..."
        />
      </NativeField>
    </div>
  );
}

/** Lightweight native chrome around existing menu item editors. */
export function MenuShellNativeSettings({
  title,
  onTitleChange,
  titlePlaceholder,
  children,
}: {
  title: string;
  onTitleChange: (value: string) => void;
  titlePlaceholder: string;
  children: ReactNode;
}) {
  return (
    <div className="app-native-settings space-y-5">
      <NativeField label="タイトル">
        <AppFieldInput value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder={titlePlaceholder} />
      </NativeField>
      {children}
    </div>
  );
}
