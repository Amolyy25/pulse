import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastType = "success" | "info" | "warning" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type Ctx = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

const META: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "bg-soft-mint", border: "border-emerald-300", text: "text-emerald-800", icon: "✅" },
  info:    { bg: "bg-soft-sky",  border: "border-sky-300",     text: "text-sky-800",     icon: "ℹ️" },
  warning: { bg: "bg-soft-lemon", border: "border-amber-300",  text: "text-amber-800",   icon: "⚠️" },
  error:   { bg: "bg-soft-rose", border: "border-rose-300",    text: "text-rose-800",    icon: "❌" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-24 inset-x-0 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => {
          const m = META[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto animate-slide-up max-w-md w-full border rounded-xl px-4 py-3 shadow-md flex items-start gap-3 ${m.bg} ${m.border} ${m.text}`}
            >
              <span className="text-lg leading-none mt-0.5">{m.icon}</span>
              <span className="text-sm flex-1">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
