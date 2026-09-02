"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ChevronRight,
  Radio,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
  TrendingUp,
  Mic,
  MicOff,
  Star,
  Truck,
  MapPin,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

/* ── Suggestion Topics ────────────────────────────────────────────────────── */
const SUGGESTION_TOPICS = [
  {
    category: "Anomalies & Critical",
    icon: AlertTriangle,
    color: "#f87171",
    questions: [
      "Which Cat machines need telematics attention this week?",
      "Are there any critical anomaly alerts across job sites?",
    ],
  },
  {
    category: "Demand & Reallocation",
    icon: TrendingUp,
    color: "#38bdf8",
    questions: [
      "Which sites show increasing demand for excavators and dozers?",
      "What is the recommended fleet pre-positioning strategy?",
    ],
  },
  {
    category: "Idle & Overdue",
    icon: Activity,
    color: "#fbbf24",
    questions: [
      "Which machines have abnormal idle ratios over 50%?",
      "Which rental assignments are overdue past return window?",
    ],
  },
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

/* ── Markdown Renderer ────────────────────────────────────────────────────── */
function parseInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index} className="text-white font-bold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="bg-[#080a0d] border border-[#21293a] text-[#ffcd11] px-1.5 py-0.5 rounded font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
  return parts.length > 0 ? parts : text;
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) { elements.push(<div key={idx} className="h-2" />); return; }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={idx} className="text-sm font-black text-[#ffcd11] uppercase tracking-wider mt-3 mb-1.5 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 shrink-0" />
          {trimmed.replace("### ", "")}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={idx} className="text-base font-black text-white uppercase tracking-wide mt-3 mb-2">
          {trimmed.replace("## ", "")}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-[#e2e8f0]">
          <span className="text-[#ffcd11] font-bold mt-0.5 shrink-0 text-xs">▸</span>
          <div>{parseInlineFormatting(trimmed.substring(2))}</div>
        </div>
      );
      return;
    }
    elements.push(
      <p key={idx} className="text-xs sm:text-sm text-[#e2e8f0] leading-relaxed my-1">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });
  return <div className="cat-chat-content space-y-0.5">{elements}</div>;
}

