import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
} from "../api/habits";
import type { Frequency, Habit } from "../types/habit";
import { useToast } from "../components/Toast";

const ICONS = [
  "⭐", "🏃", "💧", "📚", "🧘", "💪", "🥗", "😴",
  "🎨", "🎵", "💻", "🌱", "🧹", "🪥", "☕", "📝",
  "🚴", "🧠", "🙏", "🔥",
];

const COLORS = [
  "#ff8a4d", "#f4628a", "#8e5fe5", "#5ec78a",
  "#f3c33d", "#60a5fa", "#fb7185", "#22d3ee",
];

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export default function HabitsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const habitsQuery = useQuery({ queryKey: ["habits"], queryFn: listHabits });
  const habits = habitsQuery.data?.habits ?? [];

  const reorder = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(orderedIds.map((id, idx) => updateHabit(id, { order: idx })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateHabit(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const removeHabit = useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast("Habitude supprimée.", "info");
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = habits.findIndex((h) => h.id === active.id);
    const newIdx = habits.findIndex((h) => h.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(habits, oldIdx, newIdx);
    qc.setQueryData(["habits"], { habits: reordered });
    reorder.mutate(reordered.map((h) => h.id));
  }

  return (
    <div className="space-y-4 stagger pt-2">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Habitudes</div>
          <h1 className="display text-[2rem] text-ink leading-none mt-1">
            Mes <span className="flourish">rituels</span>
          </h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          + Nouvelle
        </button>
      </header>

      {habitsQuery.isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      )}

      {!habitsQuery.isLoading && habits.length === 0 && (
        <div className="card card-tinted-peach p-8 text-center">
          <div className="text-4xl mb-2">🌿</div>
          <h3 className="display text-xl mb-1">Pas encore d'habitude</h3>
          <p className="text-sm text-ink-soft mb-4 max-w-sm mx-auto">
            Choisis quelque chose de petit, faisable tous les jours. Tu pourras toujours en ajouter d'autres.
          </p>
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            Créer
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {habits.map((h) => (
              <SortableHabit
                key={h.id}
                habit={h}
                onEdit={() => {
                  setEditing(h);
                  setShowModal(true);
                }}
                onDelete={() => removeHabit.mutate(h.id)}
                onToggleActive={() =>
                  toggleActive.mutate({ id: h.id, is_active: !h.is_active })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showModal && (
        <HabitModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            if (editing) {
              await updateHabit(editing.id, data);
              toast("Habitude mise à jour.", "success");
            } else {
              await createHabit(data);
              toast("Habitude créée 🌱", "success");
            }
            await qc.invalidateQueries({ queryKey: ["habits"] });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function SortableHabit({
  habit,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: habit.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card card-hover p-3 flex items-center gap-3 relative"
    >
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
        style={{ background: habit.color, opacity: 0.7 }}
      />
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted hover:text-ink px-1 pl-2"
        aria-label="drag"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${habit.color}26`, boxShadow: `inset 0 0 0 1px ${habit.color}3a` }}
      >
        {habit.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate leading-tight">{habit.name}</div>
        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
          <span className="chip">🔥 {habit.streak_current}</span>
          <span className="chip">⭐ {habit.streak_best}</span>
          <span className="chip capitalize">{habit.frequency}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconBtn onClick={onEdit} label="Modifier">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 20h4l10-10-4-4L4 16Z" /><path d="m13 6 5 5" />
          </svg>
        </IconBtn>
        <IconBtn onClick={onToggleActive} label={habit.is_active ? "Désactiver" : "Activer"}>
          {habit.is_active ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m3 3 18 18" /><path d="M10 6a10 10 0 0 1 11.5 6c-.4.9-1 1.8-1.8 2.5M6.6 6.6A11.6 11.6 0 0 0 2 12s4 7 10 7c1.4 0 2.7-.3 4-.8" />
            </svg>
          )}
        </IconBtn>
        <IconBtn onClick={onDelete} label="Supprimer" danger>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
          </svg>
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "w-8 h-8 rounded-lg flex items-center justify-center transition",
        danger
          ? "text-rose-400 hover:bg-rose-100"
          : "text-ink-soft hover:bg-peach-50 hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function HabitModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Habit | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    icon: string;
    color: string;
    frequency: Frequency;
    frequency_days: number[];
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "⭐");
  const [color, setColor] = useState(initial?.color ?? "#ff8a4d");
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "daily");
  const [days, setDays] = useState<number[]>(initial?.frequency_days ?? []);
  const [busy, setBusy] = useState(false);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        frequency,
        frequency_days: frequency === "custom" ? days : [],
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-paper border border-hairline rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">{initial ? "Édition" : "Création"}</div>
            <h3 className="display text-xl">
              {initial ? "Modifier" : "Nouvelle habitude"}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink w-9 h-9 rounded-full flex items-center justify-center hover:bg-peach-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m5 5 14 14M19 5 5 19" />
            </svg>
          </button>
        </div>

        <div>
          <label className="label">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input font-display text-[15px]"
            placeholder="Ex : Boire 2L d'eau"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Icône</label>
          <div className="grid grid-cols-10 gap-1.5">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={[
                  "aspect-square rounded-xl text-lg transition",
                  icon === i
                    ? "text-white shadow-[0_6px_14px_-6px_rgba(244,98,138,0.5)]"
                    : "bg-cream hover:bg-peach-50",
                ].join(" ")}
                style={icon === i ? { background: "var(--grad-sunrise)" } : undefined}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Couleur</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`color ${c}`}
                className={[
                  "w-9 h-9 rounded-full transition",
                  color === c ? "ring-2 ring-offset-2 ring-offset-paper ring-ink" : "",
                ].join(" ")}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Fréquence</label>
          <div className="grid grid-cols-3 gap-2">
            {(["daily", "weekly", "custom"] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={[
                  "py-2.5 rounded-xl text-sm font-medium capitalize transition",
                  frequency === f
                    ? "text-white shadow-md"
                    : "bg-cream hover:bg-peach-50 text-ink-soft",
                ].join(" ")}
                style={frequency === f ? { background: "var(--grad-sunrise)" } : undefined}
              >
                {f === "daily" ? "Quotidien" : f === "weekly" ? "Hebdo" : "Custom"}
              </button>
            ))}
          </div>
          {frequency === "custom" && (
            <div className="grid grid-cols-7 gap-1.5 mt-3">
              {DAY_LABELS.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={[
                    "py-2.5 rounded-xl text-sm transition",
                    days.includes(idx)
                      ? "text-white shadow-md"
                      : "bg-cream hover:bg-peach-50 text-ink-soft",
                  ].join(" ")}
                  style={days.includes(idx) ? { background: "var(--grad-sunrise)" } : undefined}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={busy || !name.trim()}
            className="btn-primary"
          >
            {busy ? "…" : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
