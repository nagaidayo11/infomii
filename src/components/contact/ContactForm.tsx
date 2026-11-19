"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { Button, Input } from "@/components/ui";
import { openUrlViaNativeApp } from "@/lib/native-app-bridge";
import {
  CONTACT_MESSAGE_MAX,
  CONTACT_TOPICS,
  buildBlankContactMailto,
  buildContactMailto,
  isContactTopicId,
  type ContactTopicId,
  validateContactPayload,
} from "@/lib/contact";
import { SUPPORT_EMAIL } from "@/lib/app-store-compliance";

function openMailto(href: string): boolean {
  if (typeof window === "undefined") return false;
  if (openUrlViaNativeApp(href)) return true;
  try {
    const link = document.createElement("a");
    link.href = href;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch {
    window.location.assign(href);
    return true;
  }
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isAppShell } = useClientShell();
  const topicFromUrl = searchParams.get("topic");

  const [topic, setTopic] = useState<ContactTopicId>(
    isContactTopicId(topicFromUrl) ? topicFromUrl : "consult",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    setEmail((current) => current || user.email || "");
  }, [user?.email]);

  useEffect(() => {
    if (isContactTopicId(topicFromUrl)) setTopic(topicFromUrl);
  }, [topicFromUrl]);

  const parsed = useMemo(
    () => validateContactPayload({ topic, message, email, name }),
    [topic, message, email, name],
  );
  const mailtoHref = parsed.ok ? buildContactMailto(parsed.value) : buildBlankContactMailto();

  const chipClass = (active: boolean) =>
    isAppShell
      ? [
          "app-pressable min-h-[40px] rounded-full border px-3 py-1.5 text-sm",
          active
            ? "border-[var(--app-accent)] bg-[var(--app-accent)]/10 font-semibold text-[var(--app-accent)]"
            : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)]",
        ].join(" ")
      : [
          "min-h-[40px] rounded-full border px-3 py-1.5 text-sm transition",
          active
            ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-800"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
        ].join(" ");

  const textareaClass = isAppShell
    ? "w-full min-h-[160px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
    : "w-full min-h-[160px] rounded-ds border border-ds-border bg-ds-card px-3 py-2.5 text-sm text-ds-foreground outline-none placeholder:text-ds-placeholder focus:border-ds-primary focus:ring-2 focus:ring-ds-ring-primary";

  const remaining = CONTACT_MESSAGE_MAX - message.length;
  const quietLinkClass = isAppShell
    ? "text-sm text-[var(--app-text-muted)] underline-offset-2 hover:underline"
    : "text-sm text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline";

  function launchMail(href: string) {
    setError(null);
    openMailto(href);
    setOpened(true);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parsed.ok) {
      setOpened(false);
      setError(parsed.error);
      return;
    }
    launchMail(buildContactMailto(parsed.value));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <fieldset>
        <legend className={isAppShell ? "mb-2 text-sm font-medium text-[var(--app-text)]" : "mb-2 text-sm font-medium text-slate-800"}>
          内容の種類
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={chipClass(topic === item.id)}
              aria-pressed={topic === item.id}
              onClick={() => setTopic(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="contact-message"
          className={isAppShell ? "mb-1.5 block text-sm font-medium text-[var(--app-text)]" : "mb-1.5 block text-xs font-medium text-ds-muted"}
        >
          本文
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={CONTACT_MESSAGE_MAX}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={textareaClass}
          placeholder={
            topic === "feature"
              ? "こういうブロックが欲しい、など。ざっくりで大丈夫です。"
              : topic === "usability"
                ? "どこでつまずいたか、わかればページ名もあると助かります。"
                : "導入の相談、使い方、なんでもどうぞ。"
          }
        />
        <p className={isAppShell ? "mt-1 text-xs text-[var(--app-text-muted)]" : "mt-1 text-xs text-slate-500"}>
          残り {remaining} 文字
        </p>
      </div>

      <Input
        id="contact-email"
        label="返信先メール"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <Input
        id="contact-name"
        label="お名前（任意）"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="施設名でも構いません"
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {opened ? (
        <p className={isAppShell ? "text-sm text-[var(--app-text-muted)]" : "text-sm text-slate-600"} role="status">
          メールアプリを開きました。本文を確認して送信してください。開かない場合は下のリンクからどうぞ。
        </p>
      ) : (
        <p className={isAppShell ? "text-sm text-[var(--app-text-muted)]" : "text-sm text-slate-500"}>
          ボタンを押すとメールアプリが開き、宛先・件名・本文が入った状態になります。
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {parsed.ok ? (
          <Button
            href={mailtoHref}
            className="min-h-[44px]"
            onClick={(event) => {
              if (openUrlViaNativeApp(mailtoHref)) event.preventDefault();
              setError(null);
              setOpened(true);
            }}
          >
            メールアプリで送る
          </Button>
        ) : (
          <Button type="submit" className="min-h-[44px]">
            メールアプリで送る
          </Button>
        )}
        <a href={buildBlankContactMailto()} className={quietLinkClass}>
          {SUPPORT_EMAIL} へ空のメールを開く
        </a>
      </div>
    </form>
  );
}
