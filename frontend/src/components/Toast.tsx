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

const META: Record<
  ToastType,
  { card: string; accent: string; icon: ReactNode }
> = {
  success: {
    card: "card-tinted-mint",
    accent: "text-mint-500",
    icon: <CheckIcon />,
  },
  info: {
    card: "card-tinted-lav",
    accent: "text-lavender-500",
    icon: <InfoIcon />,
  },
  warning: {
    card: "card-tinted-butter",
    accent: "text-butter-400",
    icon: <WarnIcon />,
  },
  error: {
    card: "card-tinted-rose",
    accent: "text-rose-500",
    icon: <ErrIcon />,
  },
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
      <div
        className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 96px)" }}
      >
        {items.map((t) => {
          const m = META[t.type];
          return (
            <div
              key={t.id}
              className={[
                "pointer-events-auto animate-slide-up max-w-md w-full border rounded-2xl px-4 py-3 shadow-lg flex items-start gap-3",
                m.card,
              ].join(" ")}
            >
              <span className={`mt-0.5 ${m.accent}`}>{m.icon}</span>
              <span className="text-sm flex-1 text-ink">{t.message}</span>
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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 21h20Z" />
      <path d="M12 10v5M12 18h.01" />
    </svg>
  );
}
function ErrIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}
