"use client";

import type { ChangeEvent, ComponentType } from "react";
import {
  facilityDefaultIcon,
  facilityFieldLabel,
  facilityTitlePlaceholder,
  getFacilityInfoPreset,
  isFacilityFieldVisible,
  optionalFieldFlagKey,
  readFacilityFieldValue,
} from "@/lib/editor/facility-info-presets";
import { IconTokenSelect } from "./IconTokenSelect";

type FacilityInfoSettingsFieldsProps = {
  type: string;
  content: Record<string, unknown>;
  display: (key: string) => string;
  updateLocalized: (key: string, value: string) => void;
  update: (key: string, value: unknown) => void;
  /** Merge multiple content keys in one write (avoids stale overwrite). */
  patchContent: (patch: Record<string, unknown>) => void;
  inputClass: string;
  labelClass: string;
  checkboxRowClass: string;
  Input: ComponentType<{
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }>;
};

/** Shared settings fields for facility label-row presets — per-label show/hide. */
export function FacilityInfoSettingsFields({
  type,
  content,
  display,
  updateLocalized,
  update,
  patchContent,
  inputClass,
  labelClass,
  checkboxRowClass,
  Input,
}: FacilityInfoSettingsFieldsProps) {
  const preset = getFacilityInfoPreset(type);
  if (!preset) return null;

  const iconValue = typeof content.icon === "string" ? content.icon : facilityDefaultIcon(type);

  return (
    <>
      <Input
        label="タイトル"
        value={display("title")}
        onChange={(e) => updateLocalized("title", e.target.value)}
        placeholder={facilityTitlePlaceholder(preset, "ja")}
      />
      <IconTokenSelect
        label="アイコン"
        value={iconValue}
        onChange={(next) => update("icon", next)}
        allowEmpty
        className={inputClass}
        labelClassName={labelClass}
      />
      {preset.fields.map((field) => {
        const visible = isFacilityFieldVisible(content, field, "ja");
        const flagKey = optionalFieldFlagKey(field.key);
        const label = facilityFieldLabel(field, "ja");
        const value =
          field.key === "phone" || field.key === "contact"
            ? String(content[field.key] ?? "")
            : readFacilityFieldValue(content, field.key, "ja");

        return (
          <div key={field.key} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/40 px-2.5 py-2">
            <label className={checkboxRowClass + " min-h-0 px-0"}>
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => patchContent({ [flagKey]: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-ds-primary focus:ring-ds-primary"
              />
              <span>{label}を表示</span>
            </label>
            {visible ? (
              <>
                <Input
                  label="見出し"
                  value={
                    typeof (content.labelOverrides as Record<string, string> | undefined)?.[field.key] ===
                    "string"
                      ? (content.labelOverrides as Record<string, string>)[field.key]
                      : label
                  }
                  onChange={(e) => {
                    const prev = (content.labelOverrides as Record<string, string> | undefined) ?? {};
                    patchContent({ labelOverrides: { ...prev, [field.key]: e.target.value } });
                  }}
                  placeholder={label}
                />
                {field.multiline ? (
                  <div className="w-full">
                    <label className={labelClass}>本文</label>
                    <textarea
                      value={value}
                      onChange={(e) => updateLocalized(field.key, e.target.value)}
                      placeholder={field.placeholder || "任意"}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <Input
                    label="本文"
                    value={value}
                    onChange={(e) => {
                      if (field.key === "phone" || field.key === "contact") update(field.key, e.target.value);
                      else updateLocalized(field.key, e.target.value);
                    }}
                    placeholder={field.placeholder}
                  />
                )}
              </>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
