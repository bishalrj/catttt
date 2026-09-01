"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import {
  Bot,
  Send,
  User,
  Loader2,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Which machines need attention this week?",
  "Are there any high-severity anomalies I should know about?",
  "Which sites are seeing increasing demand for equipment?",
  "Is there any equipment that's been idle too long?",
  "Which rentals are overdue or at risk of going overdue?",
  "What equipment should I consider reallocating?",
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm FleetAI, your intelligent fleet management assistant. I have live access to equipment status, telemetry anomalies, demand forecasts, and alerts. Ask me anything about your fleet.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e?: FormEvent, overrideMessage?: string) {
    e?.preventDefault();
    const text = (overrideMessage ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const answer = await sendChatMessage(text);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            "Sorry, I couldn't reach the backend. Make sure the API server is running and GEMINI_API_KEY is configured in backend/.env.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-4 rm-page-enter" style={{ height: "calc(100vh - 100px)" }}>
      {/* Header */}
      <div className="rm-page-header mb-0 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rm-purple-light border border-purple-200 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-rm-purple" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-rm-text-primary flex items-center gap-2">
              FleetAI Chat
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rm-purple bg-rm-purple-light border border-purple-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Gemini
              </span>
            </h1>
            <p className="text-xs text-rm-text-secondary">
              Natural language intelligence for anomalies, forecasting, and asset optimization
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-rm-green bg-rm-green-light px-3 py-1 rounded-full border border-green-200">
          <div className="w-2 h-2 rounded-full bg-rm-green animate-pulse" />
          Live Telemetry Grounded
        </div>
      </div>

      {/* Suggested questions (only show before first user message) */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSubmit(undefined, q)}
              className="flex items-center gap-2 text-left text-xs text-rm-text-secondary bg-white border border-rm-border hover:border-rm-purple hover:bg-rm-purple-light rounded-xl px-4 py-2.5 transition-all shadow-sm group"
            >
              <ChevronRight className="w-3.5 h-3.5 text-rm-text-muted group-hover:text-rm-purple transition-colors shrink-0" />
              <span className="group-hover:text-rm-purple font-medium">{q}</span>
            </button>
          ))}
        </div>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === "assistant"
                  ? "bg-rm-purple text-white"
                  : "bg-rm-red text-white"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === "assistant"
                  ? "bg-white border border-rm-border text-rm-text-primary"
                  : "bg-rm-red text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-1.5 ${msg.role === "assistant" ? "text-rm-text-muted" : "text-red-100"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-rm-purple text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-rm-border rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-rm-purple animate-spin" />
              <span className="text-sm text-rm-text-secondary font-medium">Analysing live fleet telemetry…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-rm-border rounded-2xl p-2.5 flex items-end gap-2.5 shrink-0 shadow-sm"
      >
        <div className="flex-1 flex items-center gap-2 bg-rm-surface border border-rm-border-light rounded-xl px-3 py-2 focus-within:border-rm-purple focus-within:bg-white transition-all">
          <MessageSquare className="w-4 h-4 text-rm-text-muted shrink-0" />
          <textarea
            ref={inputRef}
            id="fleet-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your fleet… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-rm-text-primary placeholder-rm-text-placeholder resize-none outline-none max-h-32 overflow-auto leading-relaxed"
          />
        </div>
        <button
          id="fleet-chat-send"
          type="submit"
          disabled={loading || !input.trim()}
          className="h-10 w-10 rounded-xl flex items-center justify-center bg-rm-purple hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white shadow-sm shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </form>
    </div>
  );
}