/* ── Typing Indicator ─────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-[#080a0d] border border-[#ffcd11] text-[#ffcd11] font-black text-xs flex items-center justify-center shrink-0">
        CAT
      </div>
      <div className="bg-[#131820] border border-[#21293a] rounded-xl p-4 flex items-center gap-3 shadow-lg chat-msg-enter">
        <div className="flex items-center gap-1.5 px-1">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <span className="text-xs text-[#5a6a7e] font-mono">
          Analysing telematics data…
        </span>
      </div>
    </div>
  );
}

/* ── Context Chips ────────────────────────────────────────────────────────── */
function ContextChips() {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <span className="text-[10px] font-bold text-[#5a6a7e] uppercase tracking-wider">Context:</span>
      {[
        { icon: Truck, label: "24 Assets", color: "#ffcd11" },
        { icon: AlertTriangle, label: "3 Critical", color: "#f87171" },
        { icon: MapPin, label: "6 Sites", color: "#38bdf8" },
      ].map(({ icon: Icon, label, color }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
          style={{ background: `${color}10`, borderColor: `${color}25`, color }}
        >
          <Icon className="w-2.5 h-2.5" />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ── Message Bubble ───────────────────────────────────────────────────────── */
function MessageBubble({
  msg,
  onCopy,
  onReact,
  copiedId,
  reactions,
}: {
  msg: ChatMessage;
  onCopy: (text: string, id: string) => void;
  onReact: (id: string, reaction: "up" | "down") => void;
  copiedId: string | null;
  reactions: Record<string, "up" | "down">;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 chat-msg-enter ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? "bg-[#ffcd11] text-[#080a0d] font-black"
            : "bg-[#080a0d] border border-[#ffcd11] text-[#ffcd11] font-black text-xs"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : "CAT"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-xl relative group transition-all ${
          isUser
            ? "bg-[#ffcd11] text-[#080a0d] font-semibold shadow-lg px-4 py-3"
            : "bg-[#131820] border border-[#21293a] shadow-lg p-5 text-[#e2e8f0]"
        }`}
        style={!isUser ? { boxShadow: "0 4px 20px rgba(0,0,0,0.4)" } : {}}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        ) : (
          renderMarkdown(msg.content)
        )}

        {/* Metadata + actions (assistant only) */}
        {!isUser && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#21293a]/60 text-[10px] font-mono text-[#5a6a7e] gap-2">
            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Reactions */}
              <button
                onClick={() => onReact(msg.id, "up")}
                className={`transition-colors ${reactions[msg.id] === "up" ? "text-emerald-400" : "hover:text-emerald-400"}`}
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onReact(msg.id, "down")}
                className={`transition-colors ${reactions[msg.id] === "down" ? "text-red-400" : "hover:text-red-400"}`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
              {/* Copy */}
              <button
                onClick={() => onCopy(msg.content, msg.id)}
                className="hover:text-[#ffcd11] transition-colors flex items-center gap-1"
                title="Copy"
              >
                {copiedId === msg.id ? (
                  <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                ) : (
                  <><Copy className="w-3 h-3" /><span>Copy</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Chat Page ───────────────────────────────────────────────────────── */
export default function ChatPage() {
  const WELCOME_MSG: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: "### 🚜 Cat VisionLink FleetAI Advisor Online\n\nI am continuously grounded on your **live Caterpillar telematics**, equipment health metrics, regional demand curves, and active rental contracts.\n\n- Real-time telemetric fault analysis\n- Automated pre-positioning recommendations\n- Predictive machine lifecycle & ROI scoring\n\nHow can I optimize your fleet operations today?",
    timestamp: new Date().toISOString(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Submit handler with streamed display
  const handleSubmit = useCallback(async (e?: FormEvent, overrideMessage?: string) => {
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
      const msgId = generateId();

      // Simulate streaming: reveal words progressively
      const words = answer.split(" ");
      let streamed = "";

      const assistantMsg: ChatMessage = {
        id: msgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);

      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 18));
        streamed += (i === 0 ? "" : " ") + words[i];
        const snap = streamed;
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: snap } : m))
        );
      }
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "⚠️ **Telemetry Connection Error:** Unable to reach the Cat backend service. Ensure `uvicorn app.main:app` is running on port 8000.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      inputRef.current?.focus();
    }
  }, [input, loading]);

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

  function handleReact(id: string, reaction: "up" | "down") {
    setReactions((prev) => ({ ...prev, [id]: reaction }));
  }

  function handleReset() {
    setMessages([{
      ...WELCOME_MSG,
      content: "### 🚜 Cat VisionLink FleetAI Reset\n\nConversation cleared. Ask anything about machine telemetry, high idle ratios, overdue assignments, or regional demand trends.",
      timestamp: new Date().toISOString(),
    }]);
  }

  function toggleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      alert("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }

  const charCount = input.length;
  const showSuggestions = messages.length <= 2;

  return (
    <div
      className="max-w-5xl mx-auto flex flex-col gap-5 cat-page-enter"
      style={{ height: "calc(100vh - 130px)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="cat-page-header mb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl bg-[#080a0d] border border-[#ffcd11] flex items-center justify-center shrink-0 shadow-lg"
            style={{ boxShadow: "0 0 14px rgba(255,205,17,0.2)" }}
          >
            <span className="text-white font-black text-xs">CAT</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Cat® FleetAI Advisor
              </h1>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#080a0d] bg-[#ffcd11] px-2 py-0.5 rounded tracking-tight">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-xs text-[#5a6a7e] mt-0.5">
              Natural language intelligence · Live Caterpillar VisionLink telematics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-[#34d399] bg-[#10b981]/10 px-3 py-1.5 rounded-lg border border-emerald-500/25">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </div>
          <button
            onClick={handleReset}
            className="cat-btn-ghost text-xs"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* ── Quick Suggestions ───────────────────────────────────────────── */}
      {showSuggestions && (
        <div className="space-y-2 shrink-0">
          <span className="text-[10px] font-bold text-[#5a6a7e] uppercase tracking-widest">
            Quick Queries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUGGESTION_TOPICS.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <div
                  key={i}
                  className="cat-card p-4 space-y-2 cat-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider" style={{ color: topic.color }}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{topic.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    {topic.questions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSubmit(undefined, q)}
                        className="w-full text-left text-xs text-[#8898aa] hover:text-white hover:bg-[#1d2530] p-2 rounded-lg border border-transparent hover:border-[#21293a] transition-all flex items-start gap-1.5 group"
                      >
                        <ChevronRight className="w-3 h-3 text-[#5a6a7e] group-hover:text-[#ffcd11] shrink-0 mt-0.5" />
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

      {/* ── Message Thread ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1 min-h-0">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onCopy={handleCopy}
            onReact={handleReact}
            copiedId={copiedId}
            reactions={reactions}
          />
        ))}

        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#131820] border border-[#21293a] rounded-xl p-3 shadow-2xl space-y-2">
        {/* Context chips */}
        <ContextChips />

        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 flex items-end gap-2 bg-[#0d1117] border border-[#21293a] rounded-lg px-3.5 py-2.5 focus-within:border-[#ffcd11]/50 focus-within:shadow-[0_0_0_2px_rgba(255,205,17,0.08)] transition-all">
            <Zap className="w-4 h-4 text-[#5a6a7e] shrink-0 mb-0.5" />
            <textarea
              ref={inputRef}
              id="fleet-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Cat FleetAI about machine health, idle hours, site forecasts… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#f8fafc] placeholder-[#5a6a7e] resize-none outline-none overflow-auto leading-relaxed font-sans"
              style={{ minHeight: "20px", maxHeight: "120px" }}
            />
            {charCount > 0 && (
              <span className="text-[9px] font-mono text-[#5a6a7e] self-end mb-0.5 shrink-0">
                {charCount}
              </span>
            )}
          </div>

          {/* Voice input */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`h-11 w-11 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              isRecording ? "voice-recording border border-red-500" : "cat-btn-ghost border border-[#21293a] hover:border-[#ffcd11]/40"
            }`}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            {isRecording ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send */}
          <button
            id="fleet-chat-send"
            type="submit"
            disabled={loading || !input.trim()}
            className="h-11 w-11 rounded-lg flex items-center justify-center bg-[#ffcd11] hover:bg-[#e5b700] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[#080a0d] font-black shrink-0 shadow-lg"
            style={{ boxShadow: !loading && input.trim() ? "0 0 12px rgba(255,205,17,0.3)" : "none" }}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-[9px] text-[#5a6a7e] font-mono text-center">
          Cat® VisionLink® AI · Grounded on live telematics · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
