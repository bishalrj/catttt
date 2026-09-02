"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error:   <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  info:    <Info className="w-4 h-4 text-[#ffcd11] shrink-0" />,
};

function ToastItem({
  toast: t,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const duration = t.duration ?? 4000;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) ref.current.classList.add("dismissing");
      setTimeout(() => onRemove(t.id), 250);
    }, duration);
    return () => clearTimeout(timer);
  }, [t.id, duration, onRemove]);

  return (
    <div
      ref={ref}
      className={`cat-toast cat-toast-${t.type} relative`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {ICONS[t.type]}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white uppercase tracking-wide leading-tight">
            {t.title}
          </p>
          {t.message && (
            <p className="text-xs text-[#8898aa] mt-0.5 leading-snug">
              {t.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(t.id)}
          className="shrink-0 text-[#5a6a7e] hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        className={`cat-toast-progress mt-2 ${
          t.type === "success" ? "bg-emerald-400" :
          t.type === "error"   ? "bg-red-400" :
          t.type === "warning" ? "bg-amber-400" :
          "bg-[#ffcd11]"
        }`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (title, message) => addToast({ type: "success", title, message }),
    error:   (title, message) => addToast({ type: "error",   title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
    info:    (title, message) => addToast({ type: "info",    title, message }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
