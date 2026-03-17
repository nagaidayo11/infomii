"use client";

import { useState, useRef, useEffect } from "react";

export type InfoPageChatProps = {
  contextText: string;
  pageTitle: string;
};

type Message = { role: "user" | "assistant"; content: string };

export function InfoPageChat({ contextText, pageTitle }: InfoPageChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/info-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: contextText,
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "申し訳ございません。しばらくしてからもう一度お試しください。" },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "通信エラーが発生しました。しばらくしてからもう一度お試しください。" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition hover:bg-slate-700"
        aria-label="お問い合わせチャットを開く"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative flex h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:h-[520px] sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-800">ご案内アシスト</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="閉じる"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="shrink-0 px-4 py-2 text-xs text-slate-500">
              {pageTitle}の内容に基づいてお答えします。
            </p>
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-slate-400">
                  ご質問をどうぞ。このページの案内に沿ってお答えします。
                </p>
              ) : (
                <ul className="space-y-4">
                  {messages.map((m, i) => (
                    <li
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          m.role === "user"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      </div>
                    </li>
                  ))}
                  {loading && (
                    <li className="flex justify-start">
                      <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
                        <span className="inline-flex gap-1">
                          <span className="animate-pulse">・</span>
                          <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>・</span>
                          <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>・</span>
                        </span>
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
            <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-200 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="質問を入力..."
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  送信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
