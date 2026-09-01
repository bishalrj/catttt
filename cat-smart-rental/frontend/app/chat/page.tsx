"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  ChevronRight,
  Radio,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const SUGGESTION_TOPICS = [
  {
    category: "Anomalies & Critical",
    icon: AlertTriangle,
    questions: [
      "Which Cat machines need telematics attention this week?",
      "Are there any critical anomaly alerts across job sites?",
    ],
  },
  {
    category: "Demand & Reallocation",
    icon: TrendingUp,
    questions: [
      "Which sites show increasing demand for excavators and dozers?",
      "What is the recommended fleet pre-positioning strategy?",
    ],
  },
  {
    category: "Idle & Overdue",
    icon: Activity,
    questions: [
      "Which machines have abnormal idle ratios over 50%?",
      "Which rental assignments are overdue past return window?",
    ],
  },
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

// Simple Markdown parser for bullet points, bold, headings, code
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    let trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={idx} className="h-2" />);
      return;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={idx} className="text-sm font-black text-[#ffcd11] uppercase tracking-wider mt-2 mb-1.5 flex items-center gap-1.5">
          {trimmed.replace("### ", "")}
        </h3>
      );
      return;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const rawText = trimmed.substring(2);
      elements.push(
        <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-[#f1f5f9]">
          <span className="text-[#ffcd11] font-bold mt-0.5 shrink-0">▸</span>
          <div>{parseInlineFormatting(rawText)}</div>
        </div>
      );
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={idx} className="text-xs sm:text-sm text-[#f1f5f9] leading-relaxed my-1">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  return <div className="cat-chat-content space-y-0.5">{elements}</div>;
}

function parseInlineFormatting(text: string): React.ReactNode {
  // Simple regex parser for **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="text-white font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="bg-[#0b0d10] border border-[#262d38] text-[#ffcd11] px-1.5 py-0.5 rounded font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "### 🚜 Cat VisionLink FleetAI Advisor Online\n\nI am continuously grounded on your **live Caterpillar telematics**, equipment health metrics, regional demand curves, and active rental contracts.\n\n- Real-time telemetric fault analysis\n- Automated pre-positioning recommendations\n- Predictive machine lifecycle & ROI scoring\n\nHow can I optimize your fleet operations today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
            "⚠️ **Telemetry Connection Error:** Unable to reach the Cat backend service. Ensure `uvicorn app.main:app` is running on port 8000.",
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

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleReset() {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "### 🚜 Cat VisionLink FleetAI Advisor Reset\n\nConversation cleared. Ask anything regarding machine telemetry, high idle ratios, overdue assignments, or regional demand trends.",
        timestamp: new Date().toISOString(),
      },
    ]);
  }

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6 cat-page-enter" style={{ minHeight: "calc(100vh - 140px)" }}>
      {/* Header Bar */}
      <div className="cat-page-header mb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-black border border-[#ffcd11] flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-white font-black text-xs">CAT</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Cat&reg; FleetAI Advisor
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0b0d10] bg-[#ffcd11] px-2 py-0.5 rounded tracking-tight">
                <Sparkles className="w-3 h-3" /> GEMINI POWERED
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Natural language intelligence grounded on live Caterpillar VisionLink telematics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-[#34d399] bg-[#10b981]/15 px-3 py-1.5 rounded border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TELEMATICS ONLINE
          </div>
          <button
            onClick={handleReset}
            className="cat-btn-ghost text-xs py-1.5 px-3"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Suggested Topics Pills */}
      {messages.length <= 2 && (
        <div className="space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Quick Telematics Queries
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUGGESTION_TOPICS.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <div key={i} className="cat-card p-4 space-y-2 bg-[#12161c]/80">
                  <div className="flex items-center gap-2 text-xs font-black text-[#ffcd11] uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{topic.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    {topic.questions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSubmit(undefined, q)}
                        className="w-full text-left text-xs text-[#94a3b8] hover:text-white hover:bg-[#181d24] p-2 rounded border border-transparent hover:border-[#ffcd11]/30 transition-all flex items-start gap-1.5 group"
                      >
                        <ChevronRight className="w-3 h-3 text-[#64748b] group-hover:text-[#ffcd11] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-5 min-h-[320px] pr-2 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded flex items-center justify-center shrink-0 shadow-md ${
                msg.role === "assistant"
                  ? "bg-black border border-[#ffcd11] text-[#ffcd11] font-black text-xs"
                  : "bg-[#ffcd11] text-[#0b0d10] font-black"
              }`}
            >
              {msg.role === "assistant" ? "CAT" : <User className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-lg p-5 relative group ${
                msg.role === "assistant"
                  ? "bg-[#151a21] border border-[#262d38] shadow-lg text-[#f1f5f9]"
                  : "bg-[#ffcd11] text-[#0b0d10] font-semibold shadow-md"
              }`}
            >
              {msg.role === "assistant" ? (
                renderMarkdown(msg.content)
              ) : (
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}

              {/* Message metadata & actions */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#262d38]/60 text-[10px] font-mono text-[#64748b]">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-[#ffcd11]"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {loading && (
          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded bg-black border border-[#ffcd11] text-[#ffcd11] font-black text-xs flex items-center justify-center shrink-0 shadow-md">
              CAT
            </div>
            <div className="bg-[#151a21] border border-[#262d38] rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <Loader2 className="w-4 h-4 text-[#ffcd11] animate-spin" />
              <span className="text-xs text-[#94a3b8] font-mono">
                Querying Cat VisionLink telematics models &amp; telemetry logs…
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#151a21] border border-[#262d38] rounded-lg p-3 sm:p-4 flex items-end gap-3 shrink-0 shadow-xl"
      >
        <div className="flex-1 flex items-center gap-3 bg-[#12161c] border border-[#262d38] rounded px-4 py-3 focus-within:border-[#ffcd11] transition-all">
          <Zap className="w-4 h-4 text-[#64748b] shrink-0" />
          <textarea
            ref={inputRef}
            id="fleet-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Cat FleetAI about machine health, high idle hours, site forecasts, or overdue assets… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#f8fafc] placeholder-[#64748b] resize-none outline-none max-h-32 overflow-auto leading-relaxed font-sans"
          />
        </div>
        <button
          id="fleet-chat-send"
          type="submit"
          disabled={loading || !input.trim()}
          className="h-12 w-12 rounded flex items-center justify-center bg-[#ffcd11] hover:bg-[#e5b700] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[#0b0d10] font-black shrink-0 shadow-md"
          title="Send message"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            <Send className="w-5 h-5 text-black" />
          )}
        </button>
      </form>
    </div>
  );
}
