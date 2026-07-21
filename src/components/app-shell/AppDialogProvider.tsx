"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppBottomSheet } from "./primitives/AppBottomSheet";

export type AppConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export type AppPromptOptions = {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Return error message when invalid, or null when OK */
  validate?: (value: string) => string | null;
};

export type AppAlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
};

type DialogState =
  | ({
      kind: "confirm";
      resolve: (value: boolean) => void;
    } & AppConfirmOptions)
  | ({
      kind: "prompt";
      resolve: (value: string | null) => void;
    } & AppPromptOptions)
  | ({
      kind: "alert";
      resolve: () => void;
    } & AppAlertOptions);

type AppDialogContextValue = {
  confirm: (options: AppConfirmOptions) => Promise<boolean>;
  prompt: (options: AppPromptOptions) => Promise<string | null>;
  alert: (options: AppAlertOptions | string) => Promise<void>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

function fallbackConfirm(options: AppConfirmOptions): Promise<boolean> {
  const msg = [options.title, options.message].filter(Boolean).join("\n\n");
  return Promise.resolve(typeof window !== "undefined" ? window.confirm(msg) : false);
}

function fallbackPrompt(options: AppPromptOptions): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const entered = window.prompt(options.message ? `${options.title}\n\n${options.message}` : options.title, options.defaultValue ?? "");
  if (entered == null) return Promise.resolve(null);
  const err = options.validate?.(entered);
  if (err) {
    window.alert(err);
    return Promise.resolve(null);
  }
  return Promise.resolve(entered);
}

function fallbackAlert(options: AppAlertOptions | string): Promise<void> {
  const message = typeof options === "string" ? options : options.message;
  const title = typeof options === "string" ? undefined : options.title;
  if (typeof window !== "undefined") {
    window.alert(title ? `${title}\n\n${message}` : message);
  }
  return Promise.resolve();
}

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DialogState | null>(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const queueRef = useRef<DialogState[]>([]);

  const pump = useCallback(() => {
    setActive((current) => {
      if (current) return current;
      const next = queueRef.current.shift() ?? null;
      if (next?.kind === "prompt") {
        setPromptDraft(next.defaultValue ?? "");
        setPromptError(null);
      }
      return next;
    });
  }, []);

  const enqueue = useCallback(
    (item: DialogState) => {
      queueRef.current.push(item);
      pump();
    },
    [pump],
  );

  const closeActive = useCallback(() => {
    setActive(null);
    window.setTimeout(() => pump(), 0);
  }, [pump]);

  const confirm = useCallback(
    (options: AppConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        enqueue({
          kind: "confirm",
          ...options,
          resolve: (value) => {
            resolve(value);
            closeActive();
          },
        });
      }),
    [enqueue, closeActive],
  );

  const prompt = useCallback(
    (options: AppPromptOptions) =>
      new Promise<string | null>((resolve) => {
        enqueue({
          kind: "prompt",
          ...options,
          resolve: (value) => {
            resolve(value);
            closeActive();
          },
        });
      }),
    [enqueue, closeActive],
  );

  const alert = useCallback(
    (options: AppAlertOptions | string) =>
      new Promise<void>((resolve) => {
        const normalized =
          typeof options === "string" ? { message: options } : options;
        enqueue({
          kind: "alert",
          ...normalized,
          resolve: () => {
            resolve();
            closeActive();
          },
        });
      }),
    [enqueue, closeActive],
  );

  const value = useMemo(() => ({ confirm, prompt, alert }), [confirm, prompt, alert]);

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      <AppDialogSheet
        active={active}
        promptDraft={promptDraft}
        promptError={promptError}
        onPromptDraftChange={setPromptDraft}
        onPromptErrorChange={setPromptError}
        onDismiss={() => {
          if (!active) return;
          if (active.kind === "confirm") active.resolve(false);
          else if (active.kind === "prompt") active.resolve(null);
          else active.resolve();
        }}
      />
    </AppDialogContext.Provider>
  );
}

function AppDialogSheet({
  active,
  promptDraft,
  promptError,
  onPromptDraftChange,
  onPromptErrorChange,
  onDismiss,
}: {
  active: DialogState | null;
  promptDraft: string;
  promptError: string | null;
  onPromptDraftChange: (value: string) => void;
  onPromptErrorChange: (value: string | null) => void;
  onDismiss: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active?.kind === "prompt") {
      const t = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [active]);

  if (!active) return null;

  const title =
    active.kind === "alert" ? active.title ?? "お知らせ" : active.title;

  return (
    <AppBottomSheet open={Boolean(active)} onClose={onDismiss} title={title} size="compact">
      <div className="app-dialog-body px-3 pb-4">
        {active.message ? (
          <p className="app-dialog-message whitespace-pre-wrap text-sm leading-relaxed text-[var(--app-text-muted)]">
            {active.message}
          </p>
        ) : null}

        {active.kind === "prompt" ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={promptDraft}
              onChange={(e) => {
                onPromptDraftChange(e.target.value);
                onPromptErrorChange(null);
              }}
              placeholder={active.placeholder}
              className="app-settings-profile-input mt-3 w-full"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                submitPrompt(active, promptDraft, onPromptErrorChange);
              }}
            />
            {promptError ? <p className="mt-2 text-xs text-rose-600">{promptError}</p> : null}
          </>
        ) : null}

        <div className={`flex gap-2 ${active.message || active.kind === "prompt" ? "mt-4" : ""}`}>
          {active.kind === "confirm" || active.kind === "prompt" ? (
            <button type="button" className="app-sheet-action flex-1" onClick={onDismiss}>
              {active.cancelLabel ?? "キャンセル"}
            </button>
          ) : null}
          <button
            type="button"
            className={
              "app-sheet-action flex-1 " +
              (active.kind === "confirm" && active.destructive
                ? "app-sheet-action--danger "
                : "app-sheet-action--primary ")
            }
            onClick={() => {
              if (active.kind === "confirm") {
                active.resolve(true);
                return;
              }
              if (active.kind === "prompt") {
                submitPrompt(active, promptDraft, onPromptErrorChange);
                return;
              }
              active.resolve();
            }}
          >
            {active.kind === "confirm"
              ? active.confirmLabel ?? "OK"
              : active.kind === "prompt"
                ? active.confirmLabel ?? "OK"
                : active.confirmLabel ?? "OK"}
          </button>
        </div>
      </div>
    </AppBottomSheet>
  );
}

function submitPrompt(
  active: Extract<DialogState, { kind: "prompt" }>,
  draft: string,
  onPromptErrorChange: (value: string | null) => void,
) {
  const trimmed = draft.trim();
  const err = active.validate?.(trimmed);
  if (err) {
    onPromptErrorChange(err);
    return;
  }
  active.resolve(trimmed || null);
}

export function useAppDialog(): AppDialogContextValue {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    return {
      confirm: fallbackConfirm,
      prompt: fallbackPrompt,
      alert: fallbackAlert,
    };
  }
  return ctx;
}
