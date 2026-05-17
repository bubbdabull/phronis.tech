"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useRef, useState } from "react";

import { TerminalCard } from "@/_features/member-desk/terminal-card";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";

type Thread = { id: string; title: string | null; created_at: string; updated_at: string };
type ChatMessage = { id: string; role: string; content: string; created_at: string };

export function DeskAiDeskPanel() {
  const { getAccessToken } = usePrivy();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const authHeaders = useCallback(async () => {
    const bearer = await getAccessToken();
    if (!bearer) return null;
    return { Authorization: `Bearer ${bearer}` };
  }, [getAccessToken]);

  const loadThreads = useCallback(async () => {
    setError(null);
    setLoadingThreads(true);
    try {
      const h = await authHeaders();
      if (!h) {
        setError("Sign in required.");
        setThreads([]);
        return;
      }
      const res = await fetch("/api/desk/ai-chat", { headers: h });
      const json = (await res.json()) as { ok?: boolean; threads?: Thread[]; error?: string; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? json.error ?? "Could not load chats.");
        setThreads([]);
        return;
      }
      setThreads(json.threads ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoadingThreads(false);
    }
  }, [authHeaders]);

  const loadMessages = useCallback(
    async (id: string) => {
      setLoadingMsgs(true);
      setError(null);
      try {
        const h = await authHeaders();
        if (!h) return;
        const res = await fetch(`/api/desk/ai-chat/${id}`, { headers: h });
        const json = (await res.json()) as { ok?: boolean; messages?: ChatMessage[]; error?: string; message?: string };
        if (!res.ok || !json.ok) {
          setError(json.message ?? json.error ?? "Could not load messages.");
          setMessages([]);
          return;
        }
        setMessages(json.messages ?? []);
      } catch {
        setError("Network error.");
      } finally {
        setLoadingMsgs(false);
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (threadId) void loadMessages(threadId);
    else setMessages([]);
  }, [threadId, loadMessages]);

  useEffect(() => {
    if (loadingThreads) return;
    if (threads.length > 0 && threadId === null) {
      setThreadId(threads[0].id);
    }
  }, [loadingThreads, threads, threadId]);

  useEffect(() => {
    if (loadingMsgs) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMsgs]);

  async function newThread() {
    const h = await authHeaders();
    if (!h) return;
    const res = await fetch("/api/desk/ai-chat", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Desk chat" }),
    });
    const json = (await res.json()) as { ok?: boolean; thread?: Thread };
    if (res.ok && json.ok && json.thread) {
      setThreads((prev) => [json.thread!, ...prev]);
      setThreadId(json.thread.id);
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!threadId || !input.trim() || sending) return;
    setSending(true);
    setError(null);
    const text = input.trim();
    setInput("");
    try {
      const h = await authHeaders();
      if (!h) return;
      const res = await fetch(`/api/desk/ai-chat/${threadId}`, {
        method: "POST",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? json.error ?? "Send failed.");
      }
      await loadMessages(threadId);
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <TerminalCard title="Threads" accent="violet" className="h-fit">
        {loadingThreads ? <p className="text-xs text-phronis-muted">Loading…</p> : null}
        <Button type="button" size="sm" className="mt-2 w-full bg-phronis-teal text-phronis-void hover:opacity-90" onClick={() => void newThread()}>
          New chat
        </Button>
        <ul className="mt-3 max-h-[420px] space-y-1 overflow-y-auto text-xs">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setThreadId(t.id)}
                className={`w-full rounded-md px-2 py-2 text-left transition-colors ${
                  threadId === t.id ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:bg-white/5"
                }`}
              >
                {t.title || "Chat"}
              </button>
            </li>
          ))}
        </ul>
      </TerminalCard>

      <TerminalCard title="AI desk" subtitle="OpenAI-compatible API — set PAI_API_KEY, AI_API_KEY, or OPENAI_API_KEY on the server" accent="teal">
        {error ? <p className="mb-2 text-sm text-amber-200/90">{error}</p> : null}
        {loadingThreads ? (
          <p className="text-sm text-phronis-muted">Loading workspace…</p>
        ) : error?.toLowerCase().includes("sign in") ? (
          <p className="text-sm text-phronis-muted">Sign in to use the AI desk.</p>
        ) : !threadId && threads.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-phronis-muted">
              Create a thread to start. Messages are stored in Supabase; replies use your server AI keys (PAI / AI / OpenAI).
            </p>
            <Button type="button" className="bg-phronis-teal text-phronis-void hover:opacity-90" onClick={() => void newThread()}>
              Start first chat
            </Button>
          </div>
        ) : !threadId ? (
          <p className="text-sm text-phronis-muted">Opening thread…</p>
        ) : loadingMsgs ? (
          <p className="text-sm text-phronis-muted">Loading messages…</p>
        ) : (
          <div className="flex max-h-[min(56vh,560px)] flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
              {messages.length === 0 ? (
                <p className="text-sm text-phronis-muted">Say hello — the assistant uses your server-side model and system prompt.</p>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-3 py-2.5 shadow-sm ${
                    m.role === "user"
                      ? "ml-4 border border-phronis-teal/25 bg-phronis-teal/12 text-phronis-foreground"
                      : "mr-4 border border-white/10 bg-black/35 text-phronis-muted"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-phronis-muted/80">{m.role}</p>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} aria-hidden className="h-px shrink-0" />
            </div>
            <form className="mt-4 flex gap-2 border-t border-white/10 pt-3" onSubmit={onSend}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about risk, wallets, or Solana mechanics…"
                className="border-white/15 bg-black/25 text-sm"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !input.trim() || !threadId}
                className="shrink-0 bg-phronis-teal text-phronis-void hover:opacity-90"
              >
                {sending ? "…" : "Send"}
              </Button>
            </form>
          </div>
        )}
      </TerminalCard>
    </div>
  );
}
