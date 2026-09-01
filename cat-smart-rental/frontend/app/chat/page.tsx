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
  Radio,
  Cpu,
} from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Which Cat machines need telematics attention this week?",
  "Are there any critical anomaly alerts in regional sites?",
  "Which sites show increasing demand for excavators and loaders?",
  "Which machines have abnormal idle ratios over 50%?",
  "Which rental assignments are currently overdue or near expiration?",
  "What is the recommended fleet pre-positioning strategy?",
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
        "Welcome to Cat FleetAI Advisor. I am continuously grounded on your live Caterpillar VisionLink telematics, machine fault codes, demand forecasting curves, and rental lifecycles. How can I optimize your fleet operations today?",
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
            "Unable to reach the Cat Intelligence server. Ensure the backend is online and GEMINI_API_KEY is configured in backend/.env.",
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
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-4 cat-page-enter" style={{ height: "calc(100vh - 100px)" }}>
      {/* Header */}
      <div className="cat-page-header mb-0 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-black border border-[#ffcd11] flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white font-black text-xs">CAT</span>
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              Cat&reg; FleetAI Telematics Advisor
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0b0d10] bg-[#ffcd11] px-2 py-0.5 rounded tracking-tight">
                <Sparkles className="w-3 h-3" /> GEMINI POWERED
              </span>
            </h1>
            <p className="text-xs text-[#94a3b8]">
              Natural language intelligence grounded on live VisionLink telemetric data feeds
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-[#34d399] bg-[#10b981]/15 px-3 py-1 rounded border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          TELEMATICS GROUNDED
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSubmit(undefined, q)}
              className="flex items-center gap-2 text-left text-xs text-[#94a3b8] bg-[#151a21] border border-[#262d38] hover:border-[#ffcd11] hover:bg-[#181d24] rounded px-3.5 py-2.5 transition-all group"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#ffcd11] transition-colors shrink-0" />
              <span className="group-hover:text-white font-medium">{q}</span>
            </button>
          ))}
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === "assistant"
                  ? "bg-black border border-[#ffcd11] text-[#ffcd11] font-black text-xs"
                  : "bg-[#ffcd11] text-[#0b0d10] font-bold"
              }`}
            >
              {msg.role === "assistant" ? "CAT" : <User className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-[#151a21] border border-[#262d38] text-[#f1f5f9]"
                  : "bg-[#ffcd11] text-[#0b0d10] font-semibold"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-1.5 font-mono ${msg.role === "assistant" ? "text-[#64748b]" : "text-black/60"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded bg-black border border-[#ffcd11] text-[#ffcd11] font-black text-xs flex items-center justify-center shrink-0">
              CAT
            </div>
            <div className="bg-[#151a21] border border-[#262d38] rounded-lg px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#ffcd11] animate-spin" />
              <span className="text-xs text-[#94a3b8] font-mono">Querying Cat VisionLink telemetry &amp; models…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#151a21] border border-[#262d38] rounded-lg p-2.5 flex items-end gap-2.5 shrink-0 shadow-lg"
      >
        <div className="flex-1 flex items-center gap-2 bg-[#12161c] border border-[#262d38] rounded px-3 py-2 focus-within:border-[#ffcd11] transition-all">
          <MessageSquare className="w-4 h-4 text-[#64748b] shrink-0" />
          <textarea
            ref={inputRef}
            id="fleet-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Cat FleetAI about machines, job sites, runtime, or anomalies… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#f8fafc] placeholder-[#64748b] resize-none outline-none max-h-32 overflow-auto leading-relaxed"
          />
        </div>
        <button
          id="fleet-chat-send"
          type="submit"
          disabled={loading || !input.trim()}
          className="h-10 w-10 rounded flex items-center justify-center bg-[#ffcd11] hover:bg-[#e5b700] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[#0b0d10] font-bold shrink-0 shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Send className="w-4 h-4 text-black" />
          )}
        </button>
      </form>
    </div>
  );
}
